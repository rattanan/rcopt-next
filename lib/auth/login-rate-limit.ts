import { createHash, randomBytes } from "node:crypto";
import path from "node:path";
import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";

type Attempt = { failures: number; resetAt: number };
type RateLimitFile = { version: 1; attempts: Record<string, Attempt> };
let writeQueue: Promise<void> = Promise.resolve();

function keyFor(value: string): string { return createHash("sha256").update(value, "utf8").digest("hex"); }
function emptyFile(): RateLimitFile { return { version: 1, attempts: {} }; }
async function readStore(storePath: string): Promise<RateLimitFile> { try { const parsed: unknown = JSON.parse(await readFile(storePath, "utf8")); if (!parsed || typeof parsed !== "object") return emptyFile(); const file = parsed as Partial<RateLimitFile>; return file.version === 1 && file.attempts && typeof file.attempts === "object" ? { version: 1, attempts: file.attempts } : emptyFile(); } catch { return emptyFile(); } }
async function writeStore(storePath: string, store: RateLimitFile): Promise<void> { const directory = path.dirname(storePath); await mkdir(directory, { recursive: true, mode: 0o700 }); const temporary = path.join(directory, `.${path.basename(storePath)}.${randomBytes(8).toString("hex")}.tmp`); await writeFile(temporary, `${JSON.stringify(store)}\n`, { encoding: "utf8", mode: 0o600 }); await rename(temporary, storePath); await chmod(storePath, 0o600); }
async function mutateStore<T>(storePath: string, mutate: (store: RateLimitFile, now: number) => T): Promise<T> { let result!: T; writeQueue = writeQueue.then(async () => { const store = await readStore(storePath); const now = Date.now(); for (const [key, value] of Object.entries(store.attempts)) if (!Number.isFinite(value.resetAt) || value.resetAt <= now) delete store.attempts[key]; result = mutate(store, now); await writeStore(storePath, store); }); await writeQueue; return result; }

export class FileLoginRateLimiter {
  constructor(private readonly storePath: string, private readonly maximumFailures = 5, private readonly windowMs = 15 * 60_000) {}

  async allowed(subject: string): Promise<boolean> { const store = await readStore(this.storePath); const attempt = store.attempts[keyFor(subject)]; return !attempt || attempt.resetAt <= Date.now() || attempt.failures < this.maximumFailures; }
  async failed(subject: string): Promise<void> { await mutateStore(this.storePath, (store, now) => { const key = keyFor(subject); const current = store.attempts[key]; store.attempts[key] = { failures: (current?.resetAt && current.resetAt > now ? current.failures : 0) + 1, resetAt: now + this.windowMs }; }); }
  async succeeded(subject: string): Promise<void> { await mutateStore(this.storePath, (store) => { delete store.attempts[keyFor(subject)]; }); }
}
