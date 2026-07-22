import { connection } from "next/server";
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";
import { writeLegacyAudit } from "@/lib/admin-write";
import { resolveLegacyAsset } from "@/lib/legacy-assets";

export type VisibilityOption = { id: number; name: string };
export type EducationOption = { id: number; name: string };
export type ContactTypeOption = { id: number; name: string };
export type SocialTypeOption = { id: number; name: string };
export type EducationDetail = { id: number; institution: string; subject: string; year: number; honor: string; details: string; educationTypeId: number; visibilityId: number };
export type TextDetail = { id: number; details: string; visibilityId: number };
export type ContactDetail = { id: number; name: string; details: string; address: string; provinceId: number; districtId: number; postcode: string; telephone: string; mobile: string; email: string; contactTypeId: number; visibilityId: number; gps: string; mapUrl: string; url: string };
export type SocialDetail = { id: number; socialTypeId: number; customSocial: string; name: string; url: string; visibilityId: number };
export type GalleryDetail = { id: number; name: string; details: string; picture: string; imageUrl: string; createdAt: string; isProfilePicture: boolean; visibilityId: number };
export type ProfileDetails = { education: EducationDetail[]; educationOverview: TextDetail[]; profession: TextDetail[]; academic: TextDetail[]; contacts: ContactDetail[]; social: SocialDetail[]; gallery: GalleryDetail[]; educationTypes: EducationOption[]; contactTypes: ContactTypeOption[]; socialTypes: SocialTypeOption[]; visibility: VisibilityOption[] };

type OptionRow = RowDataPacket & { id: number; name: string };
const optionMap = (row: OptionRow) => ({ id: Number(row.id), name: String(row.name) });

