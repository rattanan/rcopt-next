# Database mapping

ระบบใหม่ใช้ `mysql2/promise` และ prepared statements เท่านั้นใน read-only phase ไม่มี migration และไม่มี ORM schema operation

| Feature | Legacy tables | Confirmed columns/source |
|---|---|---|
| Members/doctors | `tbl_profiles`, `tbl_users` | `user_id`, `title`, `firstname`, `lastname`, `licn`, `memtype`, `status` |
| Specialty | `urprf010`, `urprf011` | `crby_tbl_users`, `urprf011_id`, `name` |
| Workplace/hospital | `urprf030`, `cmcom010`, `cmcom011` | `crby_tbl_users`, `name`, `cmcom010_id`, `cmcom011_id`, `teln`, `urlm` |
| Articles | `arart010`, `arart011`, `arcat010` | `name`, `intro`, `body`, `pimg`, `pubd`, category relation (verify runtime) |
| Banners | `cmban010`, `cmban020` | `name`, `dsca`, `pimg`, `href`, `enbl` / `stdt`, `endt`, `stat` |
| Audit | `syadm040`, `syadm041` | legacy model writes audit records; do not enable writes in public phase |

## Doctor search contract

The doctor query uses `tbl_profiles` + `tbl_users`, filters `memtype = 2` and `status = 1`, supports name keyword, specialty (`urprf010`/`urprf011`) and province (`urprf030`/`cmcom010`), and applies bounded `LIMIT/OFFSET`. Runtime verification on 22 July 2026 found 1,379 active doctors; the query returns only public active-member records.
