# Data validation results

Run against the legacy MySQL fixture on 22 July 2569 using read-only SQL.

| Check | Result |
|---|---:|
| Active doctor rule (`memtype=2`, `status=1`) | 1,379 |
| Search `สมชาย` using the same name predicate | 5 |
| Highest province counts | กรุงเทพมหานคร 437; สงขลา 41; เชียงใหม่ 40 |
| Published `arart010` records | 933 |
| Published news (article category 1) | 518 |
| Latest-content sample IDs | 2234, 2232, 2231, 2230, 2221, 2217, 2000, 2235, 2233, 2229 |
| Enabled banners (`cmban010`) | 2 |

## Phase 3 test database validation — 22 July 2026

- Target: `127.0.0.1:3306`, database `rcopt`, account `rcopt_user@%`.
- Server read-only mode: disabled; 63 tables detected.
- Write permission validation: an `arart010` no-op update was executed inside a transaction and rolled back successfully. No persistent data was changed.
- Backup validation: `backups/rcopt-20260722-174536.sql.gz` was created with `mysqldump --single-transaction --routines --events --no-tablespaces`, passed `gzip -t`, and contains legacy table DDL/data. The directory is ignored by Git.
- Local test configuration now enables `ADMIN_WRITE_ENABLED=true`. This only enables future protected write actions; it does not itself mutate application data.

The first ten content IDs above were read directly from `arart010` using the new stable ordering (`awtp ASC, crdt DESC, id DESC`). The legacy public origin timed out during this run, so browser-to-browser output comparison remains a pre-cutover task. Next.js route rendering is verified locally against the same DB.

See `data-validation-checklist.md` for the deploy-time comparison checklist.
