// ── Site CMS ──────────────────────────────────────────────────
// Edit all public content + the encrypted Deeper Dive, then either
// publish live (Cloudflare KV) or download files to commit (GitHub Pages).
// Draft is kept in localStorage; ?preview on the main site renders it.
// ───────────────────────────────────────────────────────────────
import { DEFAULT_CONTENT, loadContent } from './data/content.js';

const $ = (s, r = document) => r.querySelector(s);
const clone = (o) => JSON.parse(JSON.stringify(o));
const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };

let adminKey = '';
let mode = { kv: false, github: false, hasKey: false, live: false };
let state = clone(DEFAULT_CONTENT);
let vaultState = { sections: [{ title: '', body: '', bullets: [] }], portfolio: [] };
let vaultKey = '';
let refsState = { intro: '', references: [{ name: '', role: '', relationship: '', contact: 'Available on request' }] };
let refsKey = '';

/* ── Persistence-mode detection ── */
async function detectMode() {
  try {
    const r = await fetch('./api/content', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}) });
    if (r.ok) { const d = await r.json(); mode.kv = !!d.kv; mode.github = !!d.github; mode.hasKey = !!d.hasKey; }
  } catch {}
  mode.live = (mode.github || mode.kv) && mode.hasKey;
  const pill = $('#mode-pill');
  pill.textContent = mode.live
    ? (mode.github ? '● live, Publish commits straight to the site' : '● live persistence (KV)')
    : '○ file / local mode';
  pill.classList.toggle('live', mode.live);
}

/* ── Gate ── */
// In live mode the key is verified server-side against ADMIN_KEY.
// In file/local mode there is no server, so the editor unlocks with the
// local editor key below. (Publishing still always goes through git or the
// server key, which are the real gates.)
const LOCAL_EDITOR_KEY = 'TarekKaraman1982';
async function unlock(key) {
  adminKey = key;
  if (mode.live) {
    const r = await fetch('./api/content', { method: 'POST', headers: { 'content-type': 'application/json', 'x-admin-key': key }, body: JSON.stringify({ checkAuth: true }) });
    const d = await r.json().catch(() => ({}));
    if (!d.ok) return false;
  } else if (key !== LOCAL_EDITOR_KEY) {
    return false;
  }
  return true;
}

$('#gate-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const key = $('#gate-key').value.trim();
  if (!key) return;
  $('#gate-msg').textContent = 'checking…';
  const ok = await unlock(key);
  if (!ok) { $('#gate-msg').textContent = '✕ wrong key'; return; }
  sessionStorage.setItem('tk-admin-key', key);
  boot();
});

/* ── Boot editor ── */
async function boot() {
  $('#gate').hidden = true;
  $('#app').hidden = false;
  const current = await loadContent({ preferDraft: true });
  state = { ...clone(DEFAULT_CONTENT), ...clone(current) };
  const vd = JSON.parse(localStorage.getItem('tk-vault-draft') || 'null');
  if (vd) vaultState = vd;
  const rd = JSON.parse(localStorage.getItem('tk-refs-draft') || 'null');
  if (rd) refsState = rd;
  renderContent();
  renderSeo();
  renderPrivate();
  renderPublish();
}

/* ── Field helpers ── */
function textField(obj, key, label, opts = {}) {
  const f = el('div', 'field');
  f.append(el('label', null, label));
  const input = opts.textarea ? el('textarea') : el('input');
  if (!opts.textarea) input.type = opts.type || 'text';
  input.value = obj[key] ?? '';
  input.addEventListener('input', () => { obj[key] = opts.type === 'number' ? Number(input.value) : input.value; });
  f.append(input);
  if (opts.sub) f.append(el('div', 'sub', opts.sub));
  return f;
}
function listField(obj, key, label, sub) {
  const f = el('div', 'field');
  f.append(el('label', null, label));
  const ta = el('textarea');
  ta.value = (obj[key] || []).join('\n');
  ta.addEventListener('input', () => { obj[key] = ta.value.split('\n').map((s) => s.trim()).filter(Boolean); });
  f.append(ta, el('div', 'sub', sub || 'One per line.'));
  return f;
}
function checkField(obj, key, label) {
  const f = el('div', 'field');
  const lab = el('label'); const cb = el('input'); cb.type = 'checkbox'; cb.checked = !!obj[key];
  cb.style.width = 'auto'; cb.style.marginRight = '8px';
  cb.addEventListener('change', () => { obj[key] = cb.checked; });
  lab.append(cb, document.createTextNode(label));
  lab.style.display = 'flex'; lab.style.alignItems = 'center';
  f.append(lab);
  return f;
}
function selectField(obj, key, label, options) {
  const f = el('div', 'field'); f.append(el('label', null, label));
  const sel = el('select');
  sel.style.cssText = 'width:100%;background:var(--bg-2);border:1px solid var(--line-soft);border-radius:10px;padding:10px 13px;font:inherit;color:var(--text)';
  options.forEach((o) => { const op = el('option', null, o); op.value = o; if (obj[key] === o) op.selected = true; sel.append(op); });
  sel.addEventListener('change', () => { obj[key] = sel.value; });
  f.append(sel);
  return f;
}

