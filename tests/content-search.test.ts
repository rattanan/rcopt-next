import { beforeEach, describe, expect, it, vi } from "vitest";

const execute = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({ db: { execute } }));
vi.mock("next/server", () => ({ connection: vi.fn() }));

import { listPublicContent, mapContentRow } from "@/repositories/content-repository";

describe("public content search", () => {
  beforeEach(() => {
    execute.mockReset();
    execute.mockResolvedValueOnce([[{ total: 25 }]]).mockResolvedValueOnce([[]]);
  });

  it("combines category and keyword filters for both counts and paginated results", async () => {
    const result = await listPublicContent({ kind: "article", categoryId: 8, keyword: "ต้อกระจก", page: 3 });
    expect(result.total).toBe(25);
    for (const [sql, values] of execute.mock.calls) {
      expect(sql).toContain("a.pubd = 'Yes'");
      expect(sql).toContain("a.arcat010_id <> 1");
      expect(sql).toContain("a.arcat010_id = ?");
      expect(values).toEqual([8, "%ต้อกระจก%", "%ต้อกระจก%"]);
    }
    expect(execute.mock.calls[1][0]).toContain("LIMIT 12 OFFSET 24");
  });

  it("hides news older than three years in both count and result queries", async () => {
    await listPublicContent({ kind: "news", page: 1, pageSize: 10 });
    for (const [sql] of execute.mock.calls) expect(sql).toContain("a.crdt >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 YEAR)");
    expect(execute.mock.calls[1][0]).toContain("LIMIT 10 OFFSET 0");
    expect(execute.mock.calls[1][0]).toContain("ORDER BY a.crdt DESC");
  });

  it("keeps publication and update dates separate", () => {
    const row = { id: 1, title: "Example", intro: "", category_id: 2, category_name: "Knowledge", image_path: null, published_at: "2020-01-01", updated_at: "2026-10-03", featured: "No" };
    const item = mapContentRow(row as Parameters<typeof mapContentRow>[0]);
    expect(item.publishedAt).toBe("2020-01-01");
    expect(item.updatedAt).toBe("2026-10-03");
  });

  it("treats wildcard characters literally and keeps user input in bound parameters", async () => {
    const keyword = "100%_! ' OR 1=1";
    await listPublicContent({ kind: "article", keyword, page: 1 });
    expect(execute.mock.calls[0][0]).not.toContain(keyword);
    expect(execute.mock.calls[0][1]).toEqual(["%100!%!_!! ' OR 1=1%", "%100!%!_!! ' OR 1=1%"]);
  });
});
