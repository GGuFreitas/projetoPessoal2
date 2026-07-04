import type { FastifyInstance } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { AuthResponse, LoginBody, RegisterBody, UpdateMeBody } from "@organizalar/contracts";
import { authGuard } from "./auth.plugin.js";
import * as authService from "./auth.service.js";
import { NotFoundError } from "../../lib/errors.js";
import * as authRepository from "./auth.repository.js";

export async function authRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();

  app.post(
    "/register",
    { schema: { body: RegisterBody, response: { 201: AuthResponse } } },
    async (request, reply) => {
      const user = await authService.register(request.body.email, request.body.password);
      const token = app.jwt.sign({ sub: user.id, email: user.email });
      return reply.code(201).send({ token, user: authService.toPublicUser(user) });
    },
  );

  app.post(
    "/login",
    { schema: { body: LoginBody, response: { 200: AuthResponse } } },
    async (request, reply) => {
      const user = await authService.login(request.body.email, request.body.password);
      const token = app.jwt.sign({ sub: user.id, email: user.email });
      return reply.code(200).send({ token, user: authService.toPublicUser(user) });
    },
  );

  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", authGuard);

    protectedRoutes.get("/me", { schema: { response: { 200: AuthResponse.properties.user } } }, async (request) => {
      const user = await authRepository.findUserById(request.user.sub);
      if (!user) throw new NotFoundError("Usuário não encontrado");
      return authService.toPublicUser(user);
    });

    protectedRoutes.patch(
      "/me",
      { schema: { body: UpdateMeBody, response: { 200: AuthResponse.properties.user } } },
      async (request) => {
        if (!request.body.telegramChatId) {
          const user = await authRepository.findUserById(request.user.sub);
          if (!user) throw new NotFoundError("Usuário não encontrado");
          return authService.toPublicUser(user);
        }
        const user = await authService.updateTelegramChatId(request.user.sub, request.body.telegramChatId);
        return authService.toPublicUser(user);
      },
    );
  });
}
