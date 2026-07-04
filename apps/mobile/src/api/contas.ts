import type { Conta, CreateContaInput, ListContasQueryInput, UpdateContaInput } from "@organizalar/contracts";
import { apiFetch, apiUpload } from "./client.js";

export function listContas(query: ListContasQueryInput = {}) {
  const params = new URLSearchParams();
  if (query.mes) params.set("mes", query.mes);
  if (query.status) params.set("status", query.status);
  const qs = params.toString();
  return apiFetch<Conta[]>(`/contas${qs ? `?${qs}` : ""}`);
}

export function getConta(id: string) {
  return apiFetch<Conta>(`/contas/${id}`);
}

export function createConta(input: CreateContaInput) {
  return apiFetch<Conta>("/contas", { method: "POST", body: input });
}

export function updateConta(id: string, input: UpdateContaInput) {
  return apiFetch<Conta>(`/contas/${id}`, { method: "PATCH", body: input });
}

export function deleteConta(id: string) {
  return apiFetch<void>(`/contas/${id}`, { method: "DELETE" });
}

export function uploadBoleto(file: { uri: string; name: string; mimeType: string }) {
  return apiUpload<Conta>("/contas/upload-boleto", file);
}
