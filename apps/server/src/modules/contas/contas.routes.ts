import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import {
  ContaParams,
  ContaSchema,
  CreateContaBody,
  ListContasQuery,
  UpdateContaBody,
} from "@organizalar/contracts";
import { env } from "../../env.js";
import { authGuard } from "../auth/auth.plugin.js";
import * as contasService from "./contas.service.js";
import { enqueueJob } from "../../queues/index.js";

export async function contasRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<TypeBoxTypeProvider>();
  app.addHook("preHandler", authGuard);

  app.get("/", { schema: { querystring: ListContasQuery, response: { 200: Type.Array(ContaSchema) } } }, async (request) => {
    return contasService.list(request.user.sub, request.query);
  });

  app.post("/", { schema: { body: CreateContaBody, response: { 201: ContaSchema } } }, async (request, reply) => {
    const conta = await contasService.create(request.user.sub, request.body);
    return reply.code(201).send(conta);
  });

  app.get("/:id", { schema: { params: ContaParams, response: { 200: ContaSchema } } }, async (request) => {
    return contasService.getById(request.user.sub, request.params.id);
  });

  app.patch(
    "/:id",
    { schema: { params: ContaParams, body: UpdateContaBody, response: { 200: ContaSchema } } },
    async (request) => {
      return contasService.update(request.user.sub, request.params.id, request.body);
    },
  );

  app.delete("/:id", { schema: { params: ContaParams, response: { 204: Type.Null() } } }, async (request, reply) => {
    await contasService.remove(request.user.sub, request.params.id);
    return reply.code(204).send();
  });

  // Sem `schema.body` aqui de propósito: declarar um schema de body nesta rota
  // conflita com o parser do @fastify/multipart. Validação é manual abaixo.
  app.post("/upload-boleto", { schema: { response: { 202: ContaSchema } } }, async (request, reply) => {
    const data = await request.file();
    if (!data || data.mimetype !== "application/pdf") {
      return reply.code(400).send({ message: "Envie um arquivo PDF" });
    }

    const userId = request.user.sub;
    const contaId = randomUUID();
    const dir = path.join(env.UPLOAD_DIR, userId);
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, `${contaId}.pdf`);
    await pipeline(data.file, createWriteStream(filePath));

    const conta = await contasService.createDraftFromUpload(userId, contaId, filePath);
    await enqueueJob({ queue: "boleto-processing", data: { contaId, userId, filePath } });

    return reply.code(202).send(conta);
  });
}