// Thumbnail upload: downscales to ~640px JPEG and stores inline as a data URL
// (kept small so content.json / KV stays light).
function thumbField(obj) {
  const f = el('div', 'field');
  f.append(el('label', null, 'Thumbnail image (optional)'));
  const row = el('div');
  row.style.cssText = 'display:flex;gap:10px;align-items:center';
  const preview = el('div');
  const setPreview = () => {
    preview.style.cssText = 'width:96px;height:60px;border-radius:8px;border:1px solid var(--line-soft);background-size:cover;background-position:center;flex:none;' +
      (obj.thumb ? `background-image:url('${obj.thumb}')` : 'background:var(--bg-2)');
  };
  setPreview();
  const file = el('input');
  file.type = 'file'; file.accept = 'image/*';
  file.addEventListener('change', () => {
    const fl = file.files?.[0];
    if (!fl) return;
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 640 / img.width);
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      obj.thumb = c.toDataURL('image/jpeg', 0.8);
      setPreview();
    };
    img.src = URL.createObjectURL(fl);
  });
  const clear = el('button', 'rm', '×'); clear.type = 'button'; clear.title = 'Remove image';
  clear.style.position = 'static';
  clear.addEventListener('click', () => { obj.thumb = ''; file.value = ''; setPreview(); });
  row.append(preview, file, clear);
  f.append(row, el('div', 'sub', 'Uploaded images are stored inside the content itself; keep them small.'));
  return f;
}

// Repeatable card list bound to an array of objects
function cardList(arr, render, newItem, addLabel) {
  const wrap = el('div', 'card-list');
  function draw() {
    wrap.innerHTML = '';
    arr.forEach((item, i) => {
      const card = el('div', 'card-item');
      const rm = el('button', 'rm', '×'); rm.title = 'Remove';
      rm.addEventListener('click', () => { arr.splice(i, 1); draw(); });
      card.append(rm);
      render(card, item);
      wrap.append(card);
    });
    const add = el('button', 'add-btn', `+ ${addLabel}`);
    add.addEventListener('click', () => { arr.push(clone(newItem)); draw(); });
    wrap.append(add);
  }
  draw();
  return wrap;
}

function group(title, ...nodes) {
  const g = el('div', 'grp'); g.append(el('h3', null, title)); nodes.forEach((n) => g.append(n)); return g;
}

