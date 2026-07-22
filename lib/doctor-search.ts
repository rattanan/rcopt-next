import { z } from "zod";

const positiveId = z.string().regex(/^\d+$/).transform(Number).refine((value) => value > 0).optional();
const page = z.string().regex(/^\d+$/).transform(Number).refine((value) => value > 0 && value <= 10_000).optional();

const doctorSearchSchema = z.object({
  keyword: z.string().trim().max(80).optional().transform((value) => value || undefined),
  hospital: z.string().trim().max(80).optional().transform((value) => value || undefined),
  province: positiveId,
  specialty: positiveId,
  page,
});

export type DoctorSearchParams = { keyword?: string; hospital?: string; provinceId?: number; specialtyId?: number; page: number; valid: boolean };

export function parseDoctorSearchParams(input: Record<string, string | string[] | undefined>): DoctorSearchParams {
  const normalized = Object.fromEntries(Object.entries(input).map(([key, value]) => { const first = Array.isArray(value) ? value[0] : value; return [key, first?.trim() === "" ? undefined : first]; }));
  const result = doctorSearchSchema.safeParse(normalized);
  if (!result.success) return { page: 1, valid: false };
  return { keyword: result.data.keyword, hospital: result.data.hospital, provinceId: result.data.province, specialtyId: result.data.specialty, page: result.data.page ?? 1, valid: true };
}
