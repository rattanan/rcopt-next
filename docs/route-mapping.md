# Route mapping

| Legacy URL | New URL | Status |
|---|---|---|
| `/` | `/` | implemented |
| `index.php?r=users/find` | `/doctors` | redirect configured |
| `index.php?r=users/profile&id=N` | `/doctors/N` | implemented |
| `index.php?r=arart010/list&id=1` | `/news` | implemented; category 1 is News |
| `index.php?r=arart010/list&id=N` | `/articles?category=N` | implemented |
| `index.php?r=arart010/detail&id=N` | `/articles/N` | implemented |
| `index.php?r=wbtpc010/list&id=N` | `/community/*` | intentionally deferred: this is discussion/Job Center, not editorial news |
| `index.php?r=wbtpc010/detail&id=N` | `/community/questions/N` | intentionally deferred |
| `/about`, `/contact`, `/search` | same paths | shell implemented |

Canonical, sitemap and detailed metadata should be added together with verified content queries. Do not remove legacy URLs until the result comparison checklist passes.
