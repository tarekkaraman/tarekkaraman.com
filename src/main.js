import { profile } from './data/profile.js';
import { initChat, openChat, askChat } from './chat.js';
import { initVault } from './vault.js';
import { initTerminal, openTerminal } from './terminal.js';

const $ = (s) => document.querySelector(s);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ── Theme ── */
const themeBtn = $('#theme-btn');
const savedTheme = localStorage.getItem('tk-theme');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
themeBtn.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('tk-theme', next);
});

/* ── Recruiter mode ── */
const recruiterBtn = $('#recruiter-toggle');
function setRecruiter(on) {
  document.body.classList.toggle('recruiter', on);
  recruiterBtn.classList.toggle('on', on);
  recruiterBtn.textContent = on ? '✓ Recruiter mode' : 'Recruiter mode';
}
recruiterBtn.addEventListener('click', () => setRecruiter(!document.body.classList.contains('recruiter')));

/* ── Scorecard ── */
const statsGrid = $('#stats-grid');
profile.stats.forEach((s) => {
  const card = el('div', 'stat');
  card.append(el('b', null, `${s.prefix || ''}0${s.suffix || ''}`), el('span', null, esc(s.label)));
  card.dataset.value = s.value;
  card.dataset.prefix = s.prefix || '';
  card.dataset.suffix = s.suffix || '';
  statsGrid.append(card);
});

