// AI concierge. Two modes:
//  1. API mode  — POST /api/chat (Cloudflare Pages Function → Claude). Detected at runtime.
//  2. Local mode — on-device retrieval over the profile corpus. Works on any static host.
// Both are grounded in profile.js and guardrailed: no invented facts, confidential
// questions route to the vault, off-topic questions are politely declined.

import { profile } from './data/profile.js';

const $ = (s) => document.querySelector(s);
let apiMode = null; // null = undetected, true/false after first probe

const starterChips = [
  'What scale has Tarek operated at?',
  'How does he build AI teams?',
  'Why is he ready for a CTO role?',
  'What did he deliver at WSP?',
  'What’s his leadership style?',
  'How do I contact him?'
];

/* ─── Local retrieval brain ─── */
const wsp = profile.experience[0];
const maf = profile.experience[1];

const topics = [
  {
    keys: ['scale', 'scope', 'size', 'budget', 'p&l', 'pnl', 'how big', 'numbers', 'users', 'impact'],
    answer: () =>
      `Scale is the through-line of Tarek's career:\n\n• 60,000+ users enabled on Microsoft Copilot across WSP's region and beyond\n• 8+ enterprise AI tools shipped within six months of standing up the AI Accelerator\n• Client AI programs grown from pilots to multi-year engagements valued at $20M+\n• A dedicated AI engineering delivery centre built and scaled from zero\n• Earlier: 15X revenue growth in year one at Solve IT, and a 100+ person technical team at his own venture`,
    src: '#scorecard'
  },
  {
    keys: ['team', 'hire', 'hiring', 'build ai team', 'organisation', 'organization', 'delivery centre', 'delivery center', 'people'],
    answer: () =>
      `Tarek builds AI organisations, not just AI projects. At WSP he stood up a dedicated AI engineering delivery centre — hiring the team and designing the operating model that ships AI products across internal and client programs. He founded the AI Academy (training hundreds of staff), and he's actively growing the team now: his recent LinkedIn activity is largely hiring posts for AI business partners and AI-first specialists. At Majid Al Futtaim he founded and scaled two Centres of Excellence (Generative AI and RPA). Earlier in his career he managed 100+ technical staff at his own company.`,
    src: '#journey'
  },
  {
    keys: ['cto', 'chief technology', 'chief ai', 'ready', 'why should', 'executive', 'board', 'why hire'],
    answer: () =>
      `The CTO case in brief: Tarek has repeatedly built technology capability from zero to enterprise scale — strategy, governance, delivery organisation, commercial outcomes, and adoption. He owns the full arc: board-level AI strategy at WSP, a delivery centre he built and runs, $20M+ client programs, 60,000+ users enabled, and governance frameworks that made adoption compliant rather than constrained. He partners at C-suite level with Microsoft, IBM, Google and PwC. And he ships — this site, built end-to-end with AI under his direction, is itself the demo.`,
    src: '#journey'
  },
  {
    keys: ['wsp', 'current', 'now', 'today', 'accelerator'],
    answer: () =>
      `At WSP (2024–present) Tarek is the regional and global AI leader, owning both AI strategy and the delivery organisation across the Middle East & Africa while contributing to global enterprise AI delivery. Highlights:\n\n${wsp.bullets.map((b) => `• ${b}`).join('\n')}\n\nSome current-engagement detail is confidential — if Tarek has shared an access key with you, use the Confidential Access section.`,
    src: '#vault-section'
  },
  {
    keys: ['majid', 'maf', 'futtaim', 'copilot', 'coe', 'centre of excellence', 'center of excellence', 'gpt'],
    answer: () =>
      `At Majid Al Futtaim (2022–2024) Tarek founded and scaled the Generative AI and RPA Centres of Excellence — making MAF one of the region's earliest enterprise adopters of generative AI. He launched MAF GPT, led one of the region's earliest large-scale Microsoft Copilot deployments, secured partnerships with Microsoft, IBM, PwC and Google, and was recognised by both Microsoft and MAF CEOs, winning 'Team of the Year' for AI-driven transformation.`,
    src: '#journey'
  },
  {
    keys: ['leadership', 'style', 'operate', 'philosophy', 'manage', 'culture'],
    answer: () =>
      `Tarek's operating principles: build capability, not projects (accelerators, academies and delivery centres that outlast any single initiative); treat governance as an enabler — guardrails embedded from day one are why 60,000 people could adopt AI compliantly; measure adoption, not deployment; partner at the top of the ecosystem; and hold technology strategy accountable to commercial outcomes. See 'How I operate' for the full picture.`,
    src: '#leadership'
  },
  {
    keys: ['governance', 'ethics', 'risk', 'compliance', 'responsible', 'guardrail', 'legal'],
    answer: () =>
      `Governance is one of Tarek's differentiators. He founded WSP's AI Academy and embedded ethical and legal guardrails into every AI deployment — which is precisely what allowed adoption at 60,000+ user scale to stay compliant with global frameworks. His earlier work includes digital governance projects for Dubai Health Authority, Smart Dubai, ARAMCO and ADDED. His view: compliance done right speeds adoption, it doesn't slow it.`,
    src: '#leadership'
  },
  {
    keys: ['career', 'history', 'background', 'journey', 'experience', 'past', 'earlier', 'story'],
    answer: () =>
      `25+ years in five acts:\n\n${profile.experience.map((x) => `• ${x.period} — ${x.company}: ${x.role}`).join('\n')}\n\nThe pattern: each role built technology capability from the ground up and left behind an organisation that kept delivering. Scroll the Journey section for the full narrative.`,
    src: '#journey'
  },
  {
    keys: ['partner', 'microsoft', 'ibm', 'google', 'pwc', 'ecosystem', 'vendor'],
    answer: () =>
      `Tarek maintains executive-level partnerships with ${profile.partnerships.map((p) => p.name).join(', ')} — spanning ${profile.partnerships.map((p) => p.area.toLowerCase()).join('; ')}. At MAF these partnerships were formal accelerators of the innovation agenda, including a regional GenAI Symposium he directed with Microsoft, IBM and Gartner.`,
    src: '#scorecard'
  },
  {
    keys: ['award', 'recognition', 'achievement', 'won'],
    answer: () => `Recognition highlights:\n\n${profile.awards.map((a) => `• ${a}`).join('\n')}`,
    src: '#scorecard'
  },
  {
    keys: ['education', 'degree', 'study', 'university', 'qualification'],
    answer: () =>
      `Tarek holds a BA (Hons) from Middlesex University, London, and an Audio Media Engineering Diploma from SAE Institute, London. That said — 25 years of shipped outcomes are the stronger credential; see the scorecard.`,
    src: '#education'
  },
  {
    keys: ['contact', 'email', 'phone', 'reach', 'call', 'meet', 'hire', 'available', 'availability', 'open to'],
    answer: () =>
      `Tarek is based in Dubai (British national, UAE resident) and is interested in CTO, Chief AI Officer and Chief Digital Officer mandates.\n\n• Email: ${profile.email}\n• LinkedIn: linkedin.com/in/tarekkaraman\n• Phone: ${profile.phone}\n\nFor a decision this size, talk to the real Tarek — the concierge just opens the door.`,
    src: '#contact'
  },
  {
    keys: ['confidential', 'vault', 'password', 'access key', 'locked', 'secret', 'nda'],
    answer: () =>
      `Some of Tarek's current WSP work — live programmes, commercial detail, current-engagement specifics — is confidential and encrypted on this site (AES-256-GCM; the plain text never ships). If Tarek has shared an access key with you, use the Confidential Access section. If not, ask him directly — that's rather the point.`,
    src: '#vault-section'
  },
  {
    keys: ['site', 'this website', 'how was this built', 'built with', 'stack', 'claude', 'ai built'],
    answer: () =>
      `This site was designed and engineered end-to-end with AI (Claude), directed by Tarek — which is the demonstration: judgment about where AI creates value, guardrails included by default, and lean engineering (no framework, sub-second paint, real encryption for confidential content). Click 'how this site works' in the footer for the colophon.`,
    src: '#contact'
  },
  {
    keys: ['linkedin', 'followers', 'posts', 'social'],
    answer: () =>
      `Tarek has ${profile.linkedinPulse.followers.toLocaleString('en-US')} LinkedIn followers (${profile.linkedinPulse.connections} connections). His recent activity is mostly building — hiring AI business partners and specialists for WSP's Middle East AI team, with posts reaching thousands of impressions. Profile: linkedin.com/in/tarekkaraman`,
    src: '#pulse'
  }
];

