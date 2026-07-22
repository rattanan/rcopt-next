# Public data mapping

ตรวจสอบกับ MySQL database `rcopt` เมื่อ 22 กรกฎาคม 2569 โดยใช้ `SELECT`, `DESCRIBE`, `SHOW` และ `EXPLAIN` เท่านั้น ไม่มีการแก้ schema หรือข้อมูล

| Public feature | Legacy table / PK | Public fields and relations | Status, nulls, scale |
|---|---|---|---|
| Doctor | `tbl_profiles.user_id` + `tbl_users.id` | Display: `title`, `firstname`, `lastname`, `licn`; active rule: `profiles.memtype=2 AND users.status=1`. Profile photo: `ursoc020.pict` where `crby_tbl_users=user_id`, `pfpt='Yes'`, `urpms010_id=1`; specialty: `urprf010.crby_tbl_users -> urprf011.id`; workplace: `urprf030.crby_tbl_users -> cmcom010.id` | 1,379 active records; 1,129 marked profile pictures. `title`, `licn`, photo, specialty and workplace may be null. Thai stored as UTF-8/utf8mb4. |
| Hospital/workplace | `urprf030.id` | `name`, `addr`, `teln`, `url`, `urlm`, `cmcom010_id`; province relation `cmcom010.id` | 1,086 rows. Only name and province are public in the new profile; contact/address are not exposed without a legacy-public review. |
| Specialization | `urprf011.id` | `name`; link table `urprf010.urprf011_id` | 1,167 profile links. Applied only with `urpms010_id=1`. |
| Province | `cmcom010.id` | `name`; used by `urprf030.cmcom010_id` | Lookup data, Thai province names; null workplace province is possible. |
| Article / static page | `arart010.id` | `name`, `intro`, `body`, `pimg`, `crdt`, `fetd`; category `arcat010.id` via `arcat010_id`; attachments `arart011.arart010_id` are not yet displayed | 1,030 total; 933 published where `pubd='Yes'`. Body is legacy HTML and is sanitized server-side. There is no slug. |
| News | `arart010.id` with `arcat010_id=1` | Same table as articles; category 1 is `ข่าวสารและกิจกรรม` | 518 published records. `pubd='Yes'` is the only publishing rule observed. |
| Category | `arcat010.id` | `name`, `dsca` | 34 categories. Category 1 is mapped to `/news`; other published categories to `/articles`. |
| Community / jobs (not news) | `wbtpc010.id`, `wbcat010.id` | `name`, `dsca`, `pict`, `yutb`, `crdt`, `enbl`; messages `wbtpc011` | 3,561 total; 3,280 enabled. These are public discussion/job records, not editorial news, and are deferred. |
| Public consultation board | `wbtpc010.id` category 1, replies `wbmsg010.id` | Topic: `name`, `dsca`, `crdt`, `lmdt`, `hits`, `nmmg`, `enbl`; replies: `name`, `crdt`, `wbtpc010_id` | 3,280 enabled community records overall. The new public board includes category 1 only, is read-only, sanitizes HTML and redacts contact information from legacy posts. |
| Banner | `cmban010.id` | `name`, `dsca`, `pimg`, `href`, `enbl` | 3 rows, 2 enabled. Image filenames resolve as `images/banner/<filename>`. `cmban020` is a dated campaign table (1 historic row) and is not used for the live hero. |
| Video | `vdo.id` | `title`, `detail`, legacy Flash `embed`, `post_date`, `ordering`, `activated` | 52 rows. The new site extracts only strict 11-character YouTube IDs from enabled legacy embeds and renders a modern privacy-enhanced YouTube iframe. |
| Static page | No dedicated static-page table was found | Legacy informational pages are stored as `arart010` records in categories such as 3 (about RCOPT), 11–13 (organization information) | New shell routes remain source-configured until each public category/page mapping is reviewed. |

## Legacy files and language

- Article cover: `images/uploads/<arart010.pimg>`; banner: `images/banner/<cmban010.pimg>`; doctor photo: `images/member/<ursoc020.pict>`.
- Existing rows may contain missing images, `NULL`, relative filenames with spaces, or absolute external images embedded in HTML. `lib/legacy-assets.ts` allows only validated relative paths and `http(s)` URLs; invalid or traversal-like values fall back to the local crest.
- The browser never receives `LEGACY_UPLOAD_PATH`; when configured, a constrained `/api/legacy-assets/<area>/<filename>` proxy serves only permitted image extensions from the configured asset root. When it is not configured, `LEGACY_ASSET_BASE_URL` is used as the public origin.
- `arart010.body` includes presentation markup, external links and iframe markup in sample rows. Scripts, event handlers, unsafe protocols and iframe/object content are removed before rendering.
