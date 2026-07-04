import { z } from "zod";
import "dotenv/config";

/**
 * Padrão TS avançado: validação de env com Zod (fail-fast).
 *
 * Sem isso, um `process.env.JWT_SECRET` ausente só quebraria quando algo
 * tentasse assinar um token — em produção, potencialmente com uma exceção
 * confusa vinda de dentro do @fastify/jwt. Validando tudo aqui, o processo
 * nem sobe se a configuração estiver incompleta, e o resto do código usa
 * `env.JWT_SECRET` já tipado como `string` (não `string | undefined`).
 * Ver docs/ARQUITETURA.md > "TypeScript avançado".
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET precisa ter pelo menos 32 caracteres"),
  UPLOAD_DIR: z.string().default("./uploads"),
  TELEGRAM_BOT_TOKEN: z.string().min(1, "TELEGRAM_BOT_TOKEN é obrigatório"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variáveis de ambiente inválidas:");
  console.error(z.treeifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
