# Route mapping

| Legacy URL | New URL | Status |
|---|---|---|
| `/` | `/` | implemented |
| `index.php?r=users/find` | `/doctors` | redirect configured |
| `index.php?r=users/profile&id=N` | `/doctors/N` | redirect intent documented; detail page next phase |
| `index.php?r=arart010/list&id=N` | `/articles` | public shell implemented; category mapping pending runtime validation |
| `index.php?r=arart010/detail&id=N` | `/articles/N` | next phase |
| `index.php?r=wbtpc010/list&id=N` | `/news` | public shell implemented |
| `index.php?r=wbtpc010/detail&id=N` | `/news/N` | next phase |
| `/about`, `/contact`, `/search` | same paths | shell implemented |

Canonical, sitemap and detailed metadata should be added together with verified content queries. Do not remove legacy URLs until the result comparison checklist passes.
