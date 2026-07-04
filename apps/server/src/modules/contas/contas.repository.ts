import { sql } from "../../db/client.js";
import type { Conta, ContaStatus } from "@organizalar/contracts";

export type ContaRow = {
  id: string;
  user_id: string;
  nome: string;
  valor_centavos: number;
  categoria: string;
  vencimento: string;
  status: ContaStatus;
  recorrente: boolean;
  boleto_pdf_path: string | null;
  linha_digitavel: string | null;
  pix_copia_cola: string | null;
  created_at: Date;
  updated_at: Date;
};

/** O banco usa snake_case, a API usa camelCase — este mapeador é a fronteira entre os dois. */
export function rowToConta(row: ContaRow): Conta {
  return {
    id: row.id,
    nome: row.nome,
    valorCentavos: row.valor_centavos,
    categoria: row.categoria,
    vencimento: row.vencimento,
    status: row.status,
    recorrente: row.recorrente,
    boletoPdfPath: row.boleto_pdf_path,
    linhaDigitavel: row.linha_digitavel,
    pixCopiaCola: row.pix_copia_cola,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function findMany(
  userId: string,
  filters: { mes?: string; status?: ContaStatus },
): Promise<ContaRow[]> {
  return sql<ContaRow[]>`
    select * from contas
    where user_id = ${userId}
    ${filters.status ? sql`and status = ${filters.status}` : sql``}
    ${filters.mes ? sql`and to_char(vencimento, 'YYYY-MM') = ${filters.mes}` : sql``}
    order by vencimento asc
  `;
}

export async function findById(id: string, userId: string): Promise<ContaRow | undefined> {
  const rows = await sql<ContaRow[]>`
    select * from contas where id = ${id} and user_id = ${userId}
  `;
  return rows[0];
}

export async function create(
  userId: string,
  input: { nome: string; valorCentavos: number; categoria: string; vencimento: string; recorrente?: boolean },
): Promise<ContaRow> {
  const rows = await sql<ContaRow[]>`
    insert into contas (user_id, nome, valor_centavos, categoria, vencimento, recorrente)
    values (
      ${userId}, ${input.nome}, ${input.valorCentavos},
      ${input.categoria}, ${input.vencimento}, ${input.recorrente ?? false}
    )
    returning *
  `;
  const conta = rows[0];
  if (!conta) throw new Error("Falha ao criar conta");
  return conta;
}

/**
 * `patch` deve conter chaves em snake_case (nomes reais das colunas) — quem
 * traduz camelCase -> snake_case é o contas.service.ts, nunca o cliente da API
 * diretamente. Passamos os nomes de coluna explicitamente para `sql()` (em
 * vez de deixar implícito) seguindo o padrão documentado do postgres.js para
 * UPDATE dinâmico.
 */
export async function update(
  id: string,
  userId: string,
  patch: Record<string, unknown>,
): Promise<ContaRow | undefined> {
  const columns = Object.keys(patch);
  if (columns.length === 0) return findById(id, userId);

  const rows = await sql<ContaRow[]>`
    update contas set ${sql(patch, ...columns)}, updated_at = now()
    where id = ${id} and user_id = ${userId}
    returning *
  `;
  return rows[0];
}

export async function remove(id: string, userId: string): Promise<boolean> {
  const rows = await sql`
    delete from contas where id = ${id} and user_id = ${userId} returning id
  `;
  return rows.length > 0;
}

/** Cria a conta em status 'rascunho' assim que o PDF é recebido; o worker preenche o resto depois. */
export async function createDraftFromUpload(id: string, userId: string, filePath: string): Promise<ContaRow> {
  const rows = await sql<ContaRow[]>`
    insert into contas (id, user_id, nome, valor_centavos, categoria, vencimento, status, boleto_pdf_path)
    values (${id}, ${userId}, 'Boleto em processamento', 0, 'boleto', current_date, 'rascunho', ${filePath})
    returning *
  `;
  const conta = rows[0];
  if (!conta) throw new Error("Falha ao criar rascunho de boleto");
  return conta;
}
