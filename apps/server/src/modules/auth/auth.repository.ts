import { sql } from "../../db/client.js";

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  telegram_chat_id: string | null;
  created_at: Date;
};

export async function findUserByEmail(email: string): Promise<UserRow | undefined> {
  const rows = await sql<UserRow[]>`
    select * from users where email = ${email}
  `;
  return rows[0];
}

export async function findUserById(id: string): Promise<UserRow | undefined> {
  const rows = await sql<UserRow[]>`
    select * from users where id = ${id}
  `;
  return rows[0];
}

export async function createUser(email: string, passwordHash: string): Promise<UserRow> {
  const rows = await sql<UserRow[]>`
    insert into users (email, password_hash)
    values (${email}, ${passwordHash})
    returning *
  `;
  const user = rows[0];
  if (!user) throw new Error("Falha ao criar usuário");
  return user;
}

export async function updateTelegramChatId(userId: string, telegramChatId: string): Promise<UserRow> {
  const rows = await sql<UserRow[]>`
    update users set telegram_chat_id = ${telegramChatId}
    where id = ${userId}
    returning *
  `;
  const user = rows[0];
  if (!user) throw new Error("Usuário não encontrado");
  return user;
}
