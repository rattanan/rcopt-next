import { describe, expect, it } from "vitest";
import { extractYouTubeId } from "@/repositories/video-repository";

describe("legacy video mapping", () => {
  it("extracts only a valid YouTube id from legacy Flash embeds", () => {
    expect(extractYouTubeId('http://www.youtube.com/v/4cLXnM6Z92k?fs=1')).toBe("4cLXnM6Z92k");
    expect(extractYouTubeId("https://youtu.be/CWYCnIq6-ss")).toBe("CWYCnIq6-ss");
  });

  it("rejects values that are not a YouTube embed", () => {
    expect(extractYouTubeId("javascript:alert(1)")).toBeUndefined();
  });
});
