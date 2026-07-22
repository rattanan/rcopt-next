# Admin authentication analysis

Status: Phase 3 discovery, 22 July 2026. All database inspection for this analysis was read-only.

## Confirmed legacy identity model

| Concern | Confirmed implementation |
|---|---|
| User table | `tbl_users` (`id`, `username`, `password`, `email`, `activkey`, `create_at`, `lastvisit_at`, `superuser`, `status`) |
| Profile table | `tbl_profiles`, joined by `user_id`; `memtype=2` identifies doctors in the public directory |
| Password format | Unsalted MD5. `UserModule::$hash` is `md5`; `UserModule::encrypting()` calls `md5()`. The legacy `TblUsersController` also hashes changed passwords with MD5. |
| Login identifier | Yii User module accepts username or email, then compares `md5(submittedPassword)` to `tbl_users.password`. |
| Account status | `status=1` is active; `status=0` is inactive; source also recognizes `status=-1` as banned. Runtime inspection found 1,661 active standard accounts and 8 active `superuser=1` accounts. |
| Admin marker | `tbl_users.superuser=1`; legacy CRUD controllers use `Helpers::getAdminUsers()`, which reads these usernames. |
| Legacy RBAC | Tables `AuthItem`, `AuthItemChild`, `AuthAssignment`, and `Rights` exist, but runtime inspection found `AuthAssignment` has 0 rows and `AuthItem` has no rows. No effective per-module role assignment exists. |
| Auto-login | Yii `RWebUser` has cookie auto-login enabled. Cookie/session implementation is framework-managed and is not compatible with Next.js. |
| Password reset | The Yii User module has recovery/activation flows backed by `activkey`; no independent reset-token/session table was found. |

## Security assessment

MD5 is unsafe for newly stored passwords and cannot be upgraded in-place without breaking the legacy Yii application, which verifies MD5 directly. Password values and hashes must never be logged, returned to the browser, or included in audit data.

The old `activkey` is used by the Yii User module for activation/recovery. The Next.js application must not reuse or rotate it for session invalidation because that could invalidate legacy workflows.

## Phase 3 compatibility decision

1. Compatibility verification may compare `md5(password)` only on the server for an active `superuser=1` account.
2. Do not automatically rehash or update `tbl_users.password`; the legacy application still depends on MD5.
3. Only active superusers are eligible for the initial Admin CMS. Standard members and doctors do not receive CMS access merely because they are active.
4. A Next.js session contains only a minimal user id, username, issued/expiry values, and an opaque session identifier. The server stores only the SHA-256 hash of that identifier in `ADMIN_SESSION_STORE_PATH`; the cookie is `httpOnly`, `sameSite=lax`, `secure` in production, expires after 12 hours, and is rotated after login. Login uses a short-lived `httpOnly`, `sameSite=strict` CSRF cookie and validates the request origin.
5. The approved session store for this deployment is an atomic, permission-restricted text JSON file. Production must mount the same persistent, access-restricted path at `ADMIN_SESSION_STORE_PATH` for every application instance. A per-container ephemeral path is not acceptable for restart recovery or multi-instance deployment. Admin write operations remain blocked by `ADMIN_WRITE_ENABLED=false`.
6. `/admin/forgot-password` and `/admin/reset-password` must stay informational in this phase: instruct the user to contact an administrator. No reset token table may be created.

## Legacy admin URLs and controls

- User module paths: `/user/login`, `/user/logout`, `/user/recovery`.
- Rights module base path: `/rights`.
- Most legacy CMS controllers allow `index`/`view` to authenticated users but reserve create, update, delete, export, and administration to `Helpers::getAdminUsers()`.
- The legacy source has no failed-login counter, lockout record, or dedicated session table.

## Implementation risks and follow-up

- Rate limiting and session persistence must be supplied by the Next.js deployment/runtime, not inferred from the legacy schema.
- The empty RBAC tables mean the initial permission model may only faithfully expose the legacy superuser boundary. Granular roles require a later approved data-governance decision, not invented permissions.
- Before enabling write mode, verify the configured database is a clone/test database and run the backup script in `scripts/backup-database.sh`.
