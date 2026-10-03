import { describe, expect, it } from "vitest";
import { prepareSiteMenu } from "@/lib/site-menu";
import type { SiteMenuItem } from "@/repositories/menu-repository";
const item = (id: number, label: string, children: SiteMenuItem[] = [], href?: string): SiteMenuItem => ({ id, label, children, href });

describe("public navigation", () => {
  it("keeps the ophthalmologist menu public and removes Job Center only", () => {
    const tree = [item(14, "สำหรับจักษุแพทย์", [item(28, "Job Center"), item(54, "Researcher Academy", [item(55, "วิจัย")])])];
    const result = prepareSiteMenu(tree);
    expect(result[0].label).toBe("สำหรับจักษุแพทย์");
    expect(result[0].children.map((child) => child.label)).toEqual(["Researcher Academy"]);
    expect(result[0].children[0].children[0].label).toBe("วิจัย");
    expect(tree[0].children).toHaveLength(2);
  });
  it("adds map discovery once and sends consultations to the requested Facebook page", () => {
    const tree = [item(13, "สำหรับประชาชน", [item(16, "ค้นหาจักษุแพทย์"), item(19, "ปรึกษาจักษุแพทย์", [], "/community/questions")])];
    const result = prepareSiteMenu(prepareSiteMenu(tree));
    expect(result[0].children.filter((child) => child.href === "/doctors/map")).toHaveLength(1);
    expect(result[0].children.find((child) => child.id === 19)?.href).toBe("https://www.facebook.com/AllAboutEyebyRCOPT");
  });
});
