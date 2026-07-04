import IORedis from "ioredis";
import { env } from "../env.js";

// `maxRetriesPerRequest: null` é exigido pelo BullMQ (ele mesmo controla
// retry/bloqueio das conexões usadas por filas e workers).
export const connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });
