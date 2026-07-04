import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import { TypeBoxTypeProvider, TypeBoxValidatorCompiler } from "@fastify/type-provider-typebox";
import { env } from "./env.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { contasRoutes } from "./modules/contas/contas.routes.js";

export async function buildApp() {
  const app = Fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();
  app.setValidatorCompiler(TypeBoxValidatorCompiler);

  await app.register(cors, { origin: true });
  await app.register(jwt, { secret: env.JWT_SECRET });
  await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });

  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(contasRoutes, { prefix: "/contas" });

  app.get("/health", async () => ({ status: "ok" }));

  return app;
}
