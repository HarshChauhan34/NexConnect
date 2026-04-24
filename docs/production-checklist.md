# Production Checklist

## Security
- Set `NODE_ENV=production` in backend runtime.
- Use HTTPS only for frontend and backend domains.
- Rotate all compromised secrets and use secret managers.
- Keep `JWT_SECRET` and `REFRESH_TOKEN_SECRET` unique and high entropy.
- Keep `CORS_ORIGINS` limited to trusted domains.
- Verify `httpOnly`, `secure`, `sameSite` cookie behavior in production.

## Performance
- Serve frontend behind a CDN with immutable cache for `/assets/*`.
- Keep API behind a reverse proxy with HTTP/2 and connection keep-alive.
- Enable compression at edge/proxy:
  - `gzip on;`
  - `brotli on;` (if supported)
- Keep image assets in modern formats (WebP/AVIF) and lazy load in UI.

## Reliability
- Add uptime probes to `/healthz`.
- Track API latency, 4xx/5xx rates, and retry counts.
- Alert on elevated error rate and auth refresh failures.
- Run CI on all pull requests before deploy.

## Nginx Example (API)
```nginx
server {
  listen 443 ssl http2;
  server_name api.example.com;

  gzip on;
  gzip_types text/plain text/css application/json application/javascript application/xml+rss;

  location / {
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://127.0.0.1:5000;
  }
}
```

