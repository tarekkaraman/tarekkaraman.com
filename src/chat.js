// AI concierge. Two modes:
//  1. API mode , POST /api/chat (Cloudflare Pages Function → Claude), auto-detected.
//  2. Local mode, on-device retrieval over the career corpus. Works on any static host.
// The corpus is injected via setCorpus() so the CMS-edited content flows through.

import { DEFAULT_CONTENT } from './data/content.js';

const $ = (s) => document.querySelector(s);
let apiMode = null;
let profile = DEFAULT_CONTENT;

export function setCorpus(c) { profile = c; }

const starterChips = [
  'What scale has Tarek operated at?',
  'What enterprise AI tools has he shipped?',
  'How does he build AI teams?',
  'What did he do at WSP and MAF?'
];

/* ─── Local retrieval brain ─── */
const topics = () => [
  {
    keys: ['scale', 'scope', 'size', 'budget', 'p&l', 'pnl', 'how big', 'numbers', 'users', 'impact', 'results'],
    answer: `Scale is the through-line of Tarek's career:\n\n• Rolled out Microsoft Copilot across WSP's Middle East region\n• 25+ enterprise AI tools shipped across Majid Al Futtaim and WSP, including 8+ at WSP within six months of standing up the AI Accelerator\n• Client AI programs grown from pilots to multi-year engagements valued at $20M+\n• A dedicated AI engineering delivery centre built and scaled from zero\n• Earlier: 15X revenue growth in year one at Solve IT, and a 100+ person technical team at his own venture`,
    src: '#scorecard'
  },
  {
    keys: ['team', 'hire', 'hiring', 'build ai team', 'organisation', 'organization', 'delivery centre', 'delivery center', 'people', 'talent'],
    answer: `Tarek builds AI organisations, not just AI projects. At WSP he stood up a dedicated AI engineering delivery centre, hiring the team and designing the operating model that ships AI products across internal and client programs. He founded the AI Academy (training hundreds of staff), and he's actively growing the team now, his recent LinkedIn activity is largely hiring posts for AI business partners and AI-first specialists. At Majid Al Futtaim he founded and scaled two Centres of Excellence. Earlier he managed 100+ technical staff at his own company.`,
    src: '#pulse'
  },
  {
    keys: ['leader', 'leadership', 'style', 'operate', 'philosophy', 'manage', 'culture', 'ready', 'cto', 'chief', 'executive', 'senior'],
    answer: `Tarek operates at CTO / Chief AI Officer altitude: he's repeatedly built technology capability from zero to enterprise scale, strategy, governance, delivery organisation, commercial outcomes and adoption. His principles: build capability, not one-off projects; treat governance as an enabler (guardrails from day one are why a whole region could adopt AI compliantly); measure adoption, not deployment; partner at the top of the ecosystem (Microsoft, IBM, Google, PwC); and hold technology strategy accountable to the P&L. See 'How I operate' for the full picture.`,
    src: '#leadership'
  },
  {
    keys: ['tools', 'shipped', 'built', 'products', 'enterprise ai tools', 'bid', 'automation', 'what has he made'],
    answer: `Across Majid Al Futtaim and WSP, Tarek has shipped 25+ enterprise AI tools. Within six months of standing up WSP's AI Accelerator his team shipped 8+ of them: bid automation, resourcing, data insights and project planning, improving bid-win rates and cutting delivery effort. On the client side: AI-powered water management, city digital twins and environmental simulation platforms, grown from pilots into multi-year programs valued at $20M+. At MAF he launched MAF GPT, a secure internal generative-AI assistant, plus a region-leading Microsoft Copilot deployment.`,
    src: '#journey'
  },
  {
    keys: ['wsp', 'current', 'now', 'today', 'accelerator', 'water', 'digital twin', 'twin'],
    answer: profile.deepKnowledge?.wsp || 'Tarek currently leads AI for WSP across the Middle East & Africa.',
    src: '#journey'
  },
  {
    keys: ['majid', 'maf', 'futtaim', 'copilot', 'coe', 'centre of excellence', 'center of excellence', 'gpt', 'retail', 'carrefour'],
    answer: profile.deepKnowledge?.maf || 'At Majid Al Futtaim, Tarek founded and scaled the Generative AI and RPA Centres of Excellence.',
    src: '#journey'
  },
  {
    keys: ['governance', 'ethics', 'risk', 'compliance', 'responsible', 'guardrail', 'legal', 'safe'],
    answer: `Governance is one of Tarek's differentiators. He founded WSP's AI Academy and embedded ethical and legal guardrails into every AI deployment, which is precisely what allowed a region-wide Copilot rollout to stay compliant with global frameworks. His earlier work includes digital governance projects for Dubai Health Authority, Smart Dubai, ARAMCO and ADDED. His view: compliance done right speeds adoption, it doesn't slow it.`,
    src: '#leadership'
  },
  {
    keys: ['career', 'history', 'background', 'journey', 'experience', 'past', 'earlier', 'story', 'timeline'],
    answer: () => `25+ years in five acts:\n\n${profile.experience.map((x) => `• ${x.period}, ${x.company}: ${x.role}`).join('\n')}\n\nThe pattern: each role built technology capability from the ground up and left behind an organisation that kept delivering.`,
    src: '#journey'
  },
  {
    keys: ['partner', 'microsoft', 'ibm', 'google', 'pwc', 'ecosystem', 'vendor', 'gartner'],
    answer: () => `Tarek maintains executive-level partnerships with ${profile.partnerships.map((p) => p.name).join(', ')}, spanning ${profile.partnerships.map((p) => p.area.toLowerCase()).join('; ')}. At MAF these included a regional GenAI Symposium he directed with Microsoft, IBM and Gartner.`,
    src: '#scorecard'
  },
  {
    keys: ['award', 'recognition', 'achievement', 'won', 'prize'],
    answer: () => `Recognition highlights:\n\n${profile.awards.map((a) => `• ${a}`).join('\n')}`,
    src: '#scorecard'
  },
  {
    keys: ['education', 'degree', 'study', 'university', 'qualification', 'school'],
    answer: () => `Tarek holds a BA (Hons) from Middlesex University, London, and an Audio Media Engineering Diploma from SAE Institute, London. That said, 25 years of shipped outcomes are the stronger credential.`,
    src: '#education'
  },
  {
    keys: ['contact', 'email', 'phone', 'reach', 'call', 'meet', 'connect', 'talk', 'conversation'],
    answer: () => `Tarek is based in Dubai (British national, UAE resident) and always glad to connect with technology and transformation leaders.\n\n• Email: ${profile.email}\n• LinkedIn: linkedin.com/in/tarekkaraman\n• Phone: ${profile.phone}\n\nThe concierge just opens the door, the best conversations happen person to person.`,
    src: '#contact'
  },
  {
    keys: ['deeper dive', 'vault', 'password', 'access key', 'locked', 'key', 'private', 'more detail', 'case stud', 'portfolio', 'reference'],
    answer: `The Deeper Dive is a key-gated area with selected case studies, a portfolio of work, and references, a little more than the public page, for people Tarek has shared a key with. It's AES-256 encrypted; the plain text never ships. If you have a key, use the Deeper Dive section; if not, just ask Tarek directly.`,
    src: '#vault-section'
  },
  {
    keys: ['site', 'this website', 'how was this built', 'built with', 'stack', 'claude', 'ai built', 'made this'],
    answer: `This site was designed and engineered end-to-end with AI (Claude), directed by Tarek, which is the demonstration: judgment about where AI creates value, guardrails by default, and lean engineering (no framework, sub-second paint, real encryption for private content, and a built-in CMS). Click 'how this site works' in the footer for the colophon.`,
    src: '#contact'
  },
  {
    keys: ['linkedin', 'followers', 'posts', 'social', 'network', 'pulse', 'engage'],
    answer: () => `Tarek has ${profile.linkedinPulse.followers.toLocaleString('en-US')} LinkedIn followers (${profile.linkedinPulse.connections} connections). His feed is a good read on his interests: he amplifies AI thought leadership, WSP and MAF leadership, congratulates peers on executive moves, and posts hiring calls for WSP's Middle East AI team. See the LinkedIn Pulse section.`,
    src: '#pulse'
  }
];

