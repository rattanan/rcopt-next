# Database performance recommendations

Read-only `EXPLAIN` on 22 July 2569 found no blocking issue at the current data size, but it identified legacy indexes to review in a dedicated database change window. No index was created or changed in this phase.

| Query | Observation | Recommendation for future DBA review |
|---|---|---|
| Doctor keyword search | `tbl_profiles` scans 1,977 rows and uses filesort for `LIKE '%…%'` and `CONCAT`; primary key only is available | Consider a composite index aligned to the active filter/order, e.g. `(memtype, lastname, firstname, user_id)`. Substring/full-name search still needs a separate search strategy; validate with production cardinality before adding full-text search. |
| Published news/content | `arart010` uses `arcat010_id`, scans about 572 category rows and filesorts on `awtp, crdt, id` | Consider `(arcat010_id, pubd, awtp, crdt, id)` or validate an equivalent index order with actual workload. |
| Doctor specialization/workplace filters | `EXISTS` filters use legacy link tables `urprf010` and `urprf030` | Inspect current indexes and consider `(crby_tbl_users, urpms010_id, urprf011_id)` and `(crby_tbl_users, urpms010_id, cmcom010_id)` if query volume grows. |

The public repository uses bounded page sizes and stable ordering; no unbounded browser-side filtering is performed.
