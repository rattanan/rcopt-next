# Security review — Phase 3 baseline

Status: discovery baseline, 22 July 2026.

| Severity | Finding | Current mitigation / required action |
|---|---|---|
| Critical | Legacy account passwords use unsalted MD5. | Never use MD5 for new credentials. Restrict compatibility verification to active superusers, use generic errors and rate limits, and do not auto-upgrade while Yii remains active. |
| High | Legacy RBAC tables exist but contain no roles or assignments. | Enforce the verified `superuser=1` boundary centrally. Do not infer editor/doctor permissions. |
| High | Legacy schema has no persistent session table. | A file-backed opaque session store is implemented. Production must mount one persistent, access-restricted path shared by all instances; keep `ADMIN_WRITE_ENABLED=false` until this is verified. |
| High | Legacy uploads save client filenames directly beneath web-served directories. | Keep new uploads disabled until MIME validation, randomized naming, safe shared path, and cleanup behavior are implemented and tested. |
| High | Legacy HTML can contain externally sourced markup. | Continue server-side sanitization with strict iframe and URL allowlists; sanitize before any Admin preview/save path. |
| Medium | Legacy source has no failed-login counter or lockout record. | File-backed limiter now permits five failed attempts per IP + identifier per 15 minutes and keeps generic errors. In production, its file must be on the same persistent mount as sessions; move it to a shared rate-limit service before horizontal scaling. |
| Medium | Legacy audit strings may include full record values. | Use redacted summaries only; never include secrets or sensitive personal data. |
| Medium | Public health discussions can contain personally identifying information. | Preserve redaction on public views; add consent, CAPTCHA, moderation and rate limiting before enabling posting. |
| Low | Legacy controllers include broad export actions for admins. | Do not expose exports until each dataset's privacy classification is reviewed. |

Critical and High findings must be resolved or explicitly accepted in a deployment review before Admin write mode is enabled.
