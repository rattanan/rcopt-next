import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";
import { writeLegacyAudit } from "@/lib/admin-write";

export type MemberProfile = RowDataPacket & {
  id: number;
  username: string;
  email: string | null;
  title: string | null;
  firstname: string | null;
  lastname: string | null;
  sex: number | null;
  memtype: number | null;
  licn: string | null;
};

export async function findMemberProfileById(userId: number): Promise<MemberProfile | undefined> {
  const [rows] = await db.execute<MemberProfile[]>("SELECT u.id,u.username,u.email,p.title,p.firstname,p.lastname,p.sex,p.memtype,p.licn FROM tbl_users u LEFT JOIN tbl_profiles p ON p.user_id=u.id WHERE u.id=? AND u.status=1 LIMIT 1", [userId]);
  return rows[0];
}

export async function updateOwnMemberProfile(input: { userId: number; email: string; title: string; firstName: string; lastName: string; sex: number; licenseNumber: string; address: string }): Promise<boolean> {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [updated] = await connection.execute<ResultSetHeader>("UPDATE tbl_users SET email=? WHERE id=? AND status=1", [input.email || null, input.userId]);
    if (updated.affectedRows !== 1) {
      await connection.rollback();
      return false;
    }
    await connection.execute("INSERT INTO tbl_profiles (user_id,lastname,firstname,lang,sex,memtype,title,prcm,licn,uredu012_id) VALUES (?,?,?,'en',?,0,?,10,?,0) ON DUPLICATE KEY UPDATE lastname=VALUES(lastname),firstname=VALUES(firstname),sex=VALUES(sex),title=VALUES(title),licn=VALUES(licn)", [input.userId, input.lastName, input.firstName, input.sex, input.title, input.licenseNumber || null]);
    await writeLegacyAudit(connection, { model: "TblProfiles", action: "Update", recordId: input.userId, actorId: input.userId, address: input.address, summary: "member updated own profile" });
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