export async function getProfileDetails(userId: number): Promise<ProfileDetails> {
  await connection();
  const [education, profession, educationOverview, academic, contacts, social, gallery, educationTypes, contactTypes, socialTypes, visibility] = await Promise.all([
    db.execute<(RowDataPacket & { id: number; insi: string | null; subs: string | null; gdyr: number | null; honr: string | null; dsca: string | null; uredu020_id: number; urpms010_id: number })[]>("SELECT id,insi,subs,gdyr,honr,dsca,uredu020_id,urpms010_id FROM uredu010 WHERE crby_tbl_users=? ORDER BY orby,id", [userId]),
    db.execute<(RowDataPacket & { id: number; dsca: string | null; urpms010_id: number })[]>("SELECT id,dsca,urpms010_id FROM urprf060 WHERE crby_tbl_users=? AND type='Profession' ORDER BY orby,id", [userId]),
    db.execute<(RowDataPacket & { id: number; dsca: string | null; urpms010_id: number })[]>("SELECT id,dsca,urpms010_id FROM urprf060 WHERE crby_tbl_users=? AND type='Education' ORDER BY orby,id", [userId]),
    db.execute<(RowDataPacket & { id: number; dsca: string | null; urpms010_id: number })[]>("SELECT id,dsca,urpms010_id FROM urprf060 WHERE crby_tbl_users=? AND type='Academic' ORDER BY orby,id", [userId]),
    db.execute<(RowDataPacket & { id: number; name: string | null; dsca: string | null; addr: string | null; cmcom010_id: number | null; cmcom011_id: number | null; zip: string | null; teln: string | null; mobl: string | null; emal: string | null; urcon011_id: number; urpms010_id: number; gpsc: string | null; urlm: string | null; url: string | null })[]>("SELECT id,name,dsca,addr,cmcom010_id,cmcom011_id,zip,teln,mobl,emal,urcon011_id,urpms010_id,gpsc,urlm,url FROM urcon010 WHERE crby_tbl_users=? ORDER BY id", [userId]),
    db.execute<(RowDataPacket & { id: number; ursoc011_id: number; osoc: string | null; name: string | null; dsca: string | null; urpms010_id: number })[]>("SELECT id,ursoc011_id,osoc,name,dsca,urpms010_id FROM ursoc010 WHERE crby_tbl_users=? ORDER BY ursoc011_id,id", [userId]),
    db.execute<(RowDataPacket & { id: number; name: string | null; dsca: string | null; pict: string; crdt: string | Date; pfpt: "Yes" | "No"; urpms010_id: number })[]>("SELECT id,name,dsca,pict,crdt,pfpt,urpms010_id FROM ursoc020 WHERE crby_tbl_users=? ORDER BY id", [userId]),
    db.execute<OptionRow[]>("SELECT id,name FROM uredu020 ORDER BY rcur,id"),
    db.execute<OptionRow[]>("SELECT id,name FROM urcon011 ORDER BY id"),
    db.execute<OptionRow[]>("SELECT id,name FROM ursoc011 ORDER BY id"),
    db.execute<OptionRow[]>("SELECT id,name FROM urpms010 ORDER BY id"),
  ]);
  return {
    education: education[0].map((row) => ({ id: Number(row.id), institution: row.insi ?? "", subject: row.subs ?? "", year: Number(row.gdyr ?? 0), honor: row.honr ?? "", details: row.dsca ?? "", educationTypeId: Number(row.uredu020_id), visibilityId: Number(row.urpms010_id) })),
    educationOverview: educationOverview[0].map((row) => ({ id: Number(row.id), details: row.dsca ?? "", visibilityId: Number(row.urpms010_id) })),
    profession: profession[0].map((row) => ({ id: Number(row.id), details: row.dsca ?? "", visibilityId: Number(row.urpms010_id) })),
    academic: academic[0].map((row) => ({ id: Number(row.id), details: row.dsca ?? "", visibilityId: Number(row.urpms010_id) })),
    contacts: contacts[0].map((row) => ({ id: Number(row.id), name: row.name ?? "", details: row.dsca ?? "", address: row.addr ?? "", provinceId: Number(row.cmcom010_id ?? 0), districtId: Number(row.cmcom011_id ?? 0), postcode: row.zip ?? "", telephone: row.teln ?? "", mobile: row.mobl ?? "", email: row.emal ?? "", contactTypeId: Number(row.urcon011_id), visibilityId: Number(row.urpms010_id), gps: row.gpsc ?? "", mapUrl: row.urlm ?? "", url: row.url ?? "" })),
    social: social[0].map((row) => ({ id: Number(row.id), socialTypeId: Number(row.ursoc011_id), customSocial: row.osoc ?? "", name: row.name ?? "", url: row.dsca ?? "", visibilityId: Number(row.urpms010_id) })),
    gallery: gallery[0].map((row) => ({ id: Number(row.id), name: row.name ?? "", details: row.dsca ?? "", picture: row.pict, imageUrl: resolveLegacyAsset(row.pict, "member"), createdAt: row.crdt instanceof Date ? row.crdt.toISOString() : String(row.crdt), isProfilePicture: row.pfpt === "Yes", visibilityId: Number(row.urpms010_id) })),
    educationTypes: educationTypes[0].map(optionMap), contactTypes: contactTypes[0].map(optionMap), socialTypes: socialTypes[0].map(optionMap), visibility: visibility[0].map(optionMap),
  };
}

async function assertOption(connectionHandle: PoolConnection, table: "uredu020" | "urcon011" | "ursoc011" | "urpms010", id: number): Promise<void> {
  const [rows] = await connectionHandle.execute<RowDataPacket[]>(`SELECT id FROM ${table} WHERE id=? LIMIT 1`, [id]);
  if (!rows[0]) throw new Error("INVALID_LOOKUP");
}

async function nextOrder(connectionHandle: PoolConnection, table: "uredu010" | "urprf060", userId: number, type?: "Education" | "Profession" | "Academic"): Promise<number> {
  const where = type ? " WHERE crby_tbl_users=? AND type=?" : " WHERE crby_tbl_users=?";
  const values = type ? [userId, type] : [userId];
  const [rows] = await connectionHandle.execute<(RowDataPacket & { nextOrder: number })[]>(`SELECT COALESCE(MAX(orby),0)+1 AS nextOrder FROM ${table}${where}`, values);
  return Number(rows[0]?.nextOrder ?? 1);
}

