import { readFile } from "node:fs/promises";
import { Worker } from "bullmq";
import { PDFParse } from "pdf-parse";
import { connection } from "../connection.js";
import { extractBoletoData } from "../../lib/boleto-parser.js";
import * as contasRepository from "../../modules/contas/contas.repository.js";
import * as authRepository from "../../modules/auth/auth.repository.js";
import { enqueueJob } from "../index.js";
import type { BoletoProcessingJobData } from "../types.js";

export const boletoProcessingWorker = new Worker<BoletoProcessingJobData>(
  "boleto-processing",
  async (job) => {
    const { contaId, userId, filePath } = job.data;

    const buffer = await readFile(filePath);
    const parser = new PDFParse({ data: buffer });
    let text = "";
    try {
      const result = await parser.getText();
      text = result.text;
    } finally {
      await parser.destroy();
    }

    const extraido = extractBoletoData(text);

    const patch: Record<string, unknown> = {
      nome: extraido.linhaDigitavel ? "Boleto (revisar dados)" : "Boleto (não foi possível ler, preencha manualmente)",
    };
    if (extraido.linhaDigitavel) patch.linha_digitavel = extraido.linhaDigitavel;
    if (extraido.valorCentavos !== null) patch.valor_centavos = extraido.valorCentavos;
    if (extraido.vencimento) patch.vencimento = extraido.vencimento;

    await contasRepository.update(contaId, userId, patch);

    const user = await authRepository.findUserById(userId);
    if (!user?.telegram_chat_id) return;

    await enqueueJob({
      queue: "notifications",
      data: {
        type: "boleto_processado",
        userId,
        contaId,
        contaNome: String(patch.nome),
        telegramChatId: user.telegram_chat_id,
      },
    });
  },
  { connection, concurrency: 2 },
);