/* ── Content tab ── */
function renderContent() {
  const p = $('#tab-content');
  p.innerHTML = '';
  p.append(el('h2', null, 'Public content'), el('p', 'hint', 'Everything on the main site. Edits are live-bound; use Save draft to preview, then Publish.'));

  // raw JSON toggle
  const rawBtn = el('button', 'raw-toggle', 'Show raw JSON editor (advanced, full control)');
  const rawWrap = el('div', 'raw-editor grp'); rawWrap.hidden = true;
  const rawTa = el('textarea');
  const syncRaw = () => { rawTa.value = JSON.stringify(state, null, 2); };
  rawBtn.addEventListener('click', () => {
    rawWrap.hidden = !rawWrap.hidden;
    rawBtn.textContent = rawWrap.hidden ? 'Show raw JSON editor (advanced, full control)' : 'Hide raw JSON editor';
    if (!rawWrap.hidden) syncRaw();
  });
  rawTa.addEventListener('input', () => { try { const o = JSON.parse(rawTa.value); state = o; rawTa.style.borderColor = ''; } catch { rawTa.style.borderColor = '#e0245e'; } });
  rawWrap.append(rawTa);
  p.append(rawBtn, rawWrap);

  // Basics
  const basics = el('div');
  const b2 = el('div', 'two');
  b2.append(textField(state, 'name', 'Name'), textField(state, 'headline', 'Headline'));
  const b3 = el('div', 'two');
  b3.append(textField(state, 'role', 'Current role'), textField(state, 'location', 'Location'));
  const b4 = el('div', 'three');
  b4.append(textField(state, 'email', 'Email'), textField(state, 'phone', 'Phone'), textField(state, 'linkedin', 'LinkedIn URL'));
  basics.append(b2, b3, b4,
    textField(state, 'positioning', 'Positioning (concierge context, not shown)', { textarea: true, sub: 'Internal framing for the AI. Kept employment-safe.' }),
    textField(state, 'voiceIntro', 'Voice intro URL', { sub: 'Path or URL to an mp3 (e.g. ./voice-intro.mp3). Empty = button hidden.' }),
    listField(state, 'status', 'Status lines'),
    textField(state, 'about', 'About', { textarea: true }));
  p.append(group('Basics', basics));

  // Stats
  p.append(group('Scorecard stats', cardList(state.stats, (card, s) => {
    const row = el('div', 'three');
    row.append(textField(s, 'value', 'Value', { type: 'number' }), textField(s, 'prefix', 'Prefix'), textField(s, 'suffix', 'Suffix'));
    card.append(row, textField(s, 'label', 'Label'));
  }, { value: 0, prefix: '', suffix: '', label: '' }, 'Add stat')));

  // Experience
  p.append(group('Experience', cardList(state.experience, (card, x) => {
    const r1 = el('div', 'two'); r1.append(textField(x, 'company', 'Company'), textField(x, 'role', 'Role'));
    const r2 = el('div', 'two'); r2.append(textField(x, 'period', 'Period'), textField(x, 'location', 'Location'));
    card.append(r1, r2, textField(x, 'summary', 'Summary', { textarea: true }), listField(x, 'bullets', 'Highlights'), checkField(x, 'more', 'Has extra detail in Deeper Dive'));
  }, { company: '', role: '', period: '', location: '', summary: '', bullets: [], more: false }, 'Add role')));

  // Awards + partnerships + skills
  p.append(group('Awards', listField(state, 'awards', 'Awards & recognition')));
  p.append(group('Partnerships', cardList(state.partnerships, (card, x) => {
    const r = el('div', 'two'); r.append(textField(x, 'name', 'Partner'), textField(x, 'area', 'Area')); card.append(r);
  }, { name: '', area: '' }, 'Add partnership')));
  p.append(group('Skills / capabilities', listField(state, 'skills', 'Capabilities')));

  // Philosophy
  p.append(group('How I operate', cardList(state.philosophy, (card, x) => {
    card.append(textField(x, 'title', 'Title'), textField(x, 'body', 'Body', { textarea: true }));
  }, { title: '', body: '' }, 'Add principle')));

  // Deep knowledge + free-form knowledge base for the AI
  const dk = state.deepKnowledge || (state.deepKnowledge = { wsp: '', maf: '' });
  p.append(group('AI knowledge: core context', textField(dk, 'wsp', 'WSP context', { textarea: true }), textField(dk, 'maf', 'MAF context', { textarea: true })));
  if (!state.knowledgeBase) state.knowledgeBase = [];
  const kbList = cardList(state.knowledgeBase, (card, k) => {
    card.append(textField(k, 'title', 'Topic / source name'), textField(k, 'body', 'Facts the AI may use (your words; it will not invent beyond this)', { textarea: true }));
  }, { title: '', body: '' }, 'Add knowledge entry');
  const kbGrp = group('AI knowledge base (add sources, references, corrections)', kbList);
  kbGrp.prepend(el('p', 'hint', 'Every entry here is fed to the AI concierge. Add data sources, reference material, project detail, or things to emphasise. To omit something, delete or edit the entry and the core context above.'));
  p.append(kbGrp);

  // Media & highlights
  if (!state.media) state.media = [];
  p.append(group('Media & highlights (public)', cardList(state.media, (card, m) => {
    const r = el('div', 'two');
    r.append(selectField(m, 'kind', 'Type', ['post', 'video', 'article']), textField(m, 'tag', 'Tag (e.g. WSP, Majid Al Futtaim)'));
    card.append(r, textField(m, 'title', 'Title'), textField(m, 'desc', 'One-line description'), textField(m, 'url', 'Link (LinkedIn post, YouTube…) — hidden on the site until set'));
    card.append(textField(m, 'video', 'Self-hosted clip (e.g. /media/clip.mp4) — plays inline on the card; the thumbnail becomes its poster'));
    card.append(thumbField(m));
  }, { kind: 'post', tag: '', title: '', desc: '', url: '', thumb: '', video: '' }, 'Add media item')));

  // LinkedIn pulse
  const lp = state.linkedinPulse;
  const lpTop = el('div');
  const lr = el('div', 'two'); lr.append(textField(lp, 'followers', 'Followers', { type: 'number' }), textField(lp, 'connections', 'Connections'));
  lpTop.append(lr, textField(lp, 'intro', 'Intro line', { textarea: true }), textField(lp, 'note', 'Note line', { textarea: true }));
  const engage = cardList(lp.engagement, (card, e) => {
    const r = el('div', 'two'); r.append(selectField(e, 'type', 'Type', ['liked', 'commented', 'reshared', 'posted']), textField(e, 'theme', 'Theme'));
    const r2 = el('div', 'two'); r2.append(textField(e, 'actor', 'Author / actor'), textField(e, 'when', 'When (e.g. 2w)'));
    card.append(r, r2, textField(e, 'text', 'Snippet', { textarea: true }), textField(e, 'impressions', 'Impressions (optional)', { type: 'number' }));
  }, { type: 'liked', theme: '', actor: '', when: '', text: '' }, 'Add engagement');
  p.append(group('LinkedIn pulse', lpTop, engage));

  // Deeper Dive framing
  const dd = state.deeperDive || (state.deeperDive = { title: 'Deeper Dive', intro: '', cta: '' });
  p.append(group('Deeper Dive framing',
    textField(dd, 'title', 'Section title'), textField(dd, 'intro', 'Intro', { textarea: true }),
    textField(dd, 'referencesTitle', 'References sub-section title'),
    textField(dd, 'referencesIntro', 'References intro (shown above the 2nd password)', { textarea: true })));

  // Education + interests
  p.append(group('Education', cardList(state.education, (card, x) => {
    const r = el('div', 'two'); r.append(textField(x, 'title', 'Title'), textField(x, 'place', 'Place')); card.append(r);
  }, { title: '', place: '' }, 'Add education')));
  p.append(group('Interests', listField(state, 'interests', 'Interests')));
}

