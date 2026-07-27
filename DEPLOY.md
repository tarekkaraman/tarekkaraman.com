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

## Status

- [x] Domain added to Cloudflare (`tarekkaraman.com`)
- [x] Repo connected to Cloudflare Pages (project `tarekkaraman-com`)
- [x] Custom domain live with SSL
- [ ] Three secrets below, added in the dashboard (each is a paste, no coding)
- [ ] Change the Deeper Dive / References keys from the placeholders before sharing

## The three secrets (Cloudflare dashboard → your Pages project → Settings → Environment variables)

Add each as type **Secret**, Production environment:

1. **`ANTHROPIC_API_KEY`** — turns on live Claude chat (from console.anthropic.com). Without
   it the concierge still works, using its built-in fact-lookup instead of live Claude.
2. **`ADMIN_KEY`** — your CMS login/publish password. Set it to `TarekKaraman1982` to match
   what already works when the CMS is in local mode.
3. **`GITHUB_TOKEN`** — this is what makes **"Publish live" in the CMS actually work with
   no GitHub involved on your end.** Clicking Publish commits the change straight to this
   repo behind the scenes, which is what triggers Cloudflare to rebuild the site (~30-90s).
   You never see GitHub, you just click Publish and wait a minute.
   - Create one at **github.com/settings/personal-access-tokens/new**
   - Repository access → **Only select repositories** → `tarekkaraman.com`
   - Permissions → **Contents: Read and write** (nothing else needed)
   - Copy the token (starts `github_pat_…`) and paste it as the `GITHUB_TOKEN` secret

After adding all three: **Deployments → Retry deployment** so they take effect.

### Verify
- Visit https://tarekkaraman.com — the concierge footer should read "● live — powered by Claude".
- Open https://tarekkaraman.com/admin, log in, and the mode pill should read
  "● live, Publish commits straight to the site". Edit something → **Publish live** →
  wait about a minute → refresh the site to confirm.

## Publishing content day to day

Once the three secrets are set, everything is a single click in `/admin`:
- **Public content** (scorecard, journey, pulse, media, etc.): edit → **Publish live**.
- **SEO** (page title, meta description, share-image alt text, topics/keywords, search
  console verification): edit in the **SEO** tab → **Publish live** — it bakes those values
  straight into `index.html`'s actual `<title>`, meta, Open Graph, Twitter Card and
  Person JSON-LD tags, so search engines and link-preview bots see them without running
  any JavaScript.
- **Deeper Dive / References** (encrypted): enter the relevant key in that tab, edit, then
  **Publish live** — it re-encrypts and commits the file for you automatically.

No downloads, no git, no GitHub. The download buttons stay available as a manual
fallback (e.g. if a secret is temporarily missing), but they aren't the normal path once
the secrets above are set.

## SEO setup (worth doing once you're live)

1. **Google Search Console** (search.google.com/search-console) → Add property →
   `tarekkaraman.com` → verify via the **HTML tag** method → copy just the `content="…"`
   value → paste into `/admin` → SEO → *Google Search Console verification code* →
   Publish live. Once verified, submit `https://tarekkaraman.com/sitemap.xml` under
   Sitemaps so Google knows the page exists.
2. **Bing Webmaster Tools** (bing.com/webmasters) → same idea → paste the code into
   *Bing Webmaster Tools verification code* → Publish live → submit the same sitemap URL.
   Bing also powers ChatGPT's and Copilot's web search, so this one matters more than it
   used to.
3. **Topics tab**: the "Topics / keywords" list feeds the page's structured data
   (`knowsAbout`), which is what tells search engines and AI answer-engines which
   subjects to associate Tarek with — e.g. "Chief AI Officer", "Microsoft Copilot
   enterprise rollout", "AI strategy Middle East". Add or refine these any time; no
   redeploy steps beyond the normal Publish live.
4. Everything else (Open Graph share card, Twitter Card, canonical URL, robots.txt,
   sitemap.xml, Person schema with education/awards/employer) is already wired up and
   requires no ongoing maintenance beyond keeping the SEO tab's title/description current.

## Legacy option: KV instead of GitHub commits

An earlier version of this CMS used a Cloudflare KV namespace bound as `CONTENT` for
instant (no-rebuild) publishing of public content only (the Deeper Dive still had to be
committed as a file either way). That path still works if you ever bind a `CONTENT` KV
namespace, but creating one currently requires the Wrangler CLI on Node 22+ (the
Cloudflare dashboard's KV page on this account has no "create" button). The GitHub-commit
path above needs no KV and covers everything, so it's the recommended setup.
