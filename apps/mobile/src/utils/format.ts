import type { ContaStatus } from "@organizalar/contracts";
import { formatBRL, toCents } from "@organizalar/contracts";

export function formatMoney(valorCentavos: number): string {
  return formatBRL(toCents(valorCentavos));
}

export function formatDateBR(isoDate: string): string {
  const [ano, mes, dia] = isoDate.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** YYYY-MM-DD local (sem passar por Date/UTC, para não "voltar" um dia). */
function todayIso(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function venceEstaSemanaTodo(vencimento: string): boolean {
  const hoje = todayIso();
  const emSeteDias = addDaysIso(hoje, 7);
  return vencimento >= hoje && vencimento <= emSeteDias;
}

const CORES: Record<ContaStatus, string> = {
  pago: "#22c55e",
  atrasado: "#ef4444",
  rascunho: "#9ca3af",
  pendente: "#64748b",
};

export function corDaConta(status: ContaStatus, vencimento: string): string {
  if (status === "pendente" && venceEstaSemanaTodo(vencimento)) return "#f59e0b";
  return CORES[status];
}