/* ── SEO tab ── */
function renderSeo() {
  const p = $('#tab-seo');
  p.innerHTML = '';
  p.append(el('h2', null, 'SEO & discoverability'),
    el('p', 'hint', 'What search engines and link previews (LinkedIn, WhatsApp, Twitter/X) see. Publishing bakes these straight into the page\'s <head> tags, not just the visible content, so they work for crawlers and preview bots that don\'t run the page\'s JavaScript.'));

  if (!state.seo) state.seo = clone(DEFAULT_CONTENT.seo);
  const seo = state.seo;

  const basics = el('div');
  basics.append(
    textField(seo, 'title', 'Page title', { sub: 'Shown in the browser tab, Google\'s result title, and link previews. Keep it under ~60 characters.' }),
    textField(seo, 'description', 'Meta description', { textarea: true, sub: 'The snippet under your title in Google results and most link previews. Aim for 140–160 characters.' }),
    textField(seo, 'ogImageAlt', 'Share-image alt text', { sub: 'Describes the preview image (public/og-card.jpg) for screen readers and accessibility-aware crawlers.' })
  );
  p.append(group('Titles & descriptions', basics));

  p.append(group('Topics (what you want to be found for)',
    listField(seo, 'topics', 'Topics / keywords', 'One per line. Feeds the page\'s structured data (JSON-LD "knowsAbout") that search engines use to associate you with these subjects, e.g. "Chief AI Officer", "Microsoft Copilot enterprise rollout", "AI strategy Middle East".')));

  const verify = el('div');
  verify.append(
    textField(seo, 'googleVerification', 'Google Search Console verification code', { sub: 'From search.google.com/search-console → Add property → HTML tag method. Paste just the content="…" value. Leave blank to skip.' }),
    textField(seo, 'bingVerification', 'Bing Webmaster Tools verification code', { sub: 'From bing.com/webmasters → same idea, paste just the code value. Leave blank to skip.' })
  );
  const verifyGrp = group('Search engine verification', verify);
  verifyGrp.append(el('p', 'hint', 'Optional, but worth doing once: verifying ownership in both consoles lets you see search traffic, submit the sitemap directly, and get alerted to indexing problems. Takes about 5 minutes each, no code required beyond pasting the value here and publishing.'));
  p.append(verifyGrp);
}

