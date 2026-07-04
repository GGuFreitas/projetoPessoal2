import argon2 from "argon2";

/**
 * Hash de senha com argon2 (vencedor da Password Hashing Competition,
 * recomendado sobre bcrypt/scrypt para projetos novos). Se `pnpm install`
 * falhar compilando o binding nativo no Windows (precisa de MSVC/node-gyp),
 * troque por `@node-rs/argon2`, que tem a mesma ideia (hash/verify) mas usa
 * prebuilds napi-rs — ver docs/ARQUITETURA.md > "Riscos conhecidos".
 */
export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain);
}

export function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain);
}
