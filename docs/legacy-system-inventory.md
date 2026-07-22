# Legacy system inventory

สถานะสำรวจ: 22 กรกฎาคม 2569 (Phase 0)

## ภาพรวม

- Framework เดิม: Yii 1.x PHP, theme Bootstrap, มี OpenCart ใน `store/` แยกฐานข้อมูลอีกชุด
- Public entry point: `index.php` และ query route รูปแบบ `?r=controller/action&id=...`
- Admin/CMS: Yii controllers/views ใน `protected/controllers`, `protected/views`; มี Rights/User module และ CRUD จำนวนมาก
- Authentication: Yii User module, cookie auto-login, ตาราง `tbl_users`/`tbl_profiles`; legacy config ใช้ MD5 จึงห้ามนำ credential flow เดิมมาใช้ตรง ๆ ก่อนทำ password compatibility review
- Encoding: application ระบุ UTF-8; ระบบใหม่ใช้ `utf8mb4`

## ตารางและโดเมนที่ยืนยันจาก source

`cmban010/020` banner, `arart010/011` article/content, `arcat010` article category, `urprf010/011` practice/specialty, `urprf020` professional membership, `urprf030` workplace/hospital, `urprf040/045/050/060` publications/experience/awards/other profile data, `tbl_users` and `tbl_profiles` user/member profile, `cmcom010/011` province/district, `syadm040/041` audit configuration/log.

ยังไม่มีการแก้ไข production behavior หรือ schema ใน Phase 0/1

## สิ่งที่ยังต้องตรวจด้วย runtime DB

จำนวน record จริง, PK/FK metadata, collation ต่อ table, index, สถานะ soft-delete/active ในข้อมูลจริง, cron/email/integration ที่ deploy อยู่ และ path ของ uploads ที่ mount ใน Docker การตรวจ Docker socket ใน environment นี้ถูกปฏิเสธด้วย permission จึงต้องทำซ้ำบนเครื่อง/CI ที่เข้าถึง Docker ได้
