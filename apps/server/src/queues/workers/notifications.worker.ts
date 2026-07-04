import { Worker } from "bullmq";
import { formatBRL, toCents } from "@organizalar/contracts";
import { connection } from "../connection.js";
import { sql } from "../../db/client.js";
import { sendTelegramMessage } from "../../lib/telegram.js";
import type { NotificationJobData } from "../types.js";

function formatDataBR(isoDate: string): string {
  const [ano, mes, dia] = isoDate.split("-");
  return `${dia}/${mes}/${ano}`;
}

function buildMessage(data: NotificationJobData): string {
  switch (data.type) {
    case "vencimento_proximo":
      return (
        `⚠️ <b>${data.contaNome}</b> vence em ${formatDataBR(data.vencimento)} ` +
        `(valor: ${formatBRL(toCents(data.valorCentavos))}). Deseja pagar agora?`
      );
    case "boleto_processado":
      return `✅ Boleto processado: <b>${data.contaNome}</b>. Confira os dados extraídos antes de confirmar o pagamento.`;
    default:
      return data satisfies never;
  }
}

export const notificationsWorker = new Worker<NotificationJobData>(
  "notifications",
  async (job) => {
    const message = buildMessage(job.data);
    await sendTelegramMessage(job.data.telegramChatId, message);

    await sql`
      insert into notifications_log (conta_id, canal, status, tentativas)
      values (${job.data.contaId}, 'telegram', 'enviado', ${job.attemptsMade + 1})
    `;
  },
  { connection, concurrency: 2 },
);

// Só registra "falhou" quando o BullMQ já esgotou todas as tentativas de
// retry configuradas na fila (defaultJobOptions.attempts) — falhas
// intermediárias (que ainda vão ser retentadas) não geram log, para não
// poluir `notifications_log` com entradas que na prática deram certo depois.
notificationsWorker.on("failed", async (job) => {
  if (!job) return;
  const attempts = job.opts.attempts ?? 1;
  if (job.attemptsMade < attempts) return;

  await sql`
    insert into notifications_log (conta_id, canal, status, tentativas)
    values (${job.data.contaId}, 'telegram', 'falhou', ${job.attemptsMade})
  `;
});
