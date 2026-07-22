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
4. **For the live CMS** (edit content from the browser, saved for all visitors):
   - Settings → Functions → **KV namespace bindings** → add binding, variable name
     `CONTENT`, pointing at a new KV namespace.
   - Settings → Environment variables → add `ADMIN_KEY` (your CMS password).
5. **Custom domains** tab → add the domain — DNS is automatic since it's on Cloudflare.
6. Production branch = `main`. Pushes to `dev` create preview deployments with unique
   URLs — that becomes your hosted dev env.

The frontend auto-detects the functions: same build works on both hosts, no code change.

## The CMS (editing content)

Open **`/admin.html`** on the site (or ⌘K → "Open the CMS").

- **On GitHub Pages** (no backend): edit → *Save draft* → *Preview* (opens the site with
  your draft) → *Publish* tab → *Download content.json* into `public/`, commit & push.
  Edited the Deeper Dive? *Download vault.enc.json* into `public/` too. Redeploys in ~1 min.
- **On Cloudflare** (with KV + `ADMIN_KEY`): edit → *Publish live* writes straight to KV,
  visible to everyone instantly. (The Deeper Dive still downloads as an encrypted file to
  commit, since it's served statically.)

The editor key you type is your `ADMIN_KEY` on Cloudflare; on static hosting it just
unlocks the editor UI locally (publishing there always goes through git, which is the real
gate).

## Checklist for Tarek

- [ ] Buy domain on Cloudflare
- [ ] Connect repo to Cloudflare Pages (steps above)
- [ ] Paste `ANTHROPIC_API_KEY` env var
- [ ] Verify chat shows "● live — powered by Claude"
- [ ] Change the vault access key in `.vault-pass` + `npm run vault` + push
- [ ] Record a 60–90s voice intro (optional next feature — hero play button)
