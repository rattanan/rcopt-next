# Unmapped legacy URLs

The compatibility handler maps the highest-value read-only routes below. Unknown legacy routes return a temporary `302 /`, not a permanent redirect, so SEO damage is limited until an explicit mapping is verified.

| Legacy route | New route | Status |
|---|---|---|
| `users/find` | `/doctors` | mapped |
| `users/profile&id=N` | `/doctors/N` | mapped |
| `arart010/list&id=1` | `/news` | mapped |
| `arart010/list&id=N` | `/articles?category=N` | mapped |
| `arart010/detail&id=N` | `/articles/N` | mapped |
| `wbtpc010/list&id=1` | `/community/questions` | deferred target; route not implemented |
| `wbtpc010/list&id=2` | `/community/jobs` | deferred target; route not implemented |
| `wbtpc010/detail&id=N` | `/community/questions/N` | deferred target; route not implemented |

Do not add permanent redirects for account, admin, form-submission, or other authenticated/mutating legacy URLs until their public behavior and security requirements are reviewed.
