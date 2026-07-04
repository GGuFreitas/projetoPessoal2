import { Queue } from "bullmq";
import { connection } from "./connection.js";
import type { AppJob, BoletoProcessingJobData, NotificationJobData } from "./types.js";

export const boletoProcessingQueue = new Queue<BoletoProcessingJobData>("boleto-processing", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  },
});

export const notificationsQueue = new Queue<NotificationJobData>("notifications", {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 10_000 },
  },
});

/**
 * Ponto único de enfileiramento. O `switch` é exaustivo: se um dia surgir
 * uma terceira fila em `AppJob` e esquecermos de tratá-la aqui, o `satisfies
 * never` do `default` quebra a compilação em vez de falhar silenciosamente
 * em runtime.
 */
export async function enqueueJob(job: AppJob) {
  switch (job.queue) {
    case "boleto-processing":
      return boletoProcessingQueue.add(job.queue, job.data);
    case "notifications":
      return notificationsQueue.add(job.data.type, job.data);
    default:
      return job satisfies never;
  }
}
