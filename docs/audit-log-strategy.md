# Audit log strategy

The legacy schema provides `syadm040` (per-model logging configuration) and `syadm041` (audit records). The legacy Active Record models write `Insert`, `Update`, or `Delete` entries only when the matching `syadm040.logs` value is `Yes`.

`syadm041` stores `crdt`, `atyp`, `mdel`, `ipad`, `logd`, `crby_tbl_users`, and `reid`. It does not provide an explicit before/after structure. Legacy code serializes full attributes into `logd`; the Next.js implementation must not copy that behavior for password, token, contact, or other sensitive fields.

## Phase 3 policy

- Read audit configuration before any write; do not create or modify audit settings.
- When legacy logging is enabled for an implemented module, write the legacy-compatible fields and record a redacted summary only.
- Audit records are written in the same transaction as the protected database mutation where both tables are available.
- Record only model name, record id, action, actor id, timestamp, and validated client IP when the deployment supplies one safely.
- Do not log passwords, password hashes, CSRF values, session ids, reset data, or raw HTML bodies.
- When `syadm040` is disabled or unavailable, emit a redacted application log and document the limitation; do not create a new audit table.
