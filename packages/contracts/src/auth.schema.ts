import { Type, type Static } from "@sinclair/typebox";

export const RegisterBody = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 8 }),
});
export type RegisterInput = Static<typeof RegisterBody>;

export const LoginBody = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 1 }),
});
export type LoginInput = Static<typeof LoginBody>;

export const AuthResponse = Type.Object({
  token: Type.String(),
  user: Type.Object({
    id: Type.String({ format: "uuid" }),
    email: Type.String(),
    telegramChatId: Type.Union([Type.String(), Type.Null()]),
  }),
});
export type AuthResponseBody = Static<typeof AuthResponse>;

export const UpdateMeBody = Type.Object({
  telegramChatId: Type.Optional(Type.String({ minLength: 1 })),
});
export type UpdateMeInput = Static<typeof UpdateMeBody>;
