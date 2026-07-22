# Unmapped legacy URLs

The compatibility handler maps the highest-value read-only routes below. Unknown legacy routes return `404`; they are never redirected to the home page, so crawlers and users do not receive a misleading destination.

| Legacy route | New route | Status |
|---|---|---|
| `users/find` | `/doctors` | mapped |
| `users/profile&id=N` | `/doctors/N` | mapped |
| `arart010/list&id=1` | `/news` | mapped |
| `arart010/list&id=N` | `/articles?category=N` | mapped |
| `arart010/detail&id=N` | `/articles/N` | mapped |
| `wbtpc010/list&id=N` | — | deferred; returns 404 until a public discussion/Job Center design is approved |
| `wbtpc010/detail&id=N` | — | deferred; returns 404 until a public discussion detail is approved |

Do not add permanent redirects for account, admin, form-submission, or other authenticated/mutating legacy URLs until their public behavior and security requirements are reviewed.
