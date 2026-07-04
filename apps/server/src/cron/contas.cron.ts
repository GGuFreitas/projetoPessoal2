import cron from "node-cron";
import { sql } from "../db/client.js";
import { enqueueJob } from "../queues/index.js";

type ContaVencendoRow = {
  id: string;
  user_id: string;
  nome: string;
  vencimento: string;
  valor_centavos: number;
  telegram_chat_id: string | null;
};

const TIMEZONE = "America/Sao_Paulo";

/**
 * O cron decide "o quê" (quais contas precisam de aviso hoje) e apenas
 * enfileira — quem decide "como entregar" (com retry se o Telegram
 * oscilar) é o worker da fila `notifications`. Ver docs/ARQUITETURA.md.
 */
export function registerContasCron() {
  // Todo dia às 08:00: avisa sobre contas pendentes que vencem em exatamente 3 dias.
  cron.schedule(
    "0 8 * * *",
    async () => {
      const contas = await sql<ContaVencendoRow[]>`
        select c.id, c.user_id, c.nome, c.vencimento, c.valor_centavos, u.telegram_chat_id
        from contas c
        join users u on u.id = c.user_id
        where c.status = 'pendente'
          and c.vencimento = (current_date + interval '3 days')::date
      `;

      for (const conta of contas) {
        if (!conta.telegram_chat_id) continue; // usuário ainda não conectou o Telegram (ver README)

        await enqueueJob({
          queue: "notifications",
          data: {
            type: "vencimento_proximo",
            userId: conta.user_id,
            contaId: conta.id,
            contaNome: conta.nome,
            vencimento: conta.vencimento,
            valorCentavos: conta.valor_centavos,
            telegramChatId: conta.telegram_chat_id,
          },
        });
      }
    },
    { timezone: TIMEZONE },
  );

  // Logo após a meia-noite: qualquer conta pendente com vencimento já passado vira "atrasado".
  cron.schedule(
    "10 0 * * *",
    async () => {
      await sql`
        update contas
        set status = 'atrasado', updated_at = now()
        where status = 'pendente' and vencimento < current_date
      `;
    },
    { timezone: TIMEZONE },
  );
}
