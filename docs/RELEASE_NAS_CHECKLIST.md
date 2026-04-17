# External Release Checklist (NAS + Docker + Traefik)

## 1) Prerequisites
- [ ] A public domain is ready, e.g. `api.your-domain.com`.
- [ ] DNS `A`/`AAAA` record points to your NAS public IP.
- [ ] Router forwards ports `80` and `443` to your NAS.
- [ ] NAS firewall allows inbound `80`/`443`.

## 2) Prepare production env file
1. Copy `.env.prod.example` to `.env.prod`.
2. Set:
   - `API_DOMAIN` to your real domain.
   - `EXTENSION_ORIGIN` to your Chrome extension id origin.
   - `LETSENCRYPT_EMAIL` to a valid email for certificate notices.
   - `RATE_LIMIT_AVERAGE` and `RATE_LIMIT_BURST` to match your expected traffic.
   - `API_KEY` to a strong random secret.
   - `OPENAI_API_KEY` only if LLM is enabled.

## 3) Start production stack
```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

## 4) Verify backend health
```bash
curl https://api.your-domain.com/health
```
Expected response: `{"status":"ok"}`

## 4.1) Verify Traefik routing and certificate
```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod logs traefik
```
Check that:
- ACME certificate is issued for your `API_DOMAIN`.
- Router `tasker-api@docker` is active.

## 5) Configure extension runtime
Use the extension service worker console:
```js
await chrome.storage.local.set({
  apiBaseUrl: "https://api.your-domain.com",
  apiKey: "YOUR_PRODUCTION_API_KEY"
});
```

## 6) Security checks before store submission
- [ ] API is reachable only over HTTPS.
- [ ] `CORS_ALLOWED_ORIGINS` only includes your extension origin.
- [ ] API key is configured and unauthorized calls return 401.
- [ ] `/docs` and `/openapi.json` are disabled or protected if not needed publicly.
- [ ] NAS and container images are fully patched.
- [ ] Database backup task is scheduled (daily minimum).
- [ ] Logs are retained and monitored for abuse spikes.
- [ ] Traefik rate limiting is enabled and tuned from real traffic.

## 7) Operational checks
- [ ] `docker compose ps` shows both `api` and `traefik` healthy.
- [ ] Restart policy is active (`unless-stopped`).
- [ ] Reboot NAS and verify stack auto-recovers.
- [ ] Rollback plan exists (previous image tag + env backup).

## 8) Chrome Web Store readiness
- [ ] `host_permissions` only include Tasker and your API domain.
- [ ] Privacy policy explains collected job/proposal data and retention period.
- [ ] Store listing includes clear "assistive only / no auto submit" behavior.
- [ ] Manual QA done on at least 2 clean Chrome profiles.
