import { z } from "zod";

const envSchema = z.object({
  DB_HOST: z.string().default("127.0.0.1"),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().default("rcopt_user"),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string().default("rcopt"),
  LEGACY_ASSET_BASE_URL: z.string().url().or(z.literal("")).default("https://www.rcopt.org"),
  LEGACY_UPLOAD_PATH: z.string().default(""),
  ADMIN_WRITE_ENABLED: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  ADMIN_SESSION_STORE_PATH: z.string().default(".runtime/admin-sessions.json"),
  ADMIN_LOGIN_RATE_LIMIT_STORE_PATH: z.string().default(".runtime/admin-login-rate-limits.json"),
});

export const env = envSchema.parse({
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  LEGACY_ASSET_BASE_URL: process.env.LEGACY_ASSET_BASE_URL,
  LEGACY_UPLOAD_PATH: process.env.LEGACY_UPLOAD_PATH,
  ADMIN_WRITE_ENABLED: process.env.ADMIN_WRITE_ENABLED,
  ADMIN_SESSION_STORE_PATH: process.env.ADMIN_SESSION_STORE_PATH,
  ADMIN_LOGIN_RATE_LIMIT_STORE_PATH: process.env.ADMIN_LOGIN_RATE_LIMIT_STORE_PATH,
});
