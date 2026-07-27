// Cloudflare Pages Function — /api/publish
// The real "Publish live" mechanism: commits files straight to the GitHub repo
// via the GitHub Contents API. That push triggers Cloudflare Pages' existing
// Git integration to rebuild and redeploy automatically (~30-90s), so the CMS
// user never sees or touches GitHub — they just click Publish.
//
// Setup on Cloudflare Pages (dashboard → Settings → Environment variables):
//   GITHUB_TOKEN = a fine-grained GitHub personal access token, scoped to ONLY
//                  this repo (tarekkaraman/tarekkaraman.com), with
//                  Contents: Read and write permission. Nothing else.
//                  Create at: github.com/settings/personal-access-tokens/new
//   ADMIN_KEY    = your CMS password (already required for the CMS gate).
// Until GITHUB_TOKEN is set, this endpoint 503s and the CMS falls back to the
// download-and-commit-yourself flow.

const REPO = 'tarekkaraman/tarekkaraman.com';
const BRANCH = 'main';
const API = 'https://api.github.com';

function b64EncodeUnicode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

async function ghFetch(path, token, init = {}) {
  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'tarekkaraman-cms',
      ...(init.headers || {})
    }
  });
}

async function commitFile(path, content, token, message) {
  // Look up the current sha (needed to update an existing file); 404 means new file.
  const getRes = await ghFetch(`/repos/${REPO}/contents/${path}?ref=${BRANCH}`, token);
  const sha = getRes.ok ? (await getRes.json()).sha : undefined;

  const putRes = await ghFetch(`/repos/${REPO}/contents/${path}`, token, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      message,
      content: b64EncodeUnicode(content),
      branch: BRANCH,
      ...(sha ? { sha } : {})
    })
  });
  if (!putRes.ok) {
    const detail = await putRes.text();
    throw new Error(`${path}: ${putRes.status} ${detail.slice(0, 200)}`);
  }
  return (await putRes.json()).commit?.sha;
}

export async function onRequestPost({ request, env }) {
  if (!env.GITHUB_TOKEN) return Response.json({ error: 'not-configured' }, { status: 503 });
  if (!env.ADMIN_KEY || request.headers.get('x-admin-key') !== env.ADMIN_KEY) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: 'bad-json' }, { status: 400 }); }
  const files = Array.isArray(body.files) ? body.files : [];
  if (!files.length) return Response.json({ error: 'no-files' }, { status: 400 });

  const results = [];
  for (const f of files) {
    if (!f.path || typeof f.content !== 'string') continue;
    try {
      const sha = await commitFile(f.path, f.content, env.GITHUB_TOKEN, body.message || `CMS publish: ${f.path}`);
      results.push({ path: f.path, ok: true, sha });
    } catch (e) {
      results.push({ path: f.path, ok: false, error: String(e.message || e) });
    }
  }
  const allOk = results.every((r) => r.ok);
  return Response.json({ ok: allOk, results, publishedAt: new Date().toISOString() }, { status: allOk ? 200 : 502 });
}
