# Tarek Karaman — interactive executive CV

A personal-brand site for CTO / Chief AI Officer mandates that is itself the demonstration:
an AI concierge grounded in the career corpus, a ⌘K command palette, recruiter mode,
an encrypted confidential vault, and a hidden terminal for the engineers on the panel.

## Environments

| Env | What | Where |
| --- | --- | --- |
| dev | local Vite server | `npm run dev` → http://127.0.0.1:5350 (branch: `dev`) |
| prod | GitHub Pages, auto-deploys on push to `main` | https://tarekkaraman.github.io/tarek-cv/ |
| next | Cloudflare Pages (custom domain + live Claude chat) | see `DEPLOY.md` |

## Daily workflow

```bash
npm run dev          # local dev on :5350
git checkout dev     # work on dev branch
# … edit, verify …
git checkout main && git merge dev && git push   # deploys prod
```

## Editing content

- **Everything public**: `src/data/profile.js` — single source of truth (page, chat, palette and terminal all render from it).
- **Confidential vault**: `private/vault-content.json` (gitignored, never leaves this machine in plain text). After editing run:

```bash
npm run vault
```

- **Access key**: stored in `.vault-pass` (gitignored). To change it, edit `.vault-pass` and run `npm run vault` again.
- **CV PDF**: replace `public/Tarek_Karaman_CV.pdf`.
- **LinkedIn pulse**: update `linkedinPulse` in `src/data/profile.js` when you post.

## The AI concierge

Two modes, auto-detected:
- **On-device** (GitHub Pages): grounded retrieval over the profile corpus — no API, no data leaves the browser.
- **Live Claude** (Cloudflare Pages): `functions/api/chat.js` calls the Anthropic API with a guardrailed system prompt. Requires `ANTHROPIC_API_KEY` env var in Cloudflare Pages settings.

## Security notes

- Vault content is AES-256-GCM encrypted (PBKDF2-SHA256, 310k iterations) at build time; the public repo and site only ever contain ciphertext.
- A wrong key fails GCM authentication — there is no client-side check to bypass.
- `private/`, `.vault-pass` and `.env*` are gitignored.