/* ── Private (Deeper Dive) tab ── */
function renderPrivate() {
  const p = $('#tab-private');
  p.innerHTML = '';
  p.append(el('h2', null, 'Deeper Dive (encrypted)'), el('p', 'hint', 'This content is AES-256-GCM encrypted with the access key below before it ever leaves the browser. Share the access key with people you want to let in.'));

  const keyGrp = el('div', 'grp');
  keyGrp.append(el('h3', null, 'Access key'));
  const kf = el('div', 'field');
  kf.append(el('label', null, 'Access key (visitors type this to unlock)'));
  const ki = el('input'); ki.type = 'text'; ki.value = vaultKey; ki.placeholder = 'e.g. a memorable phrase';
  ki.addEventListener('input', () => { vaultKey = ki.value; });
  kf.append(ki, el('div', 'sub', 'Changing this and publishing re-locks the Deeper Dive with the new key.'));
  const loadBtn = el('button', 'add-btn', '↓ Load current Deeper Dive (needs the existing key)');
  loadBtn.addEventListener('click', loadExistingVault);
  keyGrp.append(kf, loadBtn);
  p.append(keyGrp);

  p.append(group('Sections', cardList(vaultState.sections, (card, s) => {
    card.append(textField(s, 'title', 'Title'), textField(s, 'body', 'Body', { textarea: true }), listField(s, 'bullets', 'Bullets'));
  }, { title: '', body: '', bullets: [] }, 'Add section')));

  if (!vaultState.portfolio) vaultState.portfolio = [];
  p.append(group('Portfolio', cardList(vaultState.portfolio, (card, x) => {
    card.append(textField(x, 'title', 'Title'), textField(x, 'body', 'Description', { textarea: true }));
  }, { title: '', body: '' }, 'Add portfolio item')));

  if (!vaultState.media) vaultState.media = [];
  p.append(group('Private media (links shown only after unlock)', cardList(vaultState.media, (card, x) => {
    card.append(textField(x, 'title', 'Title'), textField(x, 'url', 'Link (video, deck, drive folder…) — hidden until set'), textField(x, 'note', 'Note (optional)'));
  }, { title: '', url: '', note: '' }, 'Add private media')));

  // ── References: behind a SECOND, separate password ──
  p.append(el('h2', null, 'References (second password)'), el('p', 'hint', 'A separate encrypted file with its own password, shown inside the Deeper Dive. Give this second key only to people you want to reach your referees.'));

  const rkGrp = el('div', 'grp');
  rkGrp.append(el('h3', null, 'References password (second key)'));
  const rkf = el('div', 'field');
  rkf.append(el('label', null, 'References password'));
  const rki = el('input'); rki.type = 'text'; rki.value = refsKey; rki.placeholder = 'a different phrase to the Deeper Dive key';
  rki.addEventListener('input', () => { refsKey = rki.value; });
  rkf.append(rki, el('div', 'sub', 'Keep this different from the Deeper Dive key so references stay separately gated.'));
  const rLoad = el('button', 'add-btn', '↓ Load current references (needs the existing references password)');
  rLoad.addEventListener('click', loadExistingRefs);
  rkGrp.append(rkf, rLoad);
  p.append(rkGrp);

  p.append(group('References intro', textField(refsState, 'intro', 'Intro text', { textarea: true })));
  if (!refsState.references) refsState.references = [];
  p.append(group('Referees', cardList(refsState.references, (card, r) => {
    card.append(textField(r, 'name', 'Name'), textField(r, 'role', 'Title, Company'), textField(r, 'relationship', 'Relationship to you'), textField(r, 'contact', 'Contact (or "Available on request")'));
  }, { name: '', role: '', relationship: '', contact: 'Available on request' }, 'Add referee')));
}

