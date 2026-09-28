import { beforeEach, expect, it, vi } from "vitest";
import { createLegacyMd5Password } from "@/lib/auth/legacy-password";
const mocks = vi.hoisted(() => ({ execute: vi.fn(), beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: { getConnection: async () => mocks } }));
vi.mock("@/lib/admin-write", () => ({ writeLegacyAudit: vi.fn() }));
import { updateOwnMemberPassword } from "@/repositories/member-profile-repository";
beforeEach(() => { vi.clearAllMocks(); mocks.execute.mockImplementation(async (sql: string) => sql.startsWith("SELECT") ? [[{ password: createLegacyMd5Password("old-password") }]] : [{ affectedRows: 1 }]); });
it("requires the current password before writing", async () => { expect(await updateOwnMemberPassword({ userId: 1234, currentPassword: "incorrect", newPassword: "new-password-long", address: "" })).toBe(false); expect(mocks.execute).toHaveBeenCalledTimes(1); expect(mocks.rollback).toHaveBeenCalled(); });
it("writes only a compatible password hash to the current account", async () => { expect(await updateOwnMemberPassword({ userId: 1234, currentPassword: "old-password", newPassword: "new-password-long", address: "" })).toBe(true); expect(mocks.execute).toHaveBeenLastCalledWith("UPDATE tbl_users SET password=? WHERE id=? AND status=1", [createLegacyMd5Password("new-password-long"), 1234]); expect(mocks.commit).toHaveBeenCalledOnce(); });
