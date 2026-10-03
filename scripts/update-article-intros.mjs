// Usage: node --env-file=.env scripts/update-article-intros.mjs [--apply]
// This reviewed, one-off migration changes only intros of published articles.
// Source hashes prevent overwriting articles edited since the review.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import mysql from "mysql2/promise";

const apply = process.argv.includes("--apply");
const updates = JSON.parse(await readFile(new URL("./data/article-intros-20261003.json", import.meta.url), "utf8"));
if (new Set(updates.map((item) => item.id)).size !== updates.length) throw new Error("Duplicate article IDs");
for (const item of updates) {
  if (!Number.isSafeInteger(item.id) || !item.intro || item.intro.length > 500 || /[<>]/u.test(item.intro)) throw new Error(`Invalid summary: ${item.id}`);
}
const db = await mysql.createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, dateStrings: true });
try {
  await db.beginTransaction();
  const [rows] = await db.execute(`SELECT id,name,intro,body,lmdt,pubd,arcat010_id FROM arart010 WHERE id IN (${updates.map(() => "?").join(",")}) FOR UPDATE`, updates.map((item) => item.id));
  const pending = [];
  for (const item of updates) {
    const row = rows.find((row) => row.id === item.id);
    if (!row || row.pubd !== "Yes" || row.arcat010_id === 1) throw new Error(`Article unavailable: ${item.id}`);
    if (row.intro === item.intro) continue; // Safe to rerun the same migration.
    const sourceHash = createHash("sha256").update(JSON.stringify([row.id,row.name,row.intro,row.body,row.lmdt])).digest("hex");
    if (sourceHash !== item.sourceHash) throw new Error(`Source changed since review: ${item.id}`);
    pending.push({ item, row });
  }
  if (!apply || !pending.length) {
    await db.rollback(); console.log(JSON.stringify({ mode: "dry-run", reviewed: updates.length, pending: pending.length }));
  } else {
    const directory = ".runtime/backups";
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const backup = `${directory}/article-intros-${new Date().toISOString().replace(/[:.]/gu, "-")}.json`;
    await writeFile(backup, JSON.stringify({ reason: "User-requested AI summaries for duplicate/missing article intros", createdAt: new Date().toISOString(), rows: pending.map(({ row, item }) => ({ ...row, newIntro: item.intro })) }, null, 2), { flag: "wx", mode: 0o600 });
    for (const { item } of pending) {
      const [result] = await db.execute("UPDATE arart010 SET intro=?, lmdt=NOW() WHERE id=? AND pubd='Yes' AND arcat010_id<>1", [item.intro, item.id]);
      if (result.affectedRows !== 1) throw new Error(`Update failed: ${item.id}`);
    }
    await db.commit();
    console.log(JSON.stringify({ updated: pending.length, backup }));
  }
} catch (error) { await db.rollback(); throw error; }
finally { await db.end(); }
