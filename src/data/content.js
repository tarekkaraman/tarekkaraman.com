// Resolves the live content for the site. Priority:
//   1. /api/content        — Cloudflare KV (live CMS, seen by everyone)
//   2. ./content.json      — committed file (CMS "publish" on GitHub Pages)
//   3. bundled profile.js  — the default/seed
// A local CMS draft in localStorage (tk-content-draft) overrides everything
// *in the editor's own browser only*, so Tarek can preview before publishing.

import { profile as DEFAULT } from './profile.js';

export const DEFAULT_CONTENT = DEFAULT;

function merge(base, over) {
  if (Array.isArray(over)) return over.slice();
  if (over && typeof over === 'object') {
    const out = { ...base };
    for (const k of Object.keys(over)) out[k] = merge(base?.[k], over[k]);
    return out;
  }
  return over === undefined ? base : over;
}

export async function loadContent({ preferDraft = false } = {}) {
  // Editor preview draft (local only)
  if (preferDraft) {
    try {
      const draft = JSON.parse(localStorage.getItem('tk-content-draft') || 'null');
      if (draft) return merge(DEFAULT, draft);
    } catch {}
  }

  // 1. Live KV
  try {
    const r = await fetch('./api/content', { headers: { accept: 'application/json' } });
    if (r.ok && (r.headers.get('content-type') || '').includes('json')) {
      const data = await r.json();
      if (data && data.name) return merge(DEFAULT, data);
    }
  } catch {}

  // 2. Committed file
  try {
    const r = await fetch('./content.json', { headers: { accept: 'application/json' } });
    if (r.ok && (r.headers.get('content-type') || '').includes('json')) {
      const data = await r.json();
      if (data && data.name) return merge(DEFAULT, data);
    }
  } catch {}

  // 3. Default
  return DEFAULT;
}