function localAnswer(q) {
  const lq = q.toLowerCase();
  let best = null, bestScore = 0;
  for (const t of topics()) {
    const score = t.keys.reduce((n, k) => n + (lq.includes(k) ? (k.length > 4 ? 2 : 1) : 0), 0);
    if (score > bestScore) { best = t; bestScore = score; }
  }
  if (best) return { text: typeof best.answer === 'function' ? best.answer() : best.answer, src: best.src };

  // CMS-added knowledge base entries (titles act as keywords)
  for (const kb of profile.knowledgeBase || []) {
    const words = (kb.title || '').toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    if (words.some((w) => lq.includes(w))) return { text: kb.body, src: null };
  }

  if (/^(hi|hello|hey|salaam|salam|good (morning|afternoon|evening))\b/.test(lq)) {
    return { text: `Hello! Ask me anything about Tarek's career: the scale he's operated at, the AI tools he's shipped, or the teams he's built. I stick to the facts, and I'll tell you when something's above my pay grade.`, src: null };
  }
  return {
    text: `That one's outside my brief. I only talk about Tarek's career and leadership, and I never make things up (an AI leader's AI shouldn't hallucinate). Try the scale he's operated at, the tools he's shipped, or his work at WSP and MAF.`,
    src: null
  };
}

/* ─── API mode ─── */
async function detectApi() {
  if (apiMode !== null) return apiMode;
  try {
    const r = await fetch('./api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ping: true }) });
    apiMode = r.ok && (r.headers.get('content-type') || '').includes('json') && (await r.json()).ok === true;
  } catch { apiMode = false; }
  $('#chat-mode').textContent = apiMode
    ? '● live, powered by Claude and grounded in Tarek’s verified career record'
    : '● instant answers, straight from Tarek’s verified career record';
  return apiMode;
}

const history = [];
async function apiAnswer(q) {
  const r = await fetch('./api/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: q, history: history.slice(-10) })
  });
  if (!r.ok) throw new Error(`api ${r.status}`);
  return { text: (await r.json()).reply, src: null };
}

