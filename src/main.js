import { loadContent } from './data/content.js';
import { initChat, openChat, setCorpus } from './chat.js';
import { initVault, setVaultFraming } from './vault.js';
import { initTerminal, openTerminal, setTerminalData } from './terminal.js';
import { initParticles } from './particles.js';

initParticles();

const $ = (s) => document.querySelector(s);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
// Attribute-safe variant: CMS-editable fields end up in src/href/poster.
const escAttr = (s) => esc(s).replace(/"/g, '&quot;');

/* ── Theme ── */
const themeBtn = $('#theme-btn');
const savedTheme = localStorage.getItem('tk-theme');
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
themeBtn.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('tk-theme', next);
  $('meta[name="theme-color"]').setAttribute('content', next === 'dark' ? '#070b17' : '#ffffff');
});

/* ── Recruiter / quick view ── */
const recruiterBtn = $('#recruiter-toggle');
function setRecruiter(on) {
  document.body.classList.toggle('recruiter', on);
  recruiterBtn.classList.toggle('on', on);
  recruiterBtn.textContent = on ? '✓ Quick view' : 'Quick view';
}
recruiterBtn.addEventListener('click', () => setRecruiter(!document.body.classList.contains('recruiter')));

/* ── Boot: load content, then render ── */
const previewMode = new URLSearchParams(location.search).has('preview');
loadContent({ preferDraft: previewMode }).then((profile) => render(profile));

