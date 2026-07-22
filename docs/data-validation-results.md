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

The first ten content IDs above were read directly from `arart010` using the new stable ordering (`awtp ASC, crdt DESC, id DESC`). The legacy public origin timed out during this run, so browser-to-browser output comparison remains a pre-cutover task. Next.js route rendering is verified locally against the same DB.

See `data-validation-checklist.md` for the deploy-time comparison checklist.
