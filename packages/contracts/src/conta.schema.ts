import { Type, type Static } from "@sinclair/typebox";

export const ContaStatus = Type.Union([
  Type.Literal("rascunho"),
  Type.Literal("pendente"),
  Type.Literal("pago"),
  Type.Literal("atrasado"),
]);
export type ContaStatus = Static<typeof ContaStatus>;

/**
 * Formato "API" da conta: sempre camelCase e valores em centavos (inteiro).
 * O banco usa snake_case (valor_centavos) — o repository do server é
 * responsável por mapear linha do banco -> este formato (rowToConta).
 */
export const ContaSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  nome: Type.String({ minLength: 1 }),
  valorCentavos: Type.Integer({ minimum: 0 }),
  categoria: Type.String(),
  vencimento: Type.String({ format: "date" }),
  status: ContaStatus,
  recorrente: Type.Boolean(),
  boletoPdfPath: Type.Union([Type.String(), Type.Null()]),
  linhaDigitavel: Type.Union([Type.String(), Type.Null()]),
  pixCopiaCola: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});
export type Conta = Static<typeof ContaSchema>;

export const CreateContaBody = Type.Object({
  nome: Type.String({ minLength: 1 }),
  valorCentavos: Type.Integer({ minimum: 0 }),
  categoria: Type.String({ minLength: 1 }),
  vencimento: Type.String({ format: "date" }),
  recorrente: Type.Optional(Type.Boolean()),
});
export type CreateContaInput = Static<typeof CreateContaBody>;

export const UpdateContaBody = Type.Partial(
  Type.Object({
    nome: Type.String({ minLength: 1 }),
    valorCentavos: Type.Integer({ minimum: 0 }),
    categoria: Type.String({ minLength: 1 }),
    vencimento: Type.String({ format: "date" }),
    status: ContaStatus,
    recorrente: Type.Boolean(),
  }),
);
export type UpdateContaInput = Static<typeof UpdateContaBody>;

export const ListContasQuery = Type.Object({
  mes: Type.Optional(Type.String({ pattern: "^\\d{4}-\\d{2}$" })),
  status: Type.Optional(ContaStatus),
});
export type ListContasQueryInput = Static<typeof ListContasQuery>;

export const ContaParams = Type.Object({
  id: Type.String({ format: "uuid" }),
});