function animateStat(card) {
  const target = Number(card.dataset.value);
  const b = card.querySelector('b');
  const dur = 1400;
  const t0 = performance.now();
  const fmt = (v) => `${card.dataset.prefix}${v.toLocaleString('en-US')}${card.dataset.suffix}`;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { b.textContent = fmt(target); return; }
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    b.textContent = fmt(Math.round(target * eased));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const partnersStrip = $('#partners-strip');
partnersStrip.append(el('h4', null, 'Key partnerships'));
partnersStrip.append(el('ul', null, profile.partnerships.map((p) => `<li><b>${esc(p.name)}</b> — ${esc(p.area)}</li>`).join('')));

const awardsStrip = $('#awards-strip');
awardsStrip.append(el('h4', null, 'Awards & recognition'));
awardsStrip.append(el('ul', null, profile.awards.map((a) => `<li>${esc(a)}</li>`).join('')));

/* ── Timeline ── */
const timeline = $('#timeline');
profile.experience.forEach((x) => {
  const item = el('div', 'tl-item reveal');
  item.append(el('span', 'tl-period', esc(x.period)));
  const head = el('div', 'tl-head');
  head.append(el('h3', null, esc(x.company)), el('span', 'tl-role', esc(x.role)));
  item.append(head);
  item.append(el('div', 'tl-loc', esc(x.location)));
  item.append(el('p', 'tl-summary', esc(x.summary)));
  item.append(el('ul', 'tl-bullets', x.bullets.map((b) => `<li>${esc(b)}</li>`).join('')));
  if (x.locked) {
    const lock = el('button', 'tl-lock', '🔒 Current-engagement detail is confidential — unlock with an access key');
    lock.addEventListener('click', () => $('#vault-section').scrollIntoView({ behavior: 'smooth' }));
    item.append(lock);
  }
  timeline.append(item);
});

/* ── Philosophy ── */
const philosophy = [
  { title: 'Capability, not projects', body: 'AI initiatives fail as one-off pilots. I build accelerators, delivery centres and academies — the organisational muscle that keeps shipping after the headline project ends.' },
  { title: 'Governance is an enabler', body: 'Ethical and legal guardrails embedded from day one are what let 60,000 people use AI daily without incident. Compliance done right speeds adoption; it doesn’t slow it.' },
  { title: 'Adoption is the product', body: 'A deployed tool nobody uses is a cost. I measure success in changed ways of working — enablement, training, and executive sponsorship are engineered, not hoped for.' },
  { title: 'Partner at the top', body: 'Microsoft, IBM, Google, PwC — the fastest route to enterprise-grade AI is pairing internal capability with the ecosystem’s best, on commercial terms that work.' },
  { title: 'Commercial outcomes', body: 'Bid-win rates, delivery effort, revenue growth, $20M+ programs. Technology strategy only matters when it lands on the P&L.' },
  { title: 'Build teams that outlast you', body: 'From 100+ technical staff at my own venture to WSP’s AI delivery hub — hiring, mentoring and operating models are the real legacy of any leadership role.' }
];
const philGrid = $('#philosophy-grid');
philosophy.forEach((p) => {
  const card = el('div', 'phil reveal');
  card.append(el('h3', null, esc(p.title)), el('p', null, esc(p.body)));
  philGrid.append(card);
});

const skills = $('#skills');
profile.skills.forEach((s) => skills.append(el('span', null, esc(s))));

/* ── LinkedIn pulse ── */
const pulse = $('#pulse-grid');
const pstat = el('div', 'pulse-stat');
pstat.append(
  el('b', null, profile.linkedinPulse.followers.toLocaleString('en-US')),
  el('span', null, `followers · ${esc(profile.linkedinPulse.connections)} connections`),
  Object.assign(el('a', null, 'View LinkedIn profile →'), { href: profile.linkedin, target: '_blank', rel: 'noopener' })
);
pulse.append(pstat);
const pitems = el('div', 'pulse-items');
profile.linkedinPulse.highlights.forEach((h) => {
  const row = el('div', 'pulse-item');
  row.append(
    el('span', 'when', esc(h.when)),
    el('span', null, esc(h.text)),
    el('span', 'imp', `${h.impressions.toLocaleString('en-US')} impressions`)
  );
  pitems.append(row);
});
pitems.append(el('p', 'pulse-note', esc(profile.linkedinPulse.note)));
pulse.append(pitems);

/* ── Education & interests ── */
const eduGrid = $('#edu-grid');
profile.education.forEach((e) => {
  const card = el('div', 'edu');
  card.append(el('b', null, esc(e.title)), el('span', null, esc(e.place)));
  eduGrid.append(card);
});
const intCard = el('div', 'edu');
intCard.append(el('b', null, 'Interests'), el('span', null, esc(profile.interests.join(' · '))));
eduGrid.append(intCard);

/* ── Contact ── */
const contactCards = $('#contact-cards');
[
  { label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
  { label: 'LinkedIn', value: 'linkedin.com/in/tarekkaraman', href: profile.linkedin },
  { label: 'Phone', value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, '')}` }
].forEach((c) => {
  const a = el('a', 'contact-card');
  a.href = c.href;
  if (c.href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; }
  a.append(el('b', null, esc(c.label)), el('span', null, esc(c.value)));
  contactCards.append(a);
});

$('#year').textContent = new Date().getFullYear();

/* ── Reveal on scroll ── */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      if (e.target.classList.contains('stat')) animateStat(e.target);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.25 });
document.querySelectorAll('.reveal, .stat').forEach((n) => io.observe(n));
// Hero reveals immediately
document.querySelectorAll('.hero .reveal').forEach((n, i) => setTimeout(() => n.classList.add('in'), 80 * i));

/* ── Command palette ── */
const overlay = $('#palette-overlay');
const pInput = $('#palette-input');
const pList = $('#palette-list');
const commands = [
  { name: 'Ask my AI', k: 'chat', run: () => openChat() },
  { name: 'Download CV (PDF)', k: 'pdf', run: () => { location.href = './Tarek_Karaman_CV.pdf'; } },
  { name: 'Recruiter mode — 90-second view', k: 'toggle', run: () => setRecruiter(!document.body.classList.contains('recruiter')) },
  { name: 'Confidential access (vault)', k: 'go', run: () => $('#vault-section').scrollIntoView({ behavior: 'smooth' }) },
  { name: 'Copy email address', k: 'copy', run: () => navigator.clipboard?.writeText(profile.email) },
  { name: 'Open LinkedIn', k: 'link', run: () => window.open(profile.linkedin, '_blank') },
  { name: 'Jump: Executive scorecard', k: 'go', run: () => $('#scorecard').scrollIntoView({ behavior: 'smooth' }) },
  { name: 'Jump: Career journey', k: 'go', run: () => $('#journey').scrollIntoView({ behavior: 'smooth' }) },
  { name: 'Jump: How I operate', k: 'go', run: () => $('#leadership').scrollIntoView({ behavior: 'smooth' }) },
  { name: 'Jump: Contact', k: 'go', run: () => $('#contact').scrollIntoView({ behavior: 'smooth' }) },
  { name: 'Toggle dark / light theme', k: 'theme', run: () => themeBtn.click() },
  { name: 'terminal', k: 'ssh tk@career', run: () => openTerminal(), hidden: true }
];
let sel = 0;
function renderPalette(q = '') {
  const items = commands.filter((c) => {
    if (c.hidden && q.toLowerCase() !== 'terminal' && !'terminal'.startsWith(q.toLowerCase() || '∅')) return false;
    return c.name.toLowerCase().includes(q.toLowerCase());
  });
  pList.innerHTML = '';
  items.forEach((c, i) => {
    const li = el('li', i === sel ? 'sel' : '', `<span>${esc(c.name)}</span><span class="k">${esc(c.k)}</span>`);
    li.addEventListener('click', () => { closePalette(); c.run(); });
    pList.append(li);
  });
  return items;
}
function openPalette() { overlay.hidden = false; sel = 0; pInput.value = ''; renderPalette(); pInput.focus(); }
function closePalette() { overlay.hidden = true; }
$('#palette-btn').addEventListener('click', openPalette);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closePalette(); });
pInput.addEventListener('input', () => { sel = 0; renderPalette(pInput.value); });
pInput.addEventListener('keydown', (e) => {
  const items = renderPalette(pInput.value);
  if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, items.length - 1); renderPalette(pInput.value); e.preventDefault(); }
  if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); renderPalette(pInput.value); e.preventDefault(); }
  if (e.key === 'Enter' && items[sel]) { closePalette(); items[sel].run(); }
  if (e.key === 'Escape') closePalette();
});
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); overlay.hidden ? openPalette() : closePalette(); }
  if (e.key === 'Escape' && !overlay.hidden) closePalette();
});

/* ── Colophon ── */
const colOverlay = $('#colophon-overlay');
$('#colophon-btn').addEventListener('click', () => {
  $('#colophon-body').innerHTML = `
    <p>This site is a working demonstration of how I ship AI products — designed, written and engineered end-to-end with AI (Claude), directed by me.</p>
    <p><b>The concierge</b> answers from a structured corpus of my career — grounded, guardrailed, and honest about what it can't discuss. When hosted with an API backend it runs on Claude; on static hosting it falls back to an on-device retrieval engine. No third-party chat widget, no vendor branding.</p>
    <p><b>The vault</b> uses real cryptography: confidential content is AES-256-GCM encrypted at build time (PBKDF2, 310k iterations). The plain text never ships — not even in the public repository.</p>
    <p><b>The stack</b> is deliberately lean: no framework, sub-second first paint, full keyboard navigation (⌘K), dark/light, print-perfect, mobile-first. Judgment about when <i>not</i> to add technology is the point.</p>`;
  colOverlay.hidden = false;
});
$('#colophon-close').addEventListener('click', () => { colOverlay.hidden = true; });
colOverlay.addEventListener('click', (e) => { if (e.target === colOverlay) colOverlay.hidden = true; });

/* ── Chat open buttons ── */
document.querySelectorAll('[data-open-chat]').forEach((b) => b.addEventListener('click', () => openChat()));

/* ── Konami-lite easter egg: type "tk" anywhere ── */
let buffer = '';
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  buffer = (buffer + e.key).slice(-4);
  if (buffer.endsWith('>tk') || buffer.endsWith('tk!')) openTerminal();
});

initChat();
initVault();
initTerminal();
