import type { SiteMenuItem } from "@/repositories/menu-repository";

// Presentation policy is applied to the CMS tree without changing authentication.
export function prepareSiteMenu(items: SiteMenuItem[]): SiteMenuItem[] {
  return items.filter((item) => item.label.trim().toLowerCase() !== "job center").map((item) => {
    const children = prepareSiteMenu(item.children);
    if (item.label.trim() === "สำหรับประชาชน" && !children.some((child) => child.href === "/doctors/map")) {
      children.splice(1, 0, { id: -100, label: "ค้นหาจักษุแพทย์จากแผนที่", href: "/doctors/map", children: [] });
    }
    return { ...item, children, href: item.label.trim() === "ปรึกษาจักษุแพทย์" ? "https://www.facebook.com/AllAboutEyebyRCOPT" : item.href };
  });
}
