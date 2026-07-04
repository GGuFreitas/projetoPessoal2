/**
 * Padrão TS avançado: union discriminada para payload de fila.
 *
 * Cada job de `notifications` carrega um campo `type` que diz qual variante
 * de dado ele tem — o TS estreita automaticamente o tipo dentro de um
 * `switch (job.data.type)`, então o worker não precisa (nem consegue) ler um
 * campo que não existe naquela variante. `AppJob` faz o mesmo em outro
 * nível: o par `queue`/`data` é sempre consistente, então `enqueueJob` não
 * deixa passar `{ queue: 'notifications', data: <payload de boleto> }`.
 */
export type BoletoProcessingJobData = {
  contaId: string;
  userId: string;
  filePath: string;
};

export type NotificationJobData =
  | {
      type: "vencimento_proximo";
      userId: string;
      contaId: string;
      contaNome: string;
      vencimento: string;
      valorCentavos: number;
      telegramChatId: string;
    }
  | {
      type: "boleto_processado";
      userId: string;
      contaId: string;
      contaNome: string;
      telegramChatId: string;
    };

export type AppJob =
  | { queue: "boleto-processing"; data: BoletoProcessingJobData }
  | { queue: "notifications"; data: NotificationJobData };
