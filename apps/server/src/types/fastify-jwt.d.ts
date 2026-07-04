import "@fastify/jwt";

/**
 * Padrão TS avançado: module augmentation.
 *
 * Por padrão, `request.user` do @fastify/jwt é tipado como `unknown`.
 * Estendendo a interface `FastifyJWT` (declarada pelo próprio plugin),
 * ensinamos o compilador o formato real do payload que assinamos em
 * auth.routes.ts — daí `request.user.sub` funciona com autocomplete e
 * checagem de tipo em qualquer rota protegida, sem cast manual.
 */
declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; email: string };
    user: { sub: string; email: string };
  }
}
