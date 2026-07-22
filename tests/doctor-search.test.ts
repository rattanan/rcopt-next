import { describe, expect, it } from "vitest";
import { parseDoctorSearchParams } from "@/lib/doctor-search";

describe("doctor search parameters", () => {
  it("trims valid public filters", () => {
    expect(parseDoctorSearchParams({ keyword: "  สมชาย ", hospital: "  รพ.ตัวอย่าง ", province: "10", specialty: "2", page: "3" })).toMatchObject({ keyword: "สมชาย", hospital: "รพ.ตัวอย่าง", provinceId: 10, specialtyId: 2, page: 3, valid: true });
  });

  it("rejects malformed pagination and numeric identifiers", () => {
    expect(parseDoctorSearchParams({ page: "-1", province: "1 OR 1=1" })).toEqual({ page: 1, valid: false });
  });
});
