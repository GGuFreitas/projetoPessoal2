import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "./client.js";

/**
 * Migration runner caseiro (sem ORM/lib de migração).
 *
 * Lê os arquivos .sql de `migrations/` em ordem alfabética (por isso o
 * prefixo numérico: 0001_, 0002_...), aplica cada um dentro de uma
 * transação e registra o nome em `schema_migrations` para não reaplicar.
 * `.simple()` é necessário porque os arquivos podem ter mais de um
 * comando SQL (ex: `create extension` + `create table`) — o protocolo
 * "extended" padrão do postgres.js só aceita uma instrução por vez.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "migrations");

async function run() {
  await sql`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `;

  const appliedRows = await sql<{ name: string }[]>`select name from schema_migrations`;
  const applied = new Set(appliedRows.map((row) => row.name));

  const files = (await readdir(MIGRATIONS_DIR)).filter((file) => file.endsWith(".sql")).sort();

  const pending = files.filter((file) => !applied.has(file));
  if (pending.length === 0) {
    console.log("Nenhuma migration pendente.");
    await sql.end();
    return;
  }

  for (const file of pending) {
    console.log(`Aplicando ${file}...`);
    await sql.begin(async (tx) => {
      await tx.file(path.join(MIGRATIONS_DIR, file)).simple();
      await tx`insert into schema_migrations (name) values (${file})`;
    });
  }

  console.log("Migrations em dia.");
  await sql.end();
}

run().catch((error) => {
  console.error("Falha ao aplicar migrations:", error);
  process.exit(1);
});
