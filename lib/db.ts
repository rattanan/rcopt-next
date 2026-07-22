import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";
import { env } from "./env";

declare global {
  var rcoptDbPool: Pool | undefined;
}

export const db =
  globalThis.rcoptDbPool ??
  mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 5000,
  });

if (process.env.NODE_ENV !== "production") globalThis.rcoptDbPool = db;

export async function pingDatabase(): Promise<{ ok: true; latencyMs: number }> {
  const startedAt = performance.now();
  const [rows] = await db.query<RowDataPacket[]>("SELECT 1 AS ok");
  if (rows[0]?.ok !== 1) throw new Error("Database ping returned an unexpected result");
  return { ok: true, latencyMs: Math.round(performance.now() - startedAt) };
}
