import { describe, expect, it, vi } from "vitest";
import centers from "@/data/thai-province-centers.json";
const query = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({ db: { query } }));
import { getDoctorMapOverview } from "@/repositories/doctor-repository";

describe("doctor map aggregation", () => {
  it("has valid coordinate pairs for all 77 provinces", () => {
    expect(Object.keys(centers)).toHaveLength(77);
    for (const [lat, lng] of Object.values(centers)) {
      expect(lat).toBeGreaterThan(5); expect(lat).toBeLessThan(21);
      expect(lng).toBeGreaterThan(97); expect(lng).toBeLessThan(106);
    }
  });
  it("matches legacy provinces by name, counts distinct public doctors and preserves missing coordinates", async () => {
    query.mockResolvedValueOnce([[{ id: 97, name: "บึงกาฬ", total: 2 }, { id: 999, name: "ไม่ระบุ", total: 1 }]])
      .mockResolvedValueOnce([[{ total: 10, unlocated: 4 }]]);
    const overview = await getDoctorMapOverview();
    expect(overview.total).toBe(10); expect(overview.unlocated).toBe(4);
    expect(overview.provinces[0]).toMatchObject({ id: 97, count: 2, center: centers["บึงกาฬ"] });
    expect(overview.provinces[1].center).toBeNull();
    expect(query.mock.calls[0][0]).toContain("COUNT(DISTINCT eligible.user_id)");
    for (const [sql] of query.mock.calls) {
      expect(sql).toContain("w.urpms010_id = 1");
      expect(sql).toContain("p.memtype = 2 AND u.status = 1");
    }
  });
});
