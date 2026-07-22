import type { LegacyAssetArea } from "@/lib/legacy-assets";

export type HomepageVideo = {
  youtubeId: string;
  title: string;
  description: string;
};

// These are the six YouTube embeds published on the legacy RCOPT homepage.
export const legacyHomepageVideos: HomepageVideo[] = [
  { youtubeId: "CWYCnIq6-ss", title: "วีดิทัศน์แนะนำจากราชวิทยาลัยฯ", description: "ความรู้และกิจกรรมจากราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย" },
  { youtubeId: "l8q6wUUPt60", title: "Hybrid Mydriasis", description: "วิดีโอความรู้ด้านจักษุวิทยา" },
  { youtubeId: "buxQgUsjNIY", title: "IA Capsulotomy", description: "วิดีโอความรู้ด้านจักษุวิทยา" },
  { youtubeId: "GD8B2_fVE9U", title: "การศึกษาต่อเนื่อง (CME) คืออะไร", description: "ทำความเข้าใจการศึกษาต่อเนื่องสำหรับแพทย์" },
  { youtubeId: "iDkAa98YqI0", title: "วิธีหยอดตาที่ถูกต้อง", description: "คำแนะนำเพื่อการดูแลดวงตาในชีวิตประจำวัน" },
  { youtubeId: "tYRr0CV_z_Y", title: "การนวดตาอาจก่อให้เกิดอันตรายต่อดวงตา", description: "ข้อควรระวังเพื่อป้องกันอันตรายต่อดวงตา" },
];

export type HomepageSponsor = {
  name: string;
  imagePath: string;
  area: LegacyAssetArea;
  href?: string;
};

// Sponsor logos shown in the legacy homepage sponsor panel.
export const legacyHomepageSponsors: HomepageSponsor[] = [
  { name: "Sangthai", imagePath: "logo-sangthai.jpg", area: "banners" },
  { name: "AVC", imagePath: "logo-avc.png", area: "banners" },
  { name: "Topcon", imagePath: "topcon.png", area: "banner2019", href: "https://www.topcon.co.th" },
];
