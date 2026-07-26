# Deployment

## Environments

| Env | What | Where |
| --- | --- | --- |
| **prod** | Cloudflare Pages, auto-builds from `main` | **https://tarekkaraman.com** |
| **dev** | local Vite server | `npm run dev` → http://127.0.0.1:5350 |
| fallback | GitHub Pages (manual mirror, static) | https://tarekkaraman.github.io/tarekkaraman.com/ |

Git is the source of truth. Push to `main` → Cloudflare Pages builds and deploys prod.
Everything on the site uses relative paths, so the same build works at the root domain,
on Pages preview URLs, and on the GitHub Pages subpath with no code change.

## One-time Cloudflare setup (dashboard — needs your login)

You've already added `tarekkaraman.com` to Cloudflare. Now connect the site:

1. **Workers & Pages → Create → Pages → Connect to Git** → pick the `tarekkaraman.com` repo.
2. **Build settings**
   - Framework preset: **Vite** (or "None")
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Production branch: `main`
   - Functions in `functions/` and the `_headers` / `_redirects` files are picked up
     automatically.
3. **Custom domains** tab → **Set up a custom domain** → `tarekkaraman.com`
   (and optionally `www.tarekkaraman.com` — the `_redirects` file already sends www → apex).
   DNS is automatic since the domain is on Cloudflare.
4. **Settings → Environment variables (Production)**
   - `ANTHROPIC_API_KEY` = your key from console.anthropic.com (turns on live Claude chat)
   - `ADMIN_KEY` = your CMS password
   - optional `CHAT_MODEL` (defaults to `claude-sonnet-5`)
5. **Settings → Functions → KV namespace bindings** (turns on the live CMS)
   - Create a KV namespace (e.g. `tarekkaraman-content`)
   - Add a binding: **Variable name `CONTENT`** → that namespace
6. Redeploy (Deployments → Retry deployment) so the new bindings take effect.

### Verify
- Visit https://tarekkaraman.com — the concierge footer should read
  “● live — powered by Claude”.
- Open https://tarekkaraman.com/admin.html, enter your `ADMIN_KEY`, and the mode pill
  should read “● live persistence (KV)”. Edit something → **Publish live** → refresh the
  site to confirm.

## Publishing content after go-live

- **Public content**: `/admin.html` → edit → **Publish live** (writes to KV, instant).
- **Deeper Dive + References** (encrypted): edit in the CMS, **Download vault.enc.json** /
  **references.enc.json**, drop them into `public/`, commit & push. Cloudflare rebuilds.
  (These are served as static encrypted files, so they update on build, not via KV.)

## Checklist

- [x] Domain added to Cloudflare (`tarekkaraman.com`)
- [ ] Connect `tarekkaraman.com` repo to Cloudflare Pages (steps above)
- [ ] Add custom domain in the Pages project
- [ ] Set `ANTHROPIC_API_KEY` + `ADMIN_KEY` env vars
- [ ] Add `CONTENT` KV binding
- [ ] Verify live chat + live CMS
- [ ] Change the Deeper Dive / References keys from the placeholders before sharing
