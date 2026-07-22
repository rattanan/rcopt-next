# RCOPT Next

เว็บไซต์ใหม่ของราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย (RCOPT) สร้างด้วย Next.js App Router โดยอ่านข้อมูลจาก MySQL schema เดิมโดยไม่แก้โครงสร้างฐานข้อมูล

## ความสามารถปัจจุบัน

- เว็บไซต์สาธารณะ: หน้าแรก, ข่าวสาร, บทความ, ค้นหา/รายละเอียดจักษุแพทย์, กระดานปรึกษาจักษุแพทย์แบบอ่านอย่างเดียว, About และ Contact
- Legacy compatibility: redirect สำหรับ URL `index.php?r=...` ที่ย้ายแล้ว และ asset proxy ที่จำกัดเส้นทาง
- Content safety: prepared statements, Zod validation, HTML sanitization และ redaction สำหรับข้อมูลติดต่อในกระดานสาธารณะ
- Bot protection: validation/rate limit สำหรับ legacy URL และหน้าสาธารณะที่ query ฐานข้อมูล พร้อม CDN cache headers
- SEO: metadata, canonical URL, sitemap และ robots
- Admin Phase 3 (เริ่มต้น): `/admin/login`, Admin guard, dashboard แบบอ่านอย่างเดียว และ feature flag สำหรับปิดการเขียนข้อมูล

## เริ่มต้นใช้งาน

ติดตั้ง dependencies แล้วคัดลอกไฟล์ environment:

```bash
npm install
cp .env.example .env.local
```

กำหนดค่าฐานข้อมูลและ legacy assets ใน `.env.local`:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=rcopt_user
DB_PASSWORD=
DB_NAME=rcopt
LEGACY_ASSET_BASE_URL=https://www.rcopt.org
LEGACY_UPLOAD_PATH=
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ปิดเป็นค่าเริ่มต้นเสมอ
ADMIN_WRITE_ENABLED=false
# ไฟล์นี้ต้องอยู่บน persistent volume ที่เข้าถึงได้เฉพาะ application process
ADMIN_SESSION_STORE_PATH=.runtime/admin-sessions.json
```

เริ่ม development server:

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) สำหรับเว็บไซต์สาธารณะ หรือ [http://localhost:3000/admin/login](http://localhost:3000/admin/login) สำหรับ Admin CMS

## Admin authentication

Admin login ยืนยันบัญชีเดิมจาก `tbl_users` โดยอนุญาตเฉพาะบัญชีที่มี `status=1` และ `superuser=1` เท่านั้น เพื่อรักษา compatibility กับระบบ Yii เดิม รหัสผ่าน MD5 จะถูกตรวจเฉพาะฝั่ง server และจะไม่ถูกเปลี่ยนหรือบันทึกลง log

Session เป็น opaque random token ใน cookie แบบ `HttpOnly` และเก็บเฉพาะ SHA-256 hash ของ token, user ID, username และวันหมดอายุในไฟล์ JSON ฝั่ง server Logout จะลบ session record และ cookie จริง

สำหรับ production ต้อง mount `ADMIN_SESSION_STORE_PATH` บน persistent storage เดียวกันสำหรับทุก instance และจำกัด permission ให้ application process เท่านั้น ห้าม commit โฟลเดอร์ `.runtime/`

## Database safety

- ห้ามใช้ Prisma migration, `ALTER TABLE`, `CREATE TABLE`, `DROP TABLE`, `TRUNCATE TABLE` หรือแก้ schema เดิม
- Public repositories ใช้ `SELECT` และ prepared statements
- Admin write mode ถูกปิดด้วย `ADMIN_WRITE_ENABLED=false` เป็นค่าเริ่มต้น
- ก่อนเปิด write mode ต้อง backup ฐานข้อมูล, ใช้ test database/clone และตรวจสอบ business logic เดิมของ module นั้น

สร้าง backup จาก environment โดยไม่ hard-code password:

```bash
scripts/backup-database.sh
```

ไฟล์ backup ถูกสร้างใน `./backups` หรือ path ที่กำหนดผ่าน `BACKUP_DIR`; ไม่ควร commit backup เข้า Git

## คำสั่งตรวจสอบ

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## เอกสาร

- [Legacy inventory](docs/legacy-system-inventory.md)
- [Database mapping](docs/database-mapping.md)
- [Public data mapping](docs/public-data-mapping.md)
- [Phase 3 authentication analysis](docs/admin-authentication-analysis.md)
- [Admin permission matrix](docs/admin-permission-matrix.md)
- [Audit log strategy](docs/audit-log-strategy.md)
- [Security review](docs/security-review.md)
- [Migration plan](docs/migration-plan.md)
- [Bot and database-load protection](docs/bot-protection.md)

## สถานะงาน

Public Website พร้อมใช้งานแบบอ่านข้อมูลจริงจากฐานเดิม ส่วน Admin CMS อยู่ในช่วง Phase 3: authentication, file-backed session, authorization guard และ dashboard read-only พร้อมแล้ว ข้อมูลเขียน, uploads, CMS modules และการทดสอบบน test database จะเปิดทำต่อเมื่อผ่าน backup/compatibility validation ตามแผนงาน
