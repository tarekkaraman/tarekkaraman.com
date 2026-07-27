// Cloudflare Pages Function — /api/content
// GET  → returns the CMS-published content from KV (public, read-only), or 404.
// PUT  → writes new content to KV. Requires header  x-admin-key: <ADMIN_KEY env>.
//
// Setup on Cloudflare Pages:
//   1. Workers & Pages → your project → Settings → Functions → KV namespace bindings
//      → add binding  Variable name: CONTENT  →  (create/pick a KV namespace)
//   2. Settings → Environment variables → add  ADMIN_KEY  (your CMS password)
// Until KV is bound the endpoint 404s and the site falls back to the bundled content.

export async function onRequestGet({ env }) {
  if (!env.CONTENT) return new Response('no-store', { status: 404 });
  const data = await env.CONTENT.get('site');
  if (!data) return new Response('empty', { status: 404 });
  return new Response(data, { headers: { 'content-type': 'application/json', 'cache-control': 'no-cache' } });
}

export async function onRequestPut({ request, env }) {
  if (!env.CONTENT) return Response.json({ error: 'no-kv' }, { status: 503 });
  if (!env.ADMIN_KEY || request.headers.get('x-admin-key') !== env.ADMIN_KEY) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: 'bad-json' }, { status: 400 }); }
  if (!body || !body.name) return Response.json({ error: 'invalid-content' }, { status: 400 });
  await env.CONTENT.put('site', JSON.stringify(body));
  return Response.json({ ok: true, savedAt: new Date().toISOString() });
}

// Lets the CMS verify the admin key and whether live persistence is available.
// "github" (commit-and-rebuild via /api/publish) is the primary, supported
// live-publish path. "kv" is left as an optional alternative for anyone who
// later wires up a KV namespace instead — either makes mode.live true.
export async function onRequestPost({ request, env }) {
  let body = {};
  try { body = await request.json(); } catch {}
  if (body.checkAuth) {
    const ok = !!env.ADMIN_KEY && request.headers.get('x-admin-key') === env.ADMIN_KEY;
    return Response.json({ ok, kv: !!env.CONTENT, github: !!env.GITHUB_TOKEN });
  }
  return Response.json({ kv: !!env.CONTENT, github: !!env.GITHUB_TOKEN, hasKey: !!env.ADMIN_KEY });
}
