// Deeper Dive — real cryptography, not a hidden div.
// public/vault.enc.json is produced by `npm run vault` from private/vault-content.json
// (gitignored) OR published from the CMS. AES-256-GCM, PBKDF2-SHA256 (310k iters).
// A wrong key fails GCM auth — there is nothing to "bypass" client-side.

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

async function decryptVault(password) {
  const res = await fetch('./vault.enc.json');
  if (!res.ok) throw new Error('vault-missing');
  const blob = await res.json();
  const key = await deriveKey(password, b64(blob.salt), blob.iterations);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(blob.iv) }, key, b64(blob.ciphertext));
  return JSON.parse(new TextDecoder().decode(plain));
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function renderVault(data) {
  const box = $('#vault-content');
  let html = `<span class="vault-badge">DECRYPTED LOCALLY — AES-256-GCM</span>`;
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
      const data = await decryptVault(pass);
      msg.className = 'vault-msg ok';
      msg.textContent = '✓ access granted';
      renderVault(data);
      form.hidden = true;
    } catch (err) {
      attempts++;
      msg.className = 'vault-msg err';
      msg.textContent = err.message === 'vault-missing'
        ? 'nothing published here yet on this deployment'
        : `✕ invalid key${attempts >= 3 ? ' — if you should have access, just ask Tarek directly' : ''}`;
    }
  });
}
