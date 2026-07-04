import { registerContasCron } from "./contas.cron.js";

export function registerAllCrons() {
  registerContasCron();
  // Quando os módulos financas/compras ganharem lógica própria, os crons
  // deles entram aqui do mesmo jeito (ex: registerFinancasCron()).
}
