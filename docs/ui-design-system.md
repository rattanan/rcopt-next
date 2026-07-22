# UI design system

## Direction

Modern medical organization: white space, restrained pink, strong typography, quiet cards, clear calls to action, and content-first responsive layouts. The existing RCOPT identity is retained through the RCOPT mark/name and legacy asset URL configuration; image migration stays out of Git.

## Tokens

Tokens live in `app/globals.css`: `--primary`, `--primary-dark`, `--primary-light`, `--secondary`, `--border`, `--ink`, `--muted`, and `--shadow`. Components use the shared `container-shell`, `card`, `button-primary`, and `button-outline` patterns.

## Accessibility

Use semantic headings, labels for form controls, visible focus states supplied by browser defaults, text plus color for status, and touch targets of at least 40px. Verify Thai text contrast and keyboard navigation before launch.
