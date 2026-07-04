# OrganizaLar

Central pessoal de organização financeira doméstica: contas a pagar, metas de economia e lista de compras — projeto de estudo de Node/Fastify, cron jobs, filas (BullMQ) e TypeScript avançado.

Nesta primeira entrega, o módulo **contas** está completo (CRUD, alerta de vencimento por cron, leitura automática de boleto PDF via fila). Os módulos `financas` e `compras` são apenas abas de navegação vazias por enquanto.

Veja `docs/ARQUITETURA.md` para entender a estrutura, o fluxo cron → fila → Telegram e os padrões de TypeScript avançado usados.

## Pré-requisitos

- Node.js 20+
- Docker (Postgres e Redis rodam localmente via `docker compose`)
- Um app do Telegram (para receber os alertas)

## Setup

```bash
# 1. Habilita o pnpm via corepack (já vem com o Node)
corepack enable
corepack use pnpm@latest

# 2. Instala as dependências de todo o monorepo
pnpm install

# 3. Sobe Postgres e Redis locais
docker compose up -d

# 4. Configura as variáveis de ambiente
cp apps/server/.env.example apps/server/.env
cp apps/mobile/.env.example apps/mobile/.env
# edite apps/server/.env: gere um JWT_SECRET aleatório (openssl rand -hex 32)

# 5. Aplica as migrations
pnpm db:migrate
```

## Configurando o Telegram

O bot avisa sobre contas vencendo e sobre boletos processados.

1. No Telegram, converse com **@BotFather** e crie um bot (`/newbot`). Copie o token gerado.
2. Coloque o token em `apps/server/.env` na variável `TELEGRAM_BOT_TOKEN`.
3. Envie **`/start`** para o seu bot (bots do Telegram não podem iniciar conversa — sem isso ele não consegue te mandar mensagem).
4. Descubra seu `chat_id` acessando no navegador:
   `https://api.telegram.org/bot<SEU_TOKEN>/getUpdates`
   (o campo `message.chat.id` do JSON retornado é o seu `chat_id`).
5. Com o servidor rodando e já logado no app, salve o `chat_id` via:
   ```bash
   curl -X PATCH http://localhost:3333/auth/me \
     -H "Authorization: Bearer <SEU_TOKEN_JWT>" \
     -H "Content-Type: application/json" \
     -d '{"telegramChatId": "<SEU_CHAT_ID>"}'
   ```
   (ou, futuramente, por uma tela de perfil no app).

## Rodando em desenvolvimento

```bash
# Server (Fastify) + workers de fila + cron, tudo num processo
pnpm dev:server

# App Expo (escolha mobile ou web na hora, ou pressione "w" no terminal)
pnpm dev:mobile

# Ou os dois juntos
pnpm dev
```

- Web: abre automaticamente em `http://localhost:8081` (ou a porta que o Expo indicar).
- Mobile: escaneie o QR code com o app **Expo Go**, ou rode num emulador (`pnpm --filter @organizalar/mobile android`).
- No emulador Android, troque `EXPO_PUBLIC_API_URL` em `apps/mobile/.env` para `http://10.0.2.2:3333`. No celular físico, use o IP da sua máquina na rede local.

## Verificação rápida (sem abrir o app)

```bash
# Cria um usuário
curl -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"voce@exemplo.com","password":"senha12345"}'

# Cria uma conta (use o token retornado acima)
curl -X POST http://localhost:3333/contas \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Conta de luz","valorCentavos":12000,"categoria":"Luz","vencimento":"2026-07-10"}'

# Lista as contas
curl http://localhost:3333/contas -H "Authorization: Bearer <TOKEN>"
```

## Scripts úteis (raiz do monorepo)

| Comando | O que faz |
|---|---|
| `pnpm dev` | Sobe server + mobile juntos (via Turborepo) |
| `pnpm dev:server` | Só o backend |
| `pnpm dev:mobile` | Só o Expo |
| `pnpm db:migrate` | Aplica migrations pendentes no Postgres |
| `pnpm type-check` | `tsc --noEmit` em todos os workspaces |

## Estrutura do projeto

Ver `docs/ARQUITETURA.md` para a árvore completa e as decisões técnicas (por que sem ORM, por que cron e fila são conceitos separados, etc.).