async function loadExistingVault() {
  const key = prompt('Enter the CURRENT access key to load & decrypt the published Deeper Dive:');
  if (!key) return;
  try {
    const r = await fetch('./vault.enc.json'); if (!r.ok) throw 0;
    const blob = await r.json();
    const data = await decrypt(blob, key);
    vaultState = { sections: data.sections || [], portfolio: data.portfolio || [], media: data.media || [] };
    vaultKey = key;
    renderPrivate();
    alert('Loaded. You can now edit and re-publish.');
  } catch { alert('Could not decrypt, wrong key or nothing published yet.'); }
}

async function loadExistingRefs() {
  const key = prompt('Enter the CURRENT references password to load & decrypt them:');
  if (!key) return;
  try {
    const r = await fetch('./references.enc.json'); if (!r.ok) throw 0;
    const data = await decrypt(await r.json(), key);
    refsState = { intro: data.intro || '', references: data.references || [] };
    refsKey = key;
    renderPrivate();
    alert('References loaded. You can now edit and re-publish.');
  } catch { alert('Could not decrypt, wrong references password or nothing published yet.'); }
}

/* ── Publish tab ── */
function renderPublish() {
  $('#publish-status').textContent = mode.github
    ? 'Publish live commits your changes directly to the site. No downloads, no GitHub. It takes about a minute to go live while the site rebuilds.'
    : mode.kv
    ? 'Live mode: “Publish live” writes content to Cloudflare KV, visible to everyone immediately. The Deeper Dive is published as a file you commit.'
    : 'Not connected yet: use the download buttons and hand the files to whoever manages the repo, or ask Claude to finish the one-time setup in DEPLOY.md.';
  $('#pub-help').innerHTML = mode.github
    ? `<b>What "Publish live" does:</b> it commits <code>content.json</code>, the SEO tab's fields freshly baked into <code>index.html</code>'s meta tags, and (if you've entered the Deeper Dive or References key on this tab) the freshly encrypted <code>vault.enc.json</code> / <code>references.enc.json</code>, straight to the site's repository. That automatically triggers a rebuild, same as if you'd pushed the change yourself, you just never see it happen.`
    : mode.kv
    ? `<b>Deeper Dive on Cloudflare:</b> download <code>vault.enc.json</code> and commit it (the encrypted file is served statically). Content itself persists live in KV.`
    : `<b>To publish without a live connection:</b><ol>
        <li>Click <b>Download content.json</b> → save into the repo's <code>public/</code> folder.</li>
        <li>If you edited the Deeper Dive, click <b>Download vault.enc.json</b> → also into <code>public/</code>.</li>
        <li>If you edited references, click <b>Download references.enc.json</b> → also into <code>public/</code>.</li>
        <li>Commit &amp; push (or drag into GitHub's web uploader). The site redeploys in ~1 min.</li></ol>`;
}

/* ── Save draft / preview ── */
$('#savedraft-btn').addEventListener('click', () => {
  localStorage.setItem('tk-content-draft', JSON.stringify(state));
  localStorage.setItem('tk-vault-draft', JSON.stringify(vaultState));
  localStorage.setItem('tk-refs-draft', JSON.stringify(refsState));
  flash($('#savedraft-btn'), 'Saved ✓');
});
$('#preview-btn').addEventListener('click', () => {
  localStorage.setItem('tk-content-draft', JSON.stringify(state));
  window.open('./index.html?preview', '_blank');
});

