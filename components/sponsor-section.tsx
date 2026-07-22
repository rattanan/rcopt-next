import { Gift } from "lucide-react";
import { LegacyImage } from "@/components/legacy-image";
import { legacyHomepageSponsors } from "@/lib/legacy-homepage-content";

export function SponsorSection() {
  return <section className="bg-[var(--secondary)] py-16 sm:py-20"><div className="container-shell"><div className="mx-auto mb-9 max-w-2xl text-center"><p className="eyebrow mb-3">WITH APPRECIATION</p><h2 className="section-title">ผู้สนับสนุน</h2><p className="mt-3 text-sm leading-7 text-[var(--muted)]">ขอขอบคุณหน่วยงานและองค์กรที่สนับสนุนการดำเนินงานของราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย</p></div><div className="grid gap-4 md:grid-cols-3">{legacyHomepageSponsors.map((sponsor) => {
    const logo = <LegacyImage path={sponsor.imagePath} area={sponsor.area} alt={`โลโก้ ${sponsor.name}`} className="h-20 w-full max-w-[260px] object-contain" />;
    const content = <><span className="mb-4 inline-grid h-9 w-9 place-items-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]"><Gift size={17} /></span><span className="grid min-h-24 place-items-center">{logo}</span></>;
    return sponsor.href ? <a key={sponsor.name} href={sponsor.href} target="_blank" rel="noopener noreferrer" className="card group flex min-h-44 flex-col justify-center p-6 text-center hover:-translate-y-1 hover:border-[#df9ab4]" aria-label={`เยี่ยมชมเว็บไซต์ ${sponsor.name}`}>{content}</a> : <div key={sponsor.name} className="card flex min-h-44 flex-col justify-center p-6 text-center">{content}</div>;
  })}</div></div></section>;
}
