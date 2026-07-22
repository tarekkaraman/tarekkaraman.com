# Deployment

## Prod today — GitHub Pages (already wired)

Push to `main` → `.github/workflows/deploy.yml` builds with Vite and deploys `dist/` to
GitHub Pages. Public URL: **https://tarekkaraman.github.io/tarek-cv/**

The chat runs in on-device mode here (GitHub Pages can't run server functions).

## Going custom-domain + live Claude chat — Cloudflare Pages

When you buy the domain on Cloudflare:

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick the
   `tarek-cv` repo.
2. Build settings: framework **Vite**, build command `npm run build`, output `dist`.
   Functions in `functions/` are picked up automatically → `/api/chat` goes live.
3. **Settings → Environment variables**: add `ANTHROPIC_API_KEY` (console.anthropic.com).
   Optional: `CHAT_MODEL` (defaults to `claude-sonnet-5`).
4. **Custom domains** tab → add `tarekkaraman.com` (or chosen domain) — DNS is automatic
   since the domain is on Cloudflare.
5. Production branch = `main` (same prod/dev model as GitHub: pushes to `dev` create
   preview deployments with unique URLs — that becomes your hosted dev env).

The frontend auto-detects the function: same build works on both hosts, no code change.

## Checklist for Tarek

- [ ] Buy domain on Cloudflare
- [ ] Connect repo to Cloudflare Pages (steps above)
- [ ] Paste `ANTHROPIC_API_KEY` env var
- [ ] Verify chat shows "● live — powered by Claude"
- [ ] Change the vault access key in `.vault-pass` + `npm run vault` + push
- [ ] Record a 60–90s voice intro (optional next feature — hero play button)
