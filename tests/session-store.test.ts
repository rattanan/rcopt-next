import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FileAdminSessionStore } from "@/lib/auth/session-store";
describe("file-backed Admin session store", () => { it("stores opaque sessions and invalidates them on logout", async () => { const directory = await mkdtemp(path.join(os.tmpdir(), "rcopt-session-")); try { const store = new FileAdminSessionStore(path.join(directory, "sessions.json")); const id = await store.create({ userId: 7, username: "admin", createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 60_000).toISOString() }); expect((await store.get(id))?.userId).toBe(7); await store.delete(id); expect(await store.get(id)).toBeUndefined(); } finally { await rm(directory, { recursive: true, force: true }); } }); });
