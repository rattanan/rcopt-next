import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: { default: "RCOPT | ราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย", template: "%s | RCOPT" }, description: "ข้อมูลความรู้ด้านจักษุวิทยาและค้นหาจักษุแพทย์จากราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย", metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.rcopt.org"), openGraph: { type: "website", locale: "th_TH", siteName: "RCOPT", title: "ราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย", description: "ข้อมูลความรู้ด้านจักษุวิทยาและค้นหาจักษุแพทย์จากราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย" }, robots: { index: true, follow: true } };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { const organization = { "@context": "https://schema.org", "@type": "MedicalOrganization", name: "ราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย", alternateName: "RCOPT", url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.rcopt.org" }; return <html lang="th"><body className="min-h-screen"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />{children}</body></html>; }