/* ── Publish live / downloads ── */
// Regenerates the SEO:START…SEO:END block in index.html from state.seo and
// splices it into the current file text. Keeps the actual meta/JSON-LD tags
// static in the shipped HTML (so crawlers and link-preview bots that don't
// run JS still see them) while letting the CMS be the source of truth.
function buildSeoBlock(seo) {
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const title = esc(seo.title);
  const desc = esc(seo.description);
  const topics = (seo.topics || []).filter(Boolean);
  const verify = [];
  if (seo.googleVerification) verify.push(`  <meta name="google-site-verification" content="${esc(seo.googleVerification)}" />`);
  if (seo.bingVerification) verify.push(`  <meta name="msvalidate.01" content="${esc(seo.bingVerification)}" />`);

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Person', name: 'Tarek Karaman',
    jobTitle: 'Head of Artificial Intelligence, WSP Middle East',
    description: seo.description,
    url: 'https://tarekkaraman.com/', image: 'https://tarekkaraman.com/og-card.jpg',
    email: 'mailto:tarekkaraman@me.com',
    worksFor: { '@type': 'Organization', name: 'WSP' },
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: 'Middlesex University, London' },
      { '@type': 'CollegeOrUniversity', name: 'SAE Institute, London' }
    ],
    award: [
      'Team of the Year, AI-Driven Transformation, Majid Al Futtaim',
      'Executive Recognition, Microsoft & MAF Group leadership'
    ],
    address: { '@type': 'PostalAddress', addressLocality: 'Dubai', addressCountry: 'AE' },
    knowsAbout: topics,
    sameAs: ['https://www.linkedin.com/in/tarekkaraman']
  };

  return [
    '<!-- SEO:START — regenerated on CMS Publish from profile.seo. Don\'t hand-edit',
    '     between these markers; edit in /admin → SEO instead, or the next',
    '     publish will overwrite it. Markers must stay exactly as-is. -->',
    `  <title>${title}</title>`,
    `  <meta name="description" content="${desc}" />`,
    '  <meta name="robots" content="index, follow" />',
    `  <meta property="og:title" content="${title}" />`,
    `  <meta property="og:description" content="${desc}" />`,
    '  <meta property="og:type" content="profile" />',
    '  <meta property="og:url" content="https://tarekkaraman.com/" />',
    '  <meta property="og:site_name" content="Tarek Karaman" />',
    '  <meta property="og:image" content="https://tarekkaraman.com/og-card.jpg" />',
    '  <meta property="og:image:width" content="1200" />',
    '  <meta property="og:image:height" content="630" />',
    `  <meta property="og:image:alt" content="${esc(seo.ogImageAlt)}" />`,
    '  <meta name="twitter:card" content="summary_large_image" />',
    `  <meta name="twitter:title" content="${title}" />`,
    `  <meta name="twitter:description" content="${desc}" />`,
    '  <meta name="twitter:image" content="https://tarekkaraman.com/og-card.jpg" />',
    ...verify,
    '  <script type="application/ld+json">',
    JSON.stringify(jsonLd, null, 2),
    '  </script>',
    '  <!-- SEO:END -->'
  ].join('\n');
}

function spliceSeoBlock(html, seo) {
  const re = /<!-- SEO:START[\s\S]*?<!-- SEO:END -->/;
  if (!re.test(html)) throw new Error('SEO markers not found in index.html, publish skipped for safety');
  return html.replace(re, buildSeoBlock(seo));
}

