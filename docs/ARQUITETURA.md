# Arquitetura do OrganizaLar

## Visão geral

Monorepo (pnpm workspaces + Turborepo) com um monólito modular no backend e um único app Expo (mobile + web) no frontend.

```
apps/
  server/   Fastify + TypeScript, sem ORM (SQL direto via postgres.js)
  mobile/   Expo Router (mesma base de código para iOS/Android/Web)
packages/
  contracts/  Tipos e schemas (TypeBox) compartilhados entre server e mobile
  tsconfig/   tsconfig base compartilhado
```

Nesta primeira entrega, o módulo **contas** está completo (CRUD, cron de alerta, filas de processamento). Os módulos `financas` e `compras` existem só como abas de navegação vazias no app — a ideia é replicar o padrão do módulo `contas` neles conforme o projeto evoluir.

## Fluxo cron → fila → Telegram

O cron e a fila resolvem problemas diferentes e propositalmente não são fundidos num só mecanismo:

- **Cron (`node-cron`)** decide **o quê** fazer e **quando**. Todo dia às 08:00 (`apps/server/src/cron/contas.cron.ts`), ele pergunta ao banco "quais contas pendentes vencem em 3 dias?" e, para cada uma, apenas **enfileira** um job — não envia nada diretamente.
- **Fila (`BullMQ` + Redis)** decide **como entregar**, com retry e backoff. O worker de `notifications` (`apps/server/src/queues/workers/notifications.worker.ts`) consome o job, chama a API do Telegram e grava o resultado em `notifications_log`. Se o Telegram oscilar, o BullMQ tenta de novo automaticamente (backoff exponencial) sem travar o resto do app.

O mesmo padrão se repete no upload de boleto: a rota `POST /contas/upload-boleto` só salva o PDF em disco e enfileira um job em `boleto-processing` — quem lê o PDF, tenta extrair linha digitável/valor/vencimento (heurística via regex, nunca 100% garantida) e grava a conta como **rascunho** é o worker, em segundo plano. O usuário sempre revisa/confirma antes do valor virar "pendente" de verdade.

```
cron 08:00 ──> decide quais contas avisar ──> enqueue "notifications"
                                                      │
                                                      ▼
                                    worker: Telegram (retry/backoff) ──> notifications_log

upload PDF ──> salva arquivo + enqueue "boleto-processing"
                                                      │
                                                      ▼
                                    worker: extrai texto (pdf-parse) + regex ──> conta = 'rascunho'
```

## Schema do banco

Sem ORM — só SQL parametrizado via `postgres.js` (tagged templates `` sql`...${valor}` `` parametrizam automaticamente; ver `apps/server/src/db/client.ts`).

- **`users`**: `id`, `email`, `password_hash` (argon2), `telegram_chat_id` (nullable — só é preenchido depois que o usuário conecta o bot, ver README).
- **`contas`**: `valor_centavos` (bigint, nunca float), `status` (`rascunho` | `pendente` | `pago` | `atrasado`), `boleto_pdf_path`, `linha_digitavel`, `pix_copia_cola`. Índices em `(user_id, vencimento)` e `status`.
- **`notifications_log`**: histórico de envios (sucesso/falha) por conta, útil para depurar o comportamento de retry do BullMQ.
- Migrations em `apps/server/src/db/migrations/*.sql`, aplicadas por um runner caseiro (`apps/server/src/db/migrate.ts`) — sem lib de ORM/migração, só uma tabela `schema_migrations` e uma pasta de arquivos `.sql` numerados.

## TypeScript avançado usado neste projeto

Como é um projeto de estudo, os padrões "não óbvios" usados estão documentados aqui (e também como comentário no próprio arquivo onde aparecem):

1. **Branded type `Cents`** (`packages/contracts/src/money.ts`) — `number` sozinho não diferencia reais de centavos; `Cents` só é criado via `toCents`/`reaisToCents`, então um valor monetário "cru" não compila onde se espera `Cents`. Evita o clássico bug de somar float com centavos sem querer.
2. **TypeBox + `@fastify/type-provider-typebox`** (`apps/server/src/modules/*/*.routes.ts`) — o schema de validação da rota (`Type.Object(...)`) também é a fonte do tipo do `request.body`/`request.query`/`request.params`. Muda o schema, muda o tipo — sem manter uma interface TS separada do schema JSON.
3. **Union discriminada + `satisfies never`** (`apps/server/src/queues/types.ts` e `queues/index.ts`) — o payload de cada fila é diferenciado por um campo `type`/`queue`. O `switch` que trata cada variante termina num `default: return job satisfies never`, que quebra a compilação se um novo tipo de job for adicionado e esquecido em algum lugar.
4. **Zod fail-fast em `env.ts`** (`apps/server/src/env.ts`) — todas as variáveis de ambiente são validadas na subida do processo. Se faltar `JWT_SECRET`, por exemplo, o processo nem inicia — em vez de quebrar de forma confusa na primeira vez que alguém tentar assinar um token.
5. **Module augmentation do `@fastify/jwt`** (`apps/server/src/types/fastify-jwt.d.ts`) — estende a interface `FastifyJWT` do próprio plugin para que `request.user.sub`/`request.user.email` tenham tipo e autocomplete em qualquer rota protegida, sem cast manual.
6. **Type parsers customizados do `postgres.js`** (`apps/server/src/db/client.ts`) — o driver por padrão devolve `date` como `Date` (risco de "voltar um dia" por causa do fuso UTC-3) e `bigint` como `string`. Os parsers customizados corrigem os dois casos na borda, então o resto do código nunca lida com esse detalhe.

## Riscos conhecidos

| Área | Risco | Mitigação |
|---|---|---|
| Expo + pnpm | Metro não resolve módulo do workspace (`@organizalar/contracts`) | SDK 52+ detecta pnpm automaticamente; fallback: `nodeLinker: hoisted` em `pnpm-workspace.yaml` |
| `argon2` no Windows | Build nativo pode falhar sem MSVC/node-gyp | Trocar por `@node-rs/argon2` (prebuilds napi-rs) |
| `pdf-parse` | Só lê texto selecionável — boleto escaneado/foto vira texto vazio | Extração falha graciosamente; conta fica `rascunho` para preenchimento manual |
| BullMQ | Fila "trava" silenciosamente se Redis não estiver rodando | `docker compose up -d` antes de subir o server |
| Telegram | Bot não pode iniciar conversa — usuário precisa mandar `/start` primeiro | Documentado no README; cron/worker ignoram silenciosamente usuário sem `telegram_chat_id` |

## Próximos passos (fora do escopo desta entrega)

- Implementar os módulos `financas` e `compras` seguindo o mesmo padrão de `contas` (repository com SQL parametrizado, service, routes tipadas, cron/fila se fizer sentido).
- Se um dia o projeto for para produção "de verdade": adicionar build real (`tsc`/`tsup`) para `apps/server` em vez de rodar via `tsx`, e considerar mover upload de arquivos para armazenamento externo.
- Meta compartilhada em casal (mencionada na ideia original do projeto): exigiria relacionar duas contas de usuário a um mesmo recurso e, possivelmente, WebSockets para notificação em tempo real.
