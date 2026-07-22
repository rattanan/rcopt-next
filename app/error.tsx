"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="container-shell flex min-h-[60vh] items-center justify-center py-16"><section className="card max-w-lg p-8 text-center"><p className="eyebrow">TEMPORARY ERROR</p><h1 className="mt-3 text-2xl font-extrabold">ไม่สามารถแสดงข้อมูลได้ในขณะนี้</h1><p className="mt-3 text-sm leading-7 text-[var(--muted)]">กรุณาลองใหม่อีกครั้งในภายหลัง</p><button type="button" onClick={reset} className="button-primary mt-6">ลองใหม่</button></section></main>; }
