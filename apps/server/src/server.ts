import { buildApp } from "./app.js";
import { env } from "./env.js";
import { registerAllCrons } from "./cron/index.js";
// Importados pelo efeito colateral: instanciar um `Worker` já começa a
// consumir a fila correspondente.
import "./queues/workers/boleto-processing.worker.js";
import "./queues/workers/notifications.worker.js";

const app = await buildApp();

await app.listen({ port: env.PORT, host: "0.0.0.0" });
registerAllCrons();

app.log.info("Cron jobs e workers de fila registrados.");
