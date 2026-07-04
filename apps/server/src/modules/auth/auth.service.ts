import { ConflictError, UnauthorizedError } from "../../lib/errors.js";
import * as authRepository from "./auth.repository.js";
import { hashPassword, verifyPassword } from "./password.js";
import type { UserRow } from "./auth.repository.js";

export async function register(email: string, password: string): Promise<UserRow> {
  const existing = await authRepository.findUserByEmail(email);
  if (existing) throw new ConflictError("Já existe uma conta com este email");

  const passwordHash = await hashPassword(password);
  return authRepository.createUser(email, passwordHash);
}

export async function login(email: string, password: string): Promise<UserRow> {
  const user = await authRepository.findUserByEmail(email);
  if (!user) throw new UnauthorizedError("Email ou senha inválidos");

  const valid = await verifyPassword(user.password_hash, password);
  if (!valid) throw new UnauthorizedError("Email ou senha inválidos");

  return user;
}

export function toPublicUser(user: UserRow) {
  return {
    id: user.id,
    email: user.email,
    telegramChatId: user.telegram_chat_id,
  };
}

export async function updateTelegramChatId(userId: string, telegramChatId: string): Promise<UserRow> {
  return authRepository.updateTelegramChatId(userId, telegramChatId);
}