/* ─── UI ─── */
let booted = false;

export function initChat() {
  const chips = $('#chat-chips');
  chips.innerHTML = '';
  starterChips.forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = c;
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

const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Renders plain answer text (paragraphs separated by blank lines, optional
// "• " bulleted lines) as normal, properly-spaced HTML: real <p> and <ul>
// elements instead of a raw pre-wrap text dump.
function formatAnswer(text) {
  const blocks = text.trim().split(/\n\s*\n/);
  return blocks.map((block) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length && lines.every((l) => l.startsWith('• '))) {
      return `<ul>${lines.map((l) => `<li>${escHtml(l.slice(2))}</li>`).join('')}</ul>`;
    }
    return `<p>${escHtml(lines.join(' '))}</p>`;
  }).join('');
}

function addMsg(cls, text, src) {
  const log = $('#chat-log');
  const m = document.createElement('div');
  m.className = `msg ${cls}`;
  if (cls === 'msg-ai' && text) m.innerHTML = formatAnswer(text);
  else m.textContent = text;
  if (src) {
    const a = document.createElement('a');
    a.href = src; a.className = 'src';
    a.textContent = `→ see ${src.replace('#', '').replace('-section', '')} section`;
    m.append(a);
  }
  log.append(m); log.scrollTop = log.scrollHeight;
  return m;
}

export function openChat() {
  $('#concierge').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => $('#chat-input').focus({ preventScroll: true }), 500);
  if (!booted) {
    booted = true;
    addMsg('msg-ai', `Hi, I'm the AI that knows Tarek's career inside out: 25+ years, currently Head of AI at WSP Middle East. Ask me anything, or tap a question below to get going.`);
  }
}

export async function askChat(q) {
  booted = true;
  addMsg('msg-user', q);
  const log = $('#chat-log');
  const typing = document.createElement('div');
  typing.className = 'msg msg-ai';
  typing.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
  log.append(typing); log.scrollTop = log.scrollHeight;

  let ans;
  try { ans = (await detectApi()) ? await apiAnswer(q) : localAnswer(q); }
  catch { ans = localAnswer(q); }
  history.push({ role: 'user', content: q }, { role: 'assistant', content: ans.text });

  typing.remove();
  addMsg('msg-ai', ans.text, ans.src);
}
