# Admin permission matrix

Status: Phase 3 discovery, 22 July 2026.

## Source of truth

The legacy Rights tables are present but have no `AuthItem` or `AuthAssignment` records. The effective authorization boundary used by the legacy controllers is therefore `tbl_users.superuser=1`, via `Helpers::getAdminUsers()`.

The initial Next.js Admin CMS must not manufacture fine-grained roles. It uses the following two verified states:

| State | Determination | Admin access |
|---|---|---|
| Active superuser | `tbl_users.status=1 AND tbl_users.superuser=1` | Full access to implemented Phase 3 modules, subject to `ADMIN_WRITE_ENABLED` |
| Any other account | Not an active superuser | No Admin CMS access |

## Module matrix

| Module | Read | Create | Edit | Publish / enable | Delete | Legacy basis |
|---|---:|---:|---:|---:|---:|---|
| Dashboard | active superuser | — | — | — | — | New read-only aggregate over verified legacy data |
| Articles / News (`arart010`) | active superuser | active superuser + write flag | active superuser + write flag | active superuser + write flag | active superuser + write flag | `Arart010Controller` reserves admin/update/delete for `Helpers::getAdminUsers()`; `pubd` is the verified publish field |
| Categories (`arcat010`) | active superuser | active superuser + write flag | active superuser + write flag | N/A | blocked pending relation review | `Arcat010Controller` uses legacy admin boundary; article counter behavior requires transaction review |
| Doctors / profiles | active superuser | deferred | deferred | active-status behavior only after source mapping | deferred | Multi-table domain; no write action until relation and privacy mapping are fully validated |
| Hospitals / workplaces | active superuser | deferred | deferred | N/A | deferred | `urprf030` is related to member profiles; orphan prevention required |
| Banners (`cmban010`) | active superuser | active superuser + write flag | active superuser + write flag | active superuser + write flag | active superuser + write flag | `Cmban010Controller` reserves mutating actions to legacy admins; `enbl` is required |
| Static pages | active superuser | N/A | same as associated `arart010` record + write flag | same as `arart010` | same as `arart010` | No dedicated static-page table was found |
| Media upload | active superuser | disabled pending shared-path validation | disabled | N/A | disabled | Legacy writes files below `images/uploads` and `images/banner`; no safe new write path has yet been validated |
| Users | active superuser | deferred | deferred | active status deferred | deferred | Password compatibility and legacy activation flow require dedicated approval |

## Enforcement requirements

Every Admin page, server action, route handler, and repository write operation must verify: active session, `superuser=1`, CSRF token, rate-limit status, and `ADMIN_WRITE_ENABLED=true` before mutation. Hiding UI controls is not authorization.
