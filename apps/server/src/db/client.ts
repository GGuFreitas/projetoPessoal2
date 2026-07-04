import postgres from "postgres";
import { env } from "../env.js";

/**
 * Cliente postgres.js. Toda query aqui é escrita com a tagged template
 * `sql\`...${valor}...\`` — os valores interpolados são SEMPRE enviados como
 * parâmetros ($1, $2...) para o driver, nunca concatenados na string. Isso
 * torna SQL injection estruturalmente difícil: para "escapar" desse
 * comportamento seria preciso chamar explicitamente `sql.unsafe(...)`, algo
 * que nenhum código deste projeto faz. Ver docs/ARQUITETURA.md.
 *
 * Dois type parsers customizados corrigem comportamentos default do driver
 * que não combinam com este projeto:
 * - `date` (OID 1082): o Postgres não guarda timezone em `date`. O parser
 *   default do postgres.js devolve um `Date` em UTC 00:00, que ao formatar
 *   em horário do Brasil (UTC-3) pode "voltar" um dia. Devolvendo a string
 *   crua (YYYY-MM-DD) evitamos esse bug de fuso horário inteiramente.
 * - `int8`/bigint (OID 20): usado em `valor_centavos`. O driver devolve
 *   string por padrão (para não perder precisão em números gigantes), mas
 *   nossos valores monetários cabem com folga em `Number` — convertendo
 *   aqui, evitamos que uma string "vaze" para a API em vez de um inteiro.
 */
export const sql = postgres(env.DATABASE_URL, {
  types: {
    date: {
      to: 1082,
      from: [1082],
      serialize: (value: string) => value,
      parse: (value: string) => value,
    },
    bigint: {
      to: 20,
      from: [20],
      serialize: (value: number) => String(value),
      parse: (value: string) => Number(value),
    },
  },
});
