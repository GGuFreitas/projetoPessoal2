import type { Conta, CreateContaInput, ListContasQueryInput, UpdateContaInput } from "@organizalar/contracts";
import { NotFoundError } from "../../lib/errors.js";
import * as contasRepository from "./contas.repository.js";

export async function list(userId: string, query: ListContasQueryInput): Promise<Conta[]> {
  const rows = await contasRepository.findMany(userId, { mes: query.mes, status: query.status });
  return rows.map(contasRepository.rowToConta);
}

export async function getById(userId: string, id: string): Promise<Conta> {
  const row = await contasRepository.findById(id, userId);
  if (!row) throw new NotFoundError("Conta não encontrada");
  return contasRepository.rowToConta(row);
}

export async function create(userId: string, input: CreateContaInput): Promise<Conta> {
  const row = await contasRepository.create(userId, input);
  return contasRepository.rowToConta(row);
}

/** Converte o corpo camelCase da API para as colunas snake_case do banco. */
function toDbPatch(input: UpdateContaInput): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  if (input.nome !== undefined) patch.nome = input.nome;
  if (input.valorCentavos !== undefined) patch.valor_centavos = input.valorCentavos;
  if (input.categoria !== undefined) patch.categoria = input.categoria;
  if (input.vencimento !== undefined) patch.vencimento = input.vencimento;
  if (input.status !== undefined) patch.status = input.status;
  if (input.recorrente !== undefined) patch.recorrente = input.recorrente;
  return patch;
}

export async function update(userId: string, id: string, input: UpdateContaInput): Promise<Conta> {
  const row = await contasRepository.update(id, userId, toDbPatch(input));
  if (!row) throw new NotFoundError("Conta não encontrada");
  return contasRepository.rowToConta(row);
}

export async function remove(userId: string, id: string): Promise<void> {
  const removed = await contasRepository.remove(id, userId);
  if (!removed) throw new NotFoundError("Conta não encontrada");
}

export async function createDraftFromUpload(userId: string, contaId: string, filePath: string): Promise<Conta> {
  const row = await contasRepository.createDraftFromUpload(contaId, userId, filePath);
  return contasRepository.rowToConta(row);
}