export async function saveProfileDetail(input: { userId: number; actorId: number; address: string; section: "education" | "educationOverview" | "profession" | "academic" | "contact" | "social"; itemId?: number; values: Record<string, string | number> }): Promise<void> {
  const connectionHandle = await db.getConnection();
  try {
    await connectionHandle.beginTransaction();
    const visibilityId = Number(input.values.visibilityId);
    await assertOption(connectionHandle, "urpms010", visibilityId);
    let table = "";
    let recordId = input.itemId ?? 0;
    if (input.section === "education") {
      table = "uredu010";
      const educationTypeId = Number(input.values.educationTypeId);
      await assertOption(connectionHandle, "uredu020", educationTypeId);
      const values = [String(input.values.institution), String(input.values.subject), Number(input.values.year), String(input.values.honor), String(input.values.details), educationTypeId, visibilityId];
      if (input.itemId) await connectionHandle.execute("UPDATE uredu010 SET insi=?,subs=?,gdyr=?,honr=?,dsca=?,uredu020_id=?,urpms010_id=? WHERE id=? AND crby_tbl_users=?", [...values, input.itemId, input.userId]);
      else { const [result] = await connectionHandle.execute<ResultSetHeader>("INSERT INTO uredu010 (insi,subs,gdyr,honr,dsca,uredu020_id,crby_tbl_users,urpms010_id,orby) VALUES (?,?,?,?,?,?,?,?,?)", [...values, input.userId, await nextOrder(connectionHandle, "uredu010", input.userId)]); recordId = Number(result.insertId); }
    } else if (input.section === "educationOverview" || input.section === "profession" || input.section === "academic") {
      table = "urprf060";
      const type = input.section === "educationOverview" ? "Education" : input.section === "profession" ? "Profession" : "Academic";
      const values = [String(input.values.details), visibilityId];
      if (input.itemId) await connectionHandle.execute("UPDATE urprf060 SET dsca=?,urpms010_id=? WHERE id=? AND crby_tbl_users=? AND type=?", [...values, input.itemId, input.userId, type]);
      else { const [result] = await connectionHandle.execute<ResultSetHeader>("INSERT INTO urprf060 (type,dsca,crby_tbl_users,urpms010_id,orby) VALUES (?,?,?,?,?)", [type, values[0], input.userId, visibilityId, await nextOrder(connectionHandle, "urprf060", input.userId, type)]); recordId = Number(result.insertId); }
    } else if (input.section === "contact") {
      table = "urcon010";
      const contactTypeId = Number(input.values.contactTypeId);
      await assertOption(connectionHandle, "urcon011", contactTypeId);
      const values = [String(input.values.name), String(input.values.details), String(input.values.address), Number(input.values.provinceId), Number(input.values.districtId), String(input.values.postcode), String(input.values.telephone), String(input.values.mobile), String(input.values.email), contactTypeId, visibilityId, String(input.values.gps), String(input.values.mapUrl), String(input.values.url)];
      if (input.itemId) await connectionHandle.execute("UPDATE urcon010 SET name=?,dsca=?,addr=?,cmcom010_id=?,cmcom011_id=?,zip=?,teln=?,mobl=?,emal=?,urcon011_id=?,urpms010_id=?,gpsc=?,urlm=?,url=? WHERE id=? AND crby_tbl_users=?", [...values, input.itemId, input.userId]);
      else { const [result] = await connectionHandle.execute<ResultSetHeader>("INSERT INTO urcon010 (name,dsca,addr,cmcom010_id,cmcom011_id,zip,teln,mobl,emal,urcon011_id,urpms010_id,crby_tbl_users,gpsc,urlm,url) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [...values.slice(0, 11), input.userId, ...values.slice(11)]); recordId = Number(result.insertId); }
    } else {
      table = "ursoc010";
      const socialTypeId = Number(input.values.socialTypeId);
      await assertOption(connectionHandle, "ursoc011", socialTypeId);
      const values = [socialTypeId, String(input.values.customSocial), String(input.values.name), String(input.values.url), visibilityId];
      if (input.itemId) await connectionHandle.execute("UPDATE ursoc010 SET ursoc011_id=?,osoc=?,name=?,dsca=?,urpms010_id=? WHERE id=? AND crby_tbl_users=?", [...values, input.itemId, input.userId]);
      else { const [result] = await connectionHandle.execute<ResultSetHeader>("INSERT INTO ursoc010 (ursoc011_id,osoc,name,dsca,urpms010_id,crby_tbl_users) VALUES (?,?,?,?,?,?)", [...values, input.userId]); recordId = Number(result.insertId); }
    }
    await writeLegacyAudit(connectionHandle, { model: table, action: input.itemId ? "Update" : "Insert", recordId, actorId: input.actorId, address: input.address, summary: `${input.section} profile detail ${input.itemId ? "updated" : "created"}` });
    await connectionHandle.commit();
  } catch (error) { await connectionHandle.rollback(); throw error; } finally { connectionHandle.release(); }
}

export async function deleteProfileDetail(input: { userId: number; actorId: number; address: string; section: "education" | "educationOverview" | "profession" | "academic" | "contact" | "social" | "gallery"; itemId: number }): Promise<boolean> {
  const mapping = { education: "uredu010", educationOverview: "urprf060", profession: "urprf060", academic: "urprf060", contact: "urcon010", social: "ursoc010", gallery: "ursoc020" } as const;
  const connectionHandle = await db.getConnection();
  try {
    await connectionHandle.beginTransaction();
    const typeClause = input.section === "educationOverview" ? " AND type='Education'" : input.section === "profession" ? " AND type='Profession'" : input.section === "academic" ? " AND type='Academic'" : "";
    const [result] = await connectionHandle.execute<ResultSetHeader>(`DELETE FROM ${mapping[input.section]} WHERE id=? AND crby_tbl_users=?${typeClause}`, [input.itemId, input.userId]);
    if (!result.affectedRows) { await connectionHandle.rollback(); return false; }
    await writeLegacyAudit(connectionHandle, { model: mapping[input.section], action: "Delete", recordId: input.itemId, actorId: input.actorId, address: input.address, summary: `${input.section} profile detail deleted` });
    await connectionHandle.commit();
    return true;
  } catch (error) { await connectionHandle.rollback(); throw error; } finally { connectionHandle.release(); }
}

export async function saveGalleryDetail(input: { userId: number; actorId: number; address: string; itemId?: number; name: string; details: string; picture?: string; visibilityId: number; isProfilePicture: boolean }): Promise<void> {
  const connectionHandle = await db.getConnection();
  try {
    await connectionHandle.beginTransaction();
    await assertOption(connectionHandle, "urpms010", input.visibilityId);
    if (input.isProfilePicture) await connectionHandle.execute("UPDATE ursoc020 SET pfpt='No' WHERE crby_tbl_users=?", [input.userId]);
    let recordId = input.itemId ?? 0;
    if (input.itemId) {
      const values: Array<string | number> = [input.name, input.details, input.visibilityId, input.isProfilePicture ? "Yes" : "No"];
      let pictureClause = "";
      if (input.picture) { pictureClause = ",pict=?"; values.push(input.picture); }
      values.push(input.itemId, input.userId);
      await connectionHandle.execute(`UPDATE ursoc020 SET name=?,dsca=?,urpms010_id=?,pfpt=?${pictureClause} WHERE id=? AND crby_tbl_users=?`, values);
    } else {
      if (!input.picture) throw new Error("IMAGE_REQUIRED");
      const [result] = await connectionHandle.execute<ResultSetHeader>("INSERT INTO ursoc020 (name,dsca,pict,crdt,pfpt,urpms010_id,crby_tbl_users) VALUES (?,?,?,NOW(),?,?,?)", [input.name, input.details, input.picture, input.isProfilePicture ? "Yes" : "No", input.visibilityId, input.userId]);
      recordId = Number(result.insertId);
    }
    await writeLegacyAudit(connectionHandle, { model: "ursoc020", action: input.itemId ? "Update" : "Insert", recordId, actorId: input.actorId, address: input.address, summary: `gallery profile detail ${input.itemId ? "updated" : "created"}` });
    await connectionHandle.commit();
  } catch (error) { await connectionHandle.rollback(); throw error; } finally { connectionHandle.release(); }
}
