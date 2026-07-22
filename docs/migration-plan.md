# Migration plan

1. **Phase 0 — Discovery:** inventory source, routes, models, assets and database metadata. No schema or production writes.
2. **Phase 1 — Foundation:** Next App Router, strict TypeScript, Tailwind, shared layout, env validation, MySQL pool, health endpoints and security headers. (Current)
3. **Phase 2 — Read-only public:** doctor search/detail, articles, news, hospitals, homepage, global search, SEO and redirects. Validate every query against legacy output.
4. **Phase 3 — CMS:** only after public read-only parity. Map existing CRUD fields exactly; Zod validation and CSRF protection for mutations.
5. **Phase 4 — Cutover:** mobile/SEO/security/build checks, PM2/Nginx runbook, staged rollout, monitoring and rollback.

Database safety: no Prisma migrate/db push, DDL, migration files, table/column renames, bulk writes or schema changes.
