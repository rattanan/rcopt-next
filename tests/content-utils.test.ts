import { describe, expect, it } from "vitest";
import { formatThaiDate, sanitizeLegacyHtml, stripLegacyHtml } from "@/lib/content-utils";

describe("legacy content utilities", () => {
  it("removes executable HTML while retaining safe content", () => {
    const safe = sanitizeLegacyHtml('<p onclick="alert(1)">สวัสดี<script>alert(1)</script><a href="javascript:alert(1)">ลิงก์</a></p>');
    expect(safe).toContain("สวัสดี");
    expect(safe).not.toContain("script");
    expect(safe).not.toContain("onclick");
    expect(stripLegacyHtml("<p>  ข้อความ <strong>ทดสอบ</strong></p>")).toBe("ข้อความ ทดสอบ");
  });

  it("formats published dates for Thai readers", () => {
    expect(formatThaiDate("2026-07-09T00:00:00+07:00")).toContain("2569");
  });
});