function render(profile) {
  setCorpus(profile);
  setTerminalData(profile);
  setVaultFraming(profile.deeperDive);

  /* Voice intro */
  if (profile.voiceIntro) {
    const btn = $('#voice-btn');
    const audio = $('#voice-audio');
    audio.src = profile.voiceIntro;
    btn.hidden = false;
    btn.addEventListener('click', () => {
      if (audio.paused) { audio.play(); btn.classList.add('playing'); $('#voice-ico').textContent = '❚❚'; $('#voice-label').textContent = 'Playing intro…'; }
      else { audio.pause(); btn.classList.remove('playing'); $('#voice-ico').textContent = '▶'; $('#voice-label').textContent = 'Hear a 60-second intro'; }
    });
    audio.addEventListener('ended', () => { btn.classList.remove('playing'); $('#voice-ico').textContent = '▶'; $('#voice-label').textContent = 'Hear a 60-second intro'; });
  }

  /* Scorecard */
  const statsGrid = $('#stats-grid');
  profile.stats.forEach((s) => {
    const card = el('div', 'stat');
    card.append(el('b', null, `<span class="g">${s.prefix || ''}0${s.suffix || ''}</span>`), el('span', null, esc(s.label)));
    card.dataset.value = s.value; card.dataset.prefix = s.prefix || ''; card.dataset.suffix = s.suffix || '';
    statsGrid.append(card);
  });
  const partnersStrip = $('#partners-strip');
  partnersStrip.append(el('h4', null, 'Key partnerships'),
    el('ul', null, profile.partnerships.map((p) => `<li><b>${esc(p.name)}</b>, ${esc(p.area)}</li>`).join('')));
  const awardsStrip = $('#awards-strip');
  awardsStrip.append(el('h4', null, 'Awards & recognition'),
    el('ul', null, profile.awards.map((a) => `<li>${esc(a)}</li>`).join('')));

  /* Timeline */
  const timeline = $('#timeline');
  profile.experience.forEach((x) => {
    const item = el('div', 'tl-item reveal');
    item.append(el('span', 'tl-period', esc(x.period)));
    const head = el('div', 'tl-head');
    head.append(el('h3', null, esc(x.company)), el('span', 'tl-role', esc(x.role)));
    item.append(head, el('div', 'tl-loc', esc(x.location)), el('p', 'tl-summary', esc(x.summary)),
      el('ul', 'tl-bullets', x.bullets.map((b) => `<li>${esc(b)}</li>`).join('')));
    if (x.more) {
      const lock = el('button', 'tl-lock', '🔑 More detail in the Deeper Dive, with a key');
      lock.addEventListener('click', () => $('#vault-section').scrollIntoView({ behavior: 'smooth' }));
      item.append(lock);
    }
    timeline.append(item);
  });

  /* Philosophy */
  const philGrid = $('#philosophy-grid');
  profile.philosophy.forEach((p) => {
    const card = el('div', 'phil reveal');
    card.append(el('h3', null, `<span>${esc(p.title)}</span>`), el('p', null, esc(p.body)));
    philGrid.append(card);
  });
  const skills = $('#skills');
  profile.skills.forEach((s) => skills.append(el('span', null, esc(s))));

  /* LinkedIn pulse */
  /* Media & highlights: items appear once they have a link or a thumbnail */
  const mediaItems = (profile.media || []).filter((m) => m.url || m.thumb);
  if (mediaItems.length) {
    $('#media').hidden = false;
    const grid = $('#media-grid');
    mediaItems.forEach((m) => {
      // A self-hosted clip plays in place, so the card itself must not be a
      // link (the anchor would swallow the player controls). The title carries
      // the link out to the original post instead.
      const inline = !!m.video;
      const linked = !!m.url && !inline;
      const card = el(linked ? 'a' : 'div', 'media-card reveal' + (linked ? '' : ' media-nolink'));
      if (linked) { card.href = m.url; card.target = '_blank'; card.rel = 'noopener'; }
      // Real <img> with descriptive alt text, not a CSS background-image, so
      // the photo is indexable by image search and readable by screen readers.
      const thumbAlt = `${m.title}${m.tag ? `, ${m.tag}` : ''}`;
      const thumb = inline
        ? `<video class="media-video" controls preload="metadata" playsinline` +
          (m.thumb ? ` poster="${escAttr(m.thumb)}"` : '') + ` src="${escAttr(m.video)}"></video>`
        : m.thumb
          ? `<img class="media-thumb" src="${escAttr(m.thumb)}" alt="${escAttr(thumbAlt)}" loading="lazy" width="640" height="400" />`
          : `<div class="media-thumb media-thumb-ph"><span>${m.kind === 'video' ? '▶' : '✦'}</span></div>`;
      const title = inline && m.url
        ? `<a class="media-titlelink" href="${escAttr(m.url)}" target="_blank" rel="noopener">${esc(m.title)}</a>`
        : esc(m.title);
      card.innerHTML = thumb +
        `<div class="media-body"><span class="media-tag">${esc(m.tag || '')}${m.kind === 'video' ? ' · video' : ''}</span>` +
        `<b>${title}</b><span class="media-desc">${esc(m.desc || '')}</span></div>`;
      grid.append(card);
    });
  }

  const lp = profile.linkedinPulse;
  $('#pulse-intro').textContent = lp.intro || '';
  const pstat = $('#pulse-stat');
  pstat.append(el('b', null, lp.followers.toLocaleString('en-US')),
    el('span', null, `followers · ${esc(lp.connections)} connections`),
    Object.assign(el('a', null, 'View LinkedIn →'), { href: profile.linkedin, target: '_blank', rel: 'noopener' }));

  const verbs = { liked: 'Liked', commented: 'Commented', reshared: 'Reshared', posted: 'Posted' };
  const verbLabel = (e) => e.type === 'commented' ? `Commented on ${esc(e.actor)}`
    : e.type === 'posted' ? 'Posted' : `${verbs[e.type]} ${esc(e.actor)}`;
  const themesSet = ['All', ...new Set(lp.engagement.map((e) => e.theme))];
  const filters = $('#pulse-filters');
  const itemsWrap = $('#pulse-items');
  let activeFilter = 'All';
  let showAll = false;
  const visibleCount = lp.visibleCount || 4;
  function renderPulse() {
    itemsWrap.innerHTML = '';
    const filtered = lp.engagement.filter((e) => activeFilter === 'All' || e.theme === activeFilter);
    const shown = showAll ? filtered : filtered.slice(0, visibleCount);
    shown.forEach((e) => {
      const card = el('div', 'pulse-item');
      const quote = e.type === 'commented'
        ? `<div class="pulse-quote comment">“${esc(e.text)}”</div>`
        : `<div class="pulse-quote">${esc(e.text)}${e.impressions ? `\n\n${e.impressions.toLocaleString('en-US')} impressions` : ''}</div>`;
      const link = e.url ? `<a class="pulse-link" href="${esc(e.url)}" target="_blank" rel="noopener">View on LinkedIn ↗</a>` : '';
      card.innerHTML =
        `<div class="row1"><span class="pulse-verb pv-${e.type}">${verbs[e.type] || e.type}</span>` +
        `<span class="verb-actor">${verbLabel(e)}</span><span class="when">${esc(e.when)}</span></div>` +
        (e.re ? `<div class="pulse-re">${esc(e.re)}</div>` : '') +
        quote +
        `<div class="pulse-foot"><span class="theme">#${esc(e.theme.replace(/\s+/g, ''))}</span>${link}<span class="tap-hint">tap to expand</span></div>`;
      card.addEventListener('click', (ev) => { if (ev.target.tagName !== 'A') card.classList.toggle('open'); });
      itemsWrap.append(card);
    });
    if (filtered.length > visibleCount) {
      const more = el('button', 'pulse-more', showAll ? 'Show fewer ↑' : `Show all ${filtered.length} ↓`);
      more.addEventListener('click', () => { showAll = !showAll; renderPulse(); });
      itemsWrap.append(more);
    }
  }
  themesSet.forEach((t) => {
    const b = el('button', t === 'All' ? 'on' : '', esc(t));
    b.addEventListener('click', () => { activeFilter = t; [...filters.children].forEach((c) => c.classList.remove('on')); b.classList.add('on'); renderPulse(); });
    filters.append(b);
  });
  renderPulse();
  $('#pulse-note').textContent = lp.note || '';

  /* Deeper Dive framing */
  $('#dd-title').textContent = profile.deeperDive?.title || 'Deeper Dive';
  $('#dd-intro').textContent = profile.deeperDive?.intro || '';

  /* Education & interests */
  const eduGrid = $('#edu-grid');
  profile.education.forEach((e) => eduGrid.append(el('div', 'edu', `<b>${esc(e.title)}</b><span>${esc(e.place)}</span>`)));
  profile.interests.forEach((i) => {
    const [head, ...rest] = String(i).split(':');
    const body = rest.join(':').trim();
    eduGrid.append(el('div', 'edu edu-interest',
      `<b>${esc(body ? head : 'Interest')}</b><span>${esc(body || head)}</span>`));
  });

  /* Contact */
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

  /* Reveal + stat count-up */
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
  document.querySelectorAll('.hero .reveal').forEach((n, i) => setTimeout(() => n.classList.add('in'), 80 * i));

  initChat();

  /* Palette commands that depend on content */
  buildPalette(profile);
}

