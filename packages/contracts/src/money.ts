/**
 * Padrão TS avançado: "branded type".
 *
 * `number` sozinho não diferencia "reais", "centavos" ou "quantidade de itens" —
 * o compilador deixaria passar `precoEmReais + valorEmCentavos` sem reclamar.
 * Marcando `Cents` com um símbolo único que não existe em runtime, um `number`
 * comum deixa de ser aceito onde se espera `Cents`: só passa por `toCents`/
 * `reaisToCents`, então todo valor monetário que circula pelo app já nasceu
 * validado como inteiro. Ver docs/ARQUITETURA.md > "TypeScript avançado".
 */
declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };

export type Cents = Brand<number, "Cents">;

export function toCents(value: number): Cents {
  if (!Number.isInteger(value)) {
    throw new Error(`Cents precisa ser um inteiro, recebido: ${value}`);
  }
  return value as Cents;
}

export function reaisToCents(reais: number): Cents {
  return Math.round(reais * 100) as Cents;
}

export function centsToReais(cents: Cents): number {
  return cents / 100;
}

export function formatBRL(cents: Cents): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centsToReais(cents));
}
