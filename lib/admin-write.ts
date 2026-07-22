import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { env } from "@/lib/env";
import { requireActiveAdmin } from "@/lib/auth/guards";

export async function requireAdminWrite() { const admin = await requireActiveAdmin(); if (!env.ADMIN_WRITE_ENABLED) throw new Error("ADMIN_WRITE_DISABLED"); return admin; }
export async function writeLegacyAudit(connectionHandle: PoolConnection, input: { model: string; action: "Insert" | "Update" | "Delete"; recordId: number; actorId: number; address: string; summary: string }) { const [settings] = await connectionHandle.execute<(RowDataPacket & { logs: "Yes" | "No" })[]>("SELECT logs FROM syadm040 WHERE mdel=? LIMIT 1", [input.model]); if (settings[0]?.logs !== "Yes") return; await connectionHandle.execute("INSERT INTO syadm041 (crdt,atyp,mdel,ipad,logd,crby_tbl_users,reid) VALUES (NOW(),?,?,?,?,?,?)", [input.action, input.model, input.address.slice(0, 16), input.summary.slice(0, 500), input.actorId, input.recordId]); }
