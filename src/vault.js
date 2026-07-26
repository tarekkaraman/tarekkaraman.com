// Deeper Dive, real cryptography, not a hidden div.
// public/vault.enc.json is produced by `npm run vault` from private/vault-content.json
// (gitignored) OR published from the CMS. AES-256-GCM, PBKDF2-SHA256 (310k iters).
// References live in a SECOND encrypted file (references.enc.json) behind a
// separate password, shown only after the Deeper Dive itself is unlocked.
// A wrong key fails GCM auth, there is nothing to "bypass" client-side.

const $ = (s) => document.querySelector(s);
const te = new TextEncoder();
let framing = {};

export function setVaultFraming(f) { framing = f || {}; }

async function deriveKey(password, salt, iterations) {
  const base = await crypto.subtle.importKey('raw', te.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
  );
}
const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function decryptFile(file, password) {
  const res = await fetch(file);
  if (!res.ok) throw new Error('missing');
  const blob = await res.json();
  const key = await deriveKey(password, b64(blob.salt), blob.iterations);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(blob.iv) }, key, b64(blob.ciphertext));
  return JSON.parse(new TextDecoder().decode(plain));
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function renderVault(data) {
  const box = $('#vault-content');
  let html = `<span class="vault-badge">DECRYPTED LOCALLY, AES-256-GCM</span>`;
  (data.sections || []).forEach((s) => {
    html += `<h3><span>${esc(s.title)}</span></h3>`;
    if (s.body) html += `<p>${esc(s.body)}</p>`;
    if (s.bullets?.length) html += `<ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`;
  });
  if (data.portfolio?.length) {
    html += `<h3><span>Portfolio</span></h3><div class="vault-portfolio">` +
      data.portfolio.map((p) => `<div class="vault-pcard"><b>${esc(p.title)}</b><span>${esc(p.body)}</span></div>`).join('') +
      `</div>`;
  }
  const media = (data.media || []).filter((m) => m.url);
  if (media.length) {
    html += `<h3><span>Private media</span></h3><div class="vault-portfolio">` +
      media.map((m) => `<a class="vault-pcard vault-media" href="${esc(m.url)}" target="_blank" rel="noopener"><b>${esc(m.title)} ↗</b><span>${esc(m.note || '')}</span></a>`).join('') +
      `</div>`;
  }
  box.innerHTML = html;
  box.hidden = false;
  mountReferences(box);
}

// A second, independent gate for references.
function mountReferences(box) {
  const title = framing.referencesTitle || 'References';
  const intro = framing.referencesIntro || 'My references are available here, behind a further password.';
  const wrap = document.createElement('div');
  wrap.className = 'refs-gate';
  wrap.innerHTML =
    `<h3><span>${esc(title)}</span> <span class="refs-lock">🔒 second password</span></h3>` +
    `<p>${esc(intro)}</p>` +
    `<form class="vault-form" id="refs-form"><input id="refs-pass" type="password" placeholder="References password" autocomplete="off" /><button class="btn btn-primary" type="submit">Open references</button></form>` +
    `<p class="vault-msg" id="refs-msg"></p><div id="refs-content" hidden></div>`;
  box.append(wrap);

  const form = wrap.querySelector('#refs-form');
  const msg = wrap.querySelector('#refs-msg');
  let attempts = 0;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pass = wrap.querySelector('#refs-pass').value;
    if (!pass) return;
    msg.className = 'vault-msg'; msg.textContent = 'deriving key…';
    try {
      const data = await decryptFile('./references.enc.json', pass);
      msg.className = 'vault-msg ok'; msg.textContent = '✓ references unlocked';
      renderRefs(wrap.querySelector('#refs-content'), data);
      form.hidden = true;
    } catch (err) {
      attempts++;
      msg.className = 'vault-msg err';
      msg.textContent = err.message === 'missing'
        ? 'no references published on this deployment yet'
        : `✕ invalid password${attempts >= 3 ? ', ask Tarek for the references key' : ''}`;
    }
  });
}

function renderRefs(box, data) {
  let html = `<span class="vault-badge">DECRYPTED LOCALLY, AES-256-GCM</span>`;
  if (data.intro) html += `<p>${esc(data.intro)}</p>`;
  html += `<div class="refs-list">` + (data.references || []).map((r) =>
    `<div class="ref-card"><b>${esc(r.name)}</b><span class="ref-role">${esc(r.role || '')}</span>` +
    (r.relationship ? `<span class="ref-rel">${esc(r.relationship)}</span>` : '') +
    (r.contact ? `<span class="ref-contact">${esc(r.contact)}</span>` : '') + `</div>`).join('') + `</div>`;
  box.innerHTML = html;
  box.hidden = false;
}

export function initVault() {
  const form = $('#vault-form');
  const msg = $('#vault-msg');
  let attempts = 0;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pass = $('#vault-pass').value;
    if (!pass) return;
    msg.className = 'vault-msg';
    msg.textContent = 'deriving key…';
    try {
      const data = await decryptFile('./vault.enc.json', pass);
      msg.className = 'vault-msg ok';
      msg.textContent = '✓ access granted';
      renderVault(data);
      form.hidden = true;
    } catch (err) {
      attempts++;
      msg.className = 'vault-msg err';
      msg.textContent = err.message === 'missing'
        ? 'nothing published here yet on this deployment'
        : `✕ invalid key${attempts >= 3 ? ', if you should have access, just ask Tarek directly' : ''}`;
    }
  });
}
