import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ execute: vi.fn(), beginTransaction: vi.fn(), commit: vi.fn(), rollback: vi.fn(), release: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: { getConnection: async () => mocks } }));
vi.mock("next/server", () => ({ connection: vi.fn() }));
vi.mock("@/lib/admin-write", () => ({ writeLegacyAudit: vi.fn() }));
import { saveProfileDetail, saveGalleryDetail, deleteProfileDetail } from "@/repositories/profile-details-repository";
const base = { userId: 1234, actorId: 1234, address: "127.0.0.1" };
const values = { visibilityId: 2, educationTypeId: 3, institution: "Test institute", subject: "Ophthalmology", year: 2569, honor: "", details: "Test", name: "Test", address: "", provinceId: 0, districtId: 0, postcode: "", telephone: "", mobile: "", email: "", contactTypeId: 1, gps: "", mapUrl: "", url: "https://example.org", socialTypeId: 1, customSocial: "" };
beforeEach(() => { vi.clearAllMocks(); mocks.execute.mockImplementation(async (sql: string) => sql.startsWith("SELECT") ? [[{ id: 1, nextOrder: 4 }]] : [{ insertId: 8, affectedRows: 1 }]); });
function inserted() { const call = mocks.execute.mock.calls.find(([sql]) => sql.startsWith("INSERT INTO"))!; const columns = call[0].match(/\(([^)]+)\)/)[1].split(","); return Object.fromEntries(columns.map((column: string, index: number) => [column, call[1][index]])); }
describe("profile detail persistence", () => {
  it.each(["education", "educationOverview", "profession", "academic", "contact", "social"] as const)("creates %s with the correct owner and visibility", async section => {
    await saveProfileDetail({ ...base, section, values });
    expect(inserted()).toMatchObject({ crby_tbl_users: 1234, urpms010_id: 2 });
    expect(mocks.commit).toHaveBeenCalledOnce();
  });
  it("stores unspecified contact geography as SQL NULL", async () => { await saveProfileDetail({ ...base, section: "contact", values }); expect(inserted()).toMatchObject({ cmcom010_id: null, cmcom011_id: null }); });
  it.each(["education", "educationOverview", "profession", "academic", "contact", "social"] as const)("scopes %s edits to the signed-in owner", async section => { await saveProfileDetail({ ...base, section, itemId: 8, values }); const call = mocks.execute.mock.calls.find(([sql]) => sql.startsWith("UPDATE"))!; expect(call[0]).toContain("WHERE id=? AND crby_tbl_users=?"); expect(call[1]).toContain(1234); });
  it("rolls back failed inserts", async () => { mocks.execute.mockRejectedValue(new Error("DB failure")); await expect(saveProfileDetail({ ...base, section: "education", values })).rejects.toThrow(); expect(mocks.rollback).toHaveBeenCalledOnce(); expect(mocks.commit).not.toHaveBeenCalled(); expect(mocks.release).toHaveBeenCalledOnce(); });
  it("saves gallery metadata", async () => { await saveGalleryDetail({ ...base, name: "Test", details: "", picture: "test.png", visibilityId: 2, isProfilePicture: false }); const call = mocks.execute.mock.calls.find(([sql]) => sql.startsWith("INSERT"))!; expect(call[1]).toEqual(["Test", "", "test.png", "No", 2, 1234]); });
  it("does not report a missing deletion as successful", async () => { mocks.execute.mockResolvedValue([{ affectedRows: 0 }]); expect(await deleteProfileDetail({ ...base, section: "education", itemId: 99 })).toBe(false); expect(mocks.commit).not.toHaveBeenCalled(); });
});
