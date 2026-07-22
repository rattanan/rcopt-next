"use client";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { useSearchParams } from "next/navigation";

export function AdminFlashMessage({ success: inputSuccess, error: inputError }: { success?: string; error?: string }) {
  const params = useSearchParams();
  const success = inputSuccess ?? params.get("success") ?? undefined;
  const error = inputError ?? params.get("error") ?? undefined;
  const message = success || error;
  if (!message) return null;
  const ok = Boolean(success);
  return <div role={ok ? "status" : "alert"} className={`mt-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>{ok ? <CheckCircle2 className="mt-0.5 shrink-0" size={18} /> : <CircleAlert className="mt-0.5 shrink-0" size={18} />}<p>{message}</p></div>;
}