$('#publish-live').addEventListener('click', async () => {
  const msg = $('#publish-msg');
  if (!mode.live) { msg.className = 'pub-msg err'; msg.textContent = 'Live persistence not configured, use the download buttons instead.'; return; }
  msg.className = 'pub-msg'; msg.textContent = 'publishing…';

  if (mode.github) {
    try {
      const files = [{ path: 'public/content.json', content: JSON.stringify(state, null, 2) }];
      if (vaultKey) files.push({ path: 'public/vault.enc.json', content: JSON.stringify(await encrypt(vaultState, vaultKey), null, 2) });
      if (refsKey) files.push({ path: 'public/references.enc.json', content: JSON.stringify(await encrypt(refsState, refsKey), null, 2) });
      try {
        const currentHtml = await fetch('./index.html', { cache: 'no-store' }).then((r) => r.ok ? r.text() : null);
        if (currentHtml) files.push({ path: 'index.html', content: spliceSeoBlock(currentHtml, state.seo || DEFAULT_CONTENT.seo) });
      } catch { /* SEO tags just won't update this publish; content still does */ }
      const r = await fetch('./api/publish', {
        method: 'POST', headers: { 'content-type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ files, message: 'CMS publish' })
      });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.results?.find((x) => !x.ok)?.error || d.error || r.status);
      msg.className = 'pub-msg ok';
      msg.textContent = `✓ committed ${files.length} file${files.length > 1 ? 's' : ''}, live in about a minute while the site rebuilds`;
    } catch (e) { msg.className = 'pub-msg err'; msg.textContent = `✕ ${e.message}`; }
    return;
  }

  // Legacy KV path
  try {
    const r = await fetch('./api/content', { method: 'PUT', headers: { 'content-type': 'application/json', 'x-admin-key': adminKey }, body: JSON.stringify(state) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || r.status);
    msg.className = 'pub-msg ok'; msg.textContent = `✓ published live at ${d.savedAt}`;
  } catch (e) { msg.className = 'pub-msg err'; msg.textContent = `✕ ${e.message}`; }
});
$('#download-content').addEventListener('click', () => download('content.json', JSON.stringify(state, null, 2)));
$('#download-vault').addEventListener('click', async () => {
  const msg = $('#publish-msg');
  if (!vaultKey) { msg.className = 'pub-msg err'; msg.textContent = 'Set an access key in the Deeper Dive tab first.'; return; }
  msg.className = 'pub-msg'; msg.textContent = 'encrypting…';
  try {
    const blob = await encrypt(vaultState, vaultKey);
    download('vault.enc.json', JSON.stringify(blob, null, 2));
    msg.className = 'pub-msg ok'; msg.textContent = '✓ vault.enc.json encrypted & downloaded';
  } catch (e) { msg.className = 'pub-msg err'; msg.textContent = `✕ ${e.message}`; }
});
$('#download-refs').addEventListener('click', async () => {
  const msg = $('#publish-msg');
  if (!refsKey) { msg.className = 'pub-msg err'; msg.textContent = 'Set a references password in the Deeper Dive tab first.'; return; }
  msg.className = 'pub-msg'; msg.textContent = 'encrypting references…';
  try {
    const blob = await encrypt(refsState, refsKey);
    download('references.enc.json', JSON.stringify(blob, null, 2));
    msg.className = 'pub-msg ok'; msg.textContent = '✓ references.enc.json encrypted & downloaded';
  } catch (e) { msg.className = 'pub-msg err'; msg.textContent = `✕ ${e.message}`; }
});

/* ── Crypto (mirrors scripts/encrypt-vault.mjs) ── */
const ITER = 310000;
const te = new TextEncoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function keyFrom(pass, salt, usage) {
  const base = await crypto.subtle.importKey('raw', te.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, [usage]);
}
async function encrypt(obj, pass) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await keyFrom(pass, salt, 'encrypt');
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(JSON.stringify(obj)));
  return { v: 1, algo: 'AES-256-GCM', kdf: 'PBKDF2-SHA256', iterations: ITER, salt: b64(salt), iv: b64(iv), ciphertext: b64(ct) };
}
async function decrypt(blob, pass) {
  const key = await keyFrom(pass, fromB64(blob.salt), 'decrypt');
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(blob.iv) }, key, fromB64(blob.ciphertext));
  return JSON.parse(new TextDecoder().decode(pt));
}

/* ── Utils ── */
function download(name, text) {
  const a = el('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function flash(btn, text) { const t = btn.textContent; btn.textContent = text; setTimeout(() => (btn.textContent = t), 1400); }

/* ── Tabs ── */
document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach((x) => x.classList.remove('on'));
  t.classList.add('on');
  ['content', 'seo', 'private', 'publish'].forEach((name) => { $(`#tab-${name}`).hidden = name !== t.dataset.tab; });
  if (t.dataset.tab === 'publish') renderPublish();
}));

/* ── Theme sync ── */
const th = localStorage.getItem('tk-theme'); if (th) document.documentElement.dataset.theme = th;

/* ── Start ── */
(async () => {
  await detectMode();
  const saved = sessionStorage.getItem('tk-admin-key');
  if (saved && await unlock(saved)) boot();
})();
