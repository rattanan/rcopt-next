import { type RowDataPacket } from "mysql2/promise";
import { db } from "../lib/db";
import { normalizePagination } from "@/lib/pagination";

export type DoctorSearch = { keyword?: string; hospital?: string; provinceId?: number; specialtyId?: number; page: number; pageSize: number };
export type Doctor = RowDataPacket & { user_id: number; title: string | null; firstname: string; lastname: string; licn: string | null; photoPath: string | null };
export type DoctorLookup = RowDataPacket & { id: number; name: string };
export type DoctorProfile = Doctor & { specialties: string[]; workplaces: Array<{ name: string; province: string | null }> };

export async function findDoctors(input: DoctorSearch): Promise<{ rows: Doctor[]; total: number }> {
  const { pageSize, offset } = normalizePagination(input.page, input.pageSize);
  const conditions = ["p.memtype = ?", "u.status = ?"];
  const values: Array<string | number> = [2, 1];
  if (input.keyword) { conditions.push("(p.firstname LIKE ? OR p.lastname LIKE ? OR CONCAT(p.firstname, ' ', p.lastname) LIKE ?)"); const term = `%${input.keyword}%`; values.push(term, term, term); }
  if (input.hospital) { conditions.push("EXISTS (SELECT 1 FROM urprf030 w WHERE w.crby_tbl_users = p.user_id AND w.urpms010_id = 1 AND w.name LIKE ?)"); values.push(`%${input.hospital}%`); }
  if (input.specialtyId) { conditions.push("EXISTS (SELECT 1 FROM urprf010 s WHERE s.crby_tbl_users = p.user_id AND s.urpms010_id = 1 AND s.urprf011_id = ?)"); values.push(input.specialtyId); }
  if (input.provinceId) { conditions.push("EXISTS (SELECT 1 FROM urprf030 w WHERE w.crby_tbl_users = p.user_id AND w.urpms010_id = 1 AND w.cmcom010_id = ?)"); values.push(input.provinceId); }
  const where = conditions.join(" AND ");
  const [countRows] = await db.execute<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM tbl_profiles p INNER JOIN tbl_users u ON u.id = p.user_id WHERE ${where}`, values);
  // MySQL 8.4 fixture rejects bound LIMIT/OFFSET parameters. These values are
  // normalized numeric values inside the repository, never request strings.
  const [rows] = await db.execute<Doctor[]>(`SELECT p.user_id, p.title, p.firstname, p.lastname, p.licn, (SELECT photo.pict FROM ursoc020 photo WHERE photo.crby_tbl_users = p.user_id AND photo.pfpt = 'Yes' AND photo.urpms010_id = 1 ORDER BY photo.id ASC LIMIT 1) AS photoPath FROM tbl_profiles p INNER JOIN tbl_users u ON u.id = p.user_id WHERE ${where} ORDER BY p.lastname, p.firstname, p.user_id LIMIT ${pageSize} OFFSET ${offset}`, values);
  return { rows, total: Number(countRows[0]?.total ?? 0) };
}

export async function findDoctorById(id: number): Promise<DoctorProfile | undefined> {
  const [rows] = await db.execute<Doctor[]>("SELECT p.user_id, p.title, p.firstname, p.lastname, p.licn, (SELECT photo.pict FROM ursoc020 photo WHERE photo.crby_tbl_users = p.user_id AND photo.pfpt = 'Yes' AND photo.urpms010_id = 1 ORDER BY photo.id ASC LIMIT 1) AS photoPath FROM tbl_profiles p INNER JOIN tbl_users u ON u.id = p.user_id WHERE p.user_id = ? AND p.memtype = ? AND u.status = ? LIMIT 1", [id, 2, 1]);
  const doctor = rows[0];
  if (!doctor) return undefined;
  const [specialtyRows] = await db.execute<DoctorLookup[]>("SELECT DISTINCT s.id, s.name FROM urprf010 p INNER JOIN urprf011 s ON s.id = p.urprf011_id WHERE p.crby_tbl_users = ? AND p.urpms010_id = 1 ORDER BY s.name, s.id", [id]);
  const [workplaceRows] = await db.execute<(RowDataPacket & { name: string; province: string | null })[]>("SELECT w.name, c.name AS province FROM urprf030 w LEFT JOIN cmcom010 c ON c.id = w.cmcom010_id WHERE w.crby_tbl_users = ? AND w.urpms010_id = 1 ORDER BY w.orby, w.id", [id]);
  return { ...doctor, specialties: specialtyRows.map((item) => item.name), workplaces: workplaceRows.map((item) => ({ name: item.name, province: item.province })) };
}

export async function getDoctorLookups(): Promise<{ specialties: DoctorLookup[]; provinces: DoctorLookup[] }> {
  const [specialties] = await db.query<DoctorLookup[]>("SELECT id, name FROM urprf011 ORDER BY orby, name");
  const [provinces] = await db.query<DoctorLookup[]>("SELECT id, name FROM cmcom010 ORDER BY name");
  return { specialties, provinces };
}
