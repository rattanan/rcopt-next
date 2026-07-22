# Data validation checklist

- [ ] Run `GET /api/health` and `GET /api/health/database` in the deployed environment.
- [ ] Compare `COUNT(*)` for `tbl_users`, `tbl_profiles`, `arart010`, `cmban010`, `urprf030` with a read-only legacy query.
- [ ] Compare 20 known doctor IDs and names from `users/profile&id=N` against `/doctors/N`.
- [ ] Compare doctor search with Thai, English, partial-name and empty terms; confirm page 1/2 boundaries.
- [ ] Verify `memtype=2` and `status=1` semantics with the legacy `UsersController::actionFind` result.
- [ ] Check UTF-8/Thai rendering, date formatting, image paths and missing-image behavior.
- [ ] Confirm old query URLs return 301/expected compatibility behavior before DNS cutover.
- [ ] Run `npm run lint` and `npm run build`; test mobile widths and keyboard navigation.

All comparison queries must be read-only. Record timestamp, query, row count, sample IDs and reviewer in the release ticket.
