import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import path from "node:path";
import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { env } from "@/lib/env";

type Captcha = { answerHash: string; addressHash: string; expiresAt: number };
type CaptchaFile = { version: 1; items: Record<string, Captcha> };
let writes: Promise<void> = Promise.resolve();
const hash = (value: string) => createHash("sha256").update(value, "utf8").digest("hex");
const empty = (): CaptchaFile => ({ version: 1, items: {} });
async function read(file: string): Promise<CaptchaFile> { try { const value: unknown = JSON.parse(await readFile(file, "utf8")); const parsed = value as Partial<CaptchaFile>; return parsed.version === 1 && parsed.items && typeof parsed.items === "object" ? { version: 1, items: parsed.items } : empty(); } catch { return empty(); } }
async function write(file: string, value: CaptchaFile): Promise<void> { const directory = path.dirname(file); await mkdir(directory, { recursive: true, mode: 0o700 }); const temp = path.join(directory, `.${path.basename(file)}.${randomBytes(6).toString("hex")}.tmp`); await writeFile(temp, `${JSON.stringify(value)}\n`, { mode: 0o600 }); await rename(temp, file); await chmod(file, 0o600); }
async function mutate<T>(fn: (value: CaptchaFile, now: number) => T): Promise<T> { let result!: T; writes = writes.then(async () => { const file = path.resolve(env.COMMUNITY_CAPTCHA_STORE_PATH); const value = await read(file); const now = Date.now(); for (const [key, item] of Object.entries(value.items)) if (item.expiresAt <= now) delete value.items[key]; result = fn(value, now); await write(file, value); }); await writes; return result; }
export async function createCommunityCaptcha(address: string): Promise<{ token: string; question: string }> { const left = 2 + Math.floor(Math.random() * 8); const right = 2 + Math.floor(Math.random() * 8); const token = randomBytes(32).toString("base64url"); await mutate((value, now) => { value.items[hash(token)] = { answerHash: hash(`${token}:${left + right}`), addressHash: hash(address), expiresAt: now + 10 * 60_000 }; }); return { token, question: `${left} + ${right} = ?` }; }
export async function verifyCommunityCaptcha(token: string, answer: string, address: string): Promise<boolean> { if (!/^[A-Za-z0-9_-]{43}$/u.test(token) || !/^\d{1,2}$/u.test(answer.trim())) return false; return mutate((value) => { const key = hash(token); const item = value.items[key]; delete value.items[key]; if (!item || item.addressHash !== hash(address)) return false; const expected = Buffer.from(item.answerHash, "utf8"); const received = Buffer.from(hash(`${token}:${answer.trim()}`), "utf8"); return expected.length === received.length && timingSafeEqual(expected, received); }); }
