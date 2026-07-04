import type { preHandlerHookHandler } from "fastify";

export const authGuard: preHandlerHookHandler = async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch {
    await reply.code(401).send({ message: "Não autenticado" });
  }
};