function animateStat(card) {
  const target = Number(card.dataset.value);
  const g = card.querySelector('.g');
  const dur = 1400, t0 = performance.now();
  const fmt = (v) => `${card.dataset.prefix}${v.toLocaleString('en-US')}${card.dataset.suffix}`;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { g.textContent = fmt(target); return; }
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / dur);
    g.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

$('#year').textContent = new Date().getFullYear();

/* ── Command palette ── */
const overlay = $('#palette-overlay');
const pInput = $('#palette-input');
const pList = $('#palette-list');
let commands = [];
let sel = 0;

function buildPalette(profile) {
  commands = [
    { name: 'Ask AI about me', k: 'chat', run: () => openChat() },
    { name: 'Jump: Media & highlights', k: 'go', run: () => $('#media').scrollIntoView({ behavior: 'smooth' }) },
    { name: 'Download CV (PDF)', k: 'pdf', run: () => { location.href = './Tarek_Karaman_CV.pdf'; } },
    { name: 'Quick view, 90-second version', k: 'toggle', run: () => setRecruiter(!document.body.classList.contains('recruiter')) },
    { name: 'Deeper Dive (key required)', k: 'go', run: () => $('#vault-section').scrollIntoView({ behavior: 'smooth' }) },
    { name: 'Copy email address', k: 'copy', run: () => navigator.clipboard?.writeText(profile.email) },
    { name: 'Open LinkedIn', k: 'link', run: () => window.open(profile.linkedin, '_blank') },
    { name: 'Jump: Executive scorecard', k: 'go', run: () => $('#scorecard').scrollIntoView({ behavior: 'smooth' }) },
    { name: 'Jump: Career journey', k: 'go', run: () => $('#journey').scrollIntoView({ behavior: 'smooth' }) },
    { name: 'Jump: How I operate', k: 'go', run: () => $('#leadership').scrollIntoView({ behavior: 'smooth' }) },
    { name: 'Jump: LinkedIn pulse', k: 'go', run: () => $('#pulse').scrollIntoView({ behavior: 'smooth' }) },
    { name: 'Jump: Contact', k: 'go', run: () => $('#contact').scrollIntoView({ behavior: 'smooth' }) },
    { name: 'Toggle dark / light theme', k: 'theme', run: () => themeBtn.click() },
    { name: 'Open the CMS / editor', k: 'admin', run: () => window.open('./admin.html', '_blank') },
    { name: 'terminal', k: 'ssh tk@career', run: () => openTerminal(), hidden: true }
  ];
}
buildPalette({ email: 'tarekkaraman@me.com', linkedin: 'https://www.linkedin.com/in/tarekkaraman' });

function renderPalette(q = '') {
  const items = commands.filter((c) => {
    if (c.hidden && !'terminal'.startsWith((q || '∅').toLowerCase())) return false;
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
function openPalette() {
  overlay.hidden = false; sel = 0; pInput.value = ''; renderPalette();
  // On touch this doubles as the section menu, and autofocusing would raise the
  // keyboard over the list. Only grab focus where there is a real pointer.
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) pInput.focus();
}
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
    <p>This site was designed, written and engineered end-to-end with AI (Claude), directed by Tarek, which is the demonstration itself.</p>
    <p><b>The concierge</b> answers from a structured corpus of his career, grounded, guardrailed, and honest about what it can't discuss. Hosted with a backend it runs on Claude; on static hosting it falls back to an on-device retrieval engine.</p>
    <p><b>The Deeper Dive</b> uses real cryptography: private content is AES-256-GCM encrypted (PBKDF2, 310k iterations). The plain text never ships, not even in the public repository.</p>
    <p><b>The stack</b> is deliberately lean: no framework, sub-second first paint, ⌘K navigation, dark/light, print-perfect, mobile-first, plus a lightweight CMS so the whole thing stays editable. Knowing when <i>not</i> to add technology is the point.</p>`;
  colOverlay.hidden = false;
});
$('#colophon-close').addEventListener('click', () => { colOverlay.hidden = true; });
colOverlay.addEventListener('click', (e) => { if (e.target === colOverlay) colOverlay.hidden = true; });

document.querySelectorAll('[data-open-chat]').forEach((b) => b.addEventListener('click', () => openChat()));

/* Easter egg: type "tk!" */
let buffer = '';
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  buffer = (buffer + e.key).slice(-4);
  if (buffer.endsWith('tk!') || buffer.endsWith('>tk')) openTerminal();
});

initVault();
initTerminal();
