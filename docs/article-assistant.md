# ผู้ช่วยบทความ RCOPT

Floating chat is mounted in the root layout on public pages. It replaces the previous externally embedded homepage widget. Conversation state stays in memory until refresh; the application does not persist chat messages. The configured AI provider receives the submitted conversation and selected published article excerpts.

Server-only environment variables (never use NEXT_PUBLIC prefixes):

- OPENAI_API_URL: OpenAI-compatible base URL ending in /v1, or full /chat/completions URL.
- OPENAI_API_KEY: provider credential.
- OPENAI_MODEL: model identifier from the provider.

The route uses Chat Completions JSON mode supported by the configured endpoint and validates the returned JSON with Zod. Documentation: https://developers.openai.com/api/docs/guides/structured-outputs#json-mode

POST /api/chat accepts message (1–1200 characters), up to eight bounded history messages, and an optional articleId. It reads only published non-news articles, segments Thai search terms, ranks titles/intros/bodies, and sends up to six bounded excerpts. A current article ID only takes effect if it exists in that public query. It never queries member records. No embedding service or database migration is required. Text inside scanned images/PDF attachments is not indexed.

Citation links are created on the server from retrieved IDs; action destinations are an application-owned allowlist. Model content is displayed as text, never injected as HTML. Reference documents are explicitly treated as data, not instructions. No match produces a local explanatory response. Provider failures produce a retryable Thai error and retain the user's draft.

Protection: same-origin checks, 50 KB actual request-body cap, per-address 12 requests/minute, six concurrent model requests per process, 55-second provider timeout, bounded output/history, no-store responses. The in-process limits assume the current single PM2 application process; use a shared limiter before scaling horizontally. The existing reverse proxy must overwrite trusted client IP headers. No prompt, key, or upstream error body is logged by this route.

Verify with npm test, npm run typecheck, npm run lint, npm run build, then test a real question and article-summary action against the deployed provider. Check mobile layout and keyboard Escape/focus return. Missing AI configuration returns 503 without affecting normal site navigation.