function localAnswer(q) {
  const lq = q.toLowerCase();
  // score topics by keyword hits
  let best = null;
  let bestScore = 0;
  for (const t of topics) {
    const score = t.keys.reduce((n, k) => n + (lq.includes(k) ? (k.length > 4 ? 2 : 1) : 0), 0);
    if (score > bestScore) { best = t; bestScore = score; }
  }
  if (best) return { text: best.answer(), src: best.src };

  // Greetings
  if (/^(hi|hello|hey|salaam|salam|good (morning|afternoon|evening))\b/.test(lq)) {
    return { text: `Hello! I'm Tarek's AI concierge — trained on his career and happy to answer what a screening call would ask. Try one of the suggested questions below, or ask about scale, leadership, governance, or his current role.`, src: null };
  }

  // Guardrail: clearly off-topic
  return {
    text: `That's outside what I can speak to — I'm scoped to Tarek's career, leadership and availability, and I don't guess or improvise facts (that's a design decision; ungrounded AI would rather undermine the CV of an AI leader). Try asking about his scale of delivery, how he builds AI teams, or his current role at WSP.`,
    src: null
  };
}

/* ─── API mode ─── */
async function detectApi() {
  if (apiMode !== null) return apiMode;
  try {
    // A real backend answers a ping with JSON {ok:true}. Static hosts either 404
    // (GitHub Pages) or SPA-fallback with HTML (Vite dev) — both mean local mode.
    const r = await fetch('./api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ping: true })
    });
    apiMode = r.ok && (r.headers.get('content-type') || '').includes('json') && (await r.json()).ok === true;
  } catch { apiMode = false; }
  const modeEl = $('#chat-mode');
  modeEl.textContent = apiMode
    ? '● live — powered by Claude, grounded in Tarek’s career corpus'
    : '● on-device mode — grounded retrieval, zero data leaves your browser. (Full Claude mode activates on the Cloudflare deployment.)';
  return apiMode;
}

