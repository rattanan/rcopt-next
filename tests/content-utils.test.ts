import { describe, expect, it } from "vitest";
import { formatThaiDate, hasLegacyContentImage, redactPublicContactInfo, sanitizeLegacyHtml, stripLegacyHtml, toSafeYouTubeEmbed } from "@/lib/content-utils";

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

  it("redacts contact details and identifies the legacy default logo", () => {
    expect(redactPublicContactInfo("ติดต่อ test@example.org หรือ 081-234-5678")).not.toContain("example.org");
    expect(hasLegacyContentImage("rcoptapplogo.jpg")).toBe(false);
    expect(hasLegacyContentImage("1623rcoptapplogo.jpg")).toBe(false);
    expect(hasLegacyContentImage("2234original.jpg")).toBe(false);
    expect(hasLegacyContentImage("original.jpg")).toBe(false);
    expect(hasLegacyContentImage("cover.jpg")).toBe(true);
  });

  it("keeps only verified YouTube iframe sources", () => {
    expect(toSafeYouTubeEmbed("https://www.youtube.com/embed/ESzVk8B7cP4?si=ignored")).toBe("https://www.youtube-nocookie.com/embed/ESzVk8B7cP4");
    expect(toSafeYouTubeEmbed("https://example.org/embed/ESzVk8B7cP4")).toBeUndefined();
    expect(sanitizeLegacyHtml('<iframe src="https://www.youtube.com/embed/ESzVk8B7cP4"></iframe>')).toContain("youtube-nocookie.com/embed/ESzVk8B7cP4");
  });
});
