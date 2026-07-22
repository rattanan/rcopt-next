import { createHash, randomBytes } from "node:crypto";
import path from "node:path";
import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";

export type StoredAdminSession = { userId: number; username: string; expiresAt: string; createdAt: string };
type SessionFile = { version: 1; sessions: Record<string, StoredAdminSession> };
let writeQueue: Promise<void> = Promise.resolve();
function hashSessionId(sessionId: string): string { return createHash("sha256").update(sessionId, "utf8").digest("hex"); }
function emptyFile(): SessionFile { return { version: 1, sessions: {} }; }
async function readStore(storePath: string): Promise<SessionFile> { try { const parsed: unknown = JSON.parse(await readFile(storePath, "utf8")); if (!parsed || typeof parsed !== "object") return emptyFile(); const file = parsed as Partial<SessionFile>; return file.version === 1 && file.sessions && typeof file.sessions === "object" ? { version: 1, sessions: file.sessions } : emptyFile(); } catch { return emptyFile(); } }
async function writeStore(storePath: string, store: SessionFile): Promise<void> { const directory = path.dirname(storePath); await mkdir(directory, { recursive: true, mode: 0o700 }); const temporary = path.join(directory, `.${path.basename(storePath)}.${randomBytes(8).toString("hex")}.tmp`); await writeFile(temporary, `${JSON.stringify(store)}\n`, { encoding: "utf8", mode: 0o600 }); await rename(temporary, storePath); await chmod(storePath, 0o600); }
async function mutateStore<T>(storePath: string, mutate: (store: SessionFile) => T): Promise<T> { let result!: T; writeQueue = writeQueue.then(async () => { const store = await readStore(storePath); const now = Date.now(); for (const [key, session] of Object.entries(store.sessions)) if (Date.parse(session.expiresAt) <= now) delete store.sessions[key]; result = mutate(store); await writeStore(storePath, store); }); await writeQueue; return result; }

export class FileAdminSessionStore {
  constructor(private readonly storePath: string) {}
  async create(session: StoredAdminSession): Promise<string> { const sessionId = randomBytes(32).toString("base64url"); await mutateStore(this.storePath, (store) => { store.sessions[hashSessionId(sessionId)] = session; }); return sessionId; }
  async get(sessionId: string | undefined): Promise<StoredAdminSession | undefined> { if (!sessionId || !/^[A-Za-z0-9_-]{43}$/u.test(sessionId)) return undefined; const store = await readStore(this.storePath); const session = store.sessions[hashSessionId(sessionId)]; return session && Date.parse(session.expiresAt) > Date.now() ? session : undefined; }
  async delete(sessionId: string | undefined): Promise<void> { if (!sessionId) return; await mutateStore(this.storePath, (store) => { delete store.sessions[hashSessionId(sessionId)]; }); }
}