const history = [];

async function apiAnswer(q) {
  const r = await fetch('./api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: q, history: history.slice(-10) })
  });
  if (!r.ok) throw new Error(`api ${r.status}`);
  const data = await r.json();
  return { text: data.reply, src: null };
}

/* ─── UI ─── */
let booted = false;

export function initChat() {
  const chips = $('#chat-chips');
  starterChips.forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = c;
    b.addEventListener('click', () => askChat(c));
    chips.append(b);
  });
  $('#chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#chat-input');
    if (input.value.trim()) askChat(input.value.trim());
    input.value = '';
  });
  detectApi();
}

function addMsg(cls, text, src) {
  const log = $('#chat-log');
  const m = document.createElement('div');
  m.className = `msg ${cls}`;
  m.textContent = text;
  if (src) {
    const a = document.createElement('a');
    a.href = src;
    a.className = 'src';
    a.textContent = `→ see ${src.replace('#', '').replace('-section', '')} section`;
    m.append(a);
  }
  log.append(m);
  log.scrollTop = log.scrollHeight;
  return m;
}

export function openChat() {
  $('#concierge').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => $('#chat-input').focus({ preventScroll: true }), 500);
  if (!booted) {
    booted = true;
    addMsg('msg-ai', `Welcome — I'm Tarek's AI concierge. I answer from his verified career record: 25+ years, currently Head of AI at WSP Middle East. Ask me what you'd ask in a first screening call.`);
  }
}

export async function askChat(q) {
  if (!booted) { booted = true; }
  addMsg('msg-user', q);
  const log = $('#chat-log');
  const typing = document.createElement('div');
  typing.className = 'msg msg-ai';
  typing.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
  log.append(typing);
  log.scrollTop = log.scrollHeight;

  let ans;
  try {
    ans = (await detectApi()) ? await apiAnswer(q) : localAnswer(q);
  } catch {
    ans = localAnswer(q); // API hiccup → graceful degradation
  }
  history.push({ role: 'user', content: q }, { role: 'assistant', content: ans.text });

  typing.remove();
  // typewriter-ish reveal (respects reduced motion)
  const m = addMsg('msg-ai', '', ans.src);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    m.prepend(document.createTextNode(ans.text));
    return;
  }
  const words = ans.text.split(/(\s+)/);
  let i = 0;
  const node = document.createTextNode('');
  m.prepend(node);
  const tick = () => {
    node.textContent += words[i++] ?? '';
    log.scrollTop = log.scrollHeight;
    if (i < words.length) setTimeout(tick, 12);
  };
  tick();
}
