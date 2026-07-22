import { describe, expect, it } from "vitest";
import { legacyHomepageSponsors, legacyHomepageVideos } from "@/lib/legacy-homepage-content";

describe("legacy homepage content", () => {
  it("retains every YouTube video embedded on the legacy homepage", () => {
    expect(legacyHomepageVideos.map((video) => video.youtubeId)).toEqual(["CWYCnIq6-ss", "l8q6wUUPt60", "buxQgUsjNIY", "GD8B2_fVE9U", "iDkAa98YqI0", "tYRr0CV_z_Y"]);
  });

  it("includes the sponsor logos from the legacy sponsor panel", () => {
    expect(legacyHomepageSponsors.map((sponsor) => sponsor.name)).toEqual(["Sangthai", "AVC", "Topcon"]);
  });
});
