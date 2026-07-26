# Tarek Karaman — interactive executive CV

A personal-brand site for CTO / Chief AI Officer mandates that is itself the demonstration:
an AI concierge grounded in the career corpus, a ⌘K command palette, recruiter mode,
an encrypted confidential vault, and a hidden terminal for the engineers on the panel.

## Environments

| Env | What | Where |
| --- | --- | --- |
| **prod** | Cloudflare Pages, auto-builds from `main` | **https://tarekkaraman.com** |
| **dev** | local Vite server | `npm run dev` → http://127.0.0.1:5350 |
| fallback | GitHub Pages (manual mirror) | https://tarekkaraman.github.io/tarek-cv/ |

Cloudflare Pages is prod (live Claude chat + KV CMS). Dev is local only. See `DEPLOY.md`
for the one-time Cloudflare connection steps.

## Daily workflow

```bash
npm run dev                    # local dev on :5350
# … edit, verify in the browser …
git add -A && git commit -m "…" && git push   # Cloudflare builds & deploys prod
```

## Editing content — two ways

**1. The CMS (no code)** — open `/admin.html` on the site (or ⌘K → "Open the CMS").
Edit everything (basics, stats, experience, skills, philosophy, LinkedIn pulse, deep
knowledge, and the encrypted Deeper Dive), preview, then publish. See `DEPLOY.md`.

**2. In code** — `src/data/profile.js` is the default/seed content (same shape the CMS
edits). The page, chat, palette and terminal all render from the resolved content.

Content resolution order at runtime: `/api/content` (Cloudflare KV, live CMS) →
`public/content.json` (CMS "publish" on GitHub Pages) → bundled `profile.js`.

- **Deeper Dive (private)**: edit in the CMS, or `private/vault-content.json` (gitignored)
  + `npm run vault`. Access key lives in `.vault-pass` (gitignored). AES-256-GCM encrypted.
- **Voice intro**: drop an mp3 at `public/voice-intro.mp3` and set `voiceIntro` (in the CMS
  or profile.js) to `./voice-intro.mp3` — the hero play button appears automatically.
- **CV PDF**: replace `public/Tarek_Karaman_CV.pdf`.

## The AI concierge

Two modes, auto-detected:
- **On-device** (GitHub Pages): grounded retrieval over the profile corpus — no API, no data leaves the browser.
- **Live Claude** (Cloudflare Pages): `functions/api/chat.js` calls the Anthropic API with a guardrailed system prompt. Requires `ANTHROPIC_API_KEY` env var in Cloudflare Pages settings.

## Security notes

- Vault content is AES-256-GCM encrypted (PBKDF2-SHA256, 310k iterations) at build time; the public repo and site only ever contain ciphertext.
- A wrong key fails GCM authentication — there is no client-side check to bypass.
- `private/`, `.vault-pass` and `.env*` are gitignored.
