# Bot and database-load protection

The application rejects malformed public query strings before rendering. In particular, `/index.php` accepts only the migrated legacy keys `r`, `id`, and `view`; old relation-sort query strings are answered with `400` and never reach a database repository.

`proxy.ts` also applies a per-instance request circuit breaker to the database-backed public pages:

| Request class | Limit per client IP | Window |
| --- | ---: | ---: |
| Legacy `/index.php` | 12 | 1 minute |
| Search/list pages | 30 | 1 minute |
| Public detail pages | 60 | 1 minute |
| Database health endpoint | 10 | 1 minute |

Over-limit traffic receives `429` with `Retry-After`. Detail and list responses receive short shared-cache headers, so a CDN/reverse proxy can serve repeated bot and crawler visits without rerunning database queries.

## Required deployment layer

The application limiter is intentionally a fast per-instance circuit breaker. It is not a replacement for an edge WAF because multiple instances or distributed IPs can bypass an in-memory counter. Put Cloudflare (or an equivalent WAF) in front of the site and configure an Nginx rate limit as a second layer. The proxy must strip client-provided `X-Forwarded-For` and set it from the trusted connection / CDN IP.

```nginx
limit_req_zone $binary_remote_addr zone=rcopt_public:20m rate=30r/m;
limit_conn_zone $binary_remote_addr zone=rcopt_conn:20m;

location ~ ^/(index\.php|doctors|articles|news|community/questions) {
    limit_req zone=rcopt_public burst=15 nodelay;
    limit_conn rcopt_conn 15;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_pass http://rcopt_next;
}
```

Also create a WAF rule for `/index.php` that blocks query keys other than `r`, `id`, and `view`, and challenge/block abusive user agents or request rates. Keep an allowlist for known monitoring and search-engine traffic only where needed.
