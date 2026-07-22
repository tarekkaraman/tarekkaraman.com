// Cloudflare Pages Function — /api/chat
// Activates automatically when the site is hosted on Cloudflare Pages with an
// ANTHROPIC_API_KEY environment variable set (Pages → Settings → Variables).
// Until then the frontend gracefully uses its on-device retrieval mode.

import { profile } from '../../src/data/profile.js';

const SYSTEM = () => `You are the AI concierge on the personal CV site of ${profile.name} (${profile.headline}; currently ${profile.role}). Your audience is senior executive recruiters and hiring panels evaluating him for CTO / Chief AI Officer / Chief Digital Officer roles.

Ground every answer ONLY in the career record below. Never invent facts, metrics, employers, or dates. If asked something not covered, say so plainly and suggest asking Tarek directly (${profile.email}).

Confidentiality rules (hard):
- Current WSP engagement specifics beyond the record below (client names, live programme details, commercial terms, colleagues) are confidential. Politely decline and point to the site's Confidential Access section (unlocked with a key Tarek shares personally).
- Never disclose compensation expectations, notice period, or references — those are for direct conversation.
- Off-topic requests (general knowledge, coding help, anything not about Tarek): politely decline in one sentence and steer back.

Style: concise, confident, warm; the voice of a well-briefed chief of staff. Prefer concrete numbers. 120 words max unless asked for depth. Plain text only, no markdown headings.

CAREER RECORD
=============
About: ${profile.about}
Target roles: ${profile.targetRoles}. Location: ${profile.location}. Status: ${profile.status.join('; ')}.
Key numbers: ${profile.stats.map((s) => `${s.prefix || ''}${s.value}${s.suffix || ''} ${s.label}`).join(' · ')}
Experience:
${profile.experience.map((x) => `- ${x.period} | ${x.company} — ${x.role} (${x.location}). ${x.summary} Highlights: ${x.bullets.join('; ')}`).join('\n')}
Awards: ${profile.awards.join(' | ')}
Partnerships: ${profile.partnerships.map((p) => `${p.name} (${p.area})`).join(', ')}
Skills: ${profile.skills.join(', ')}
Education: ${profile.education.map((e) => `${e.title}, ${e.place}`).join(' | ')}
LinkedIn: ${profile.linkedin} — ${profile.linkedinPulse.followers} followers; recent activity is hiring for WSP's AI team.
Contact: ${profile.email} · ${profile.phone}
This site itself was designed and engineered end-to-end with AI (Claude) under Tarek's direction — it is a live demonstration of his approach.`;

export async function onRequestOptions({ env }) {
  // The frontend probes with OPTIONS to decide live vs on-device mode —
  // only report live when a key is actually configured.
  return new Response(null, { status: env.ANTHROPIC_API_KEY ? 204 : 404 });
}

export async function onRequestPost({ request, env }) {
  if (!env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'not-configured' }, { status: 503 });
  }
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: 'bad-json' }, { status: 400 }); }
  if (body.ping) return Response.json({ ok: true }); // frontend live-mode probe
  const message = String(body.message || '').slice(0, 2000);
  if (!message) return Response.json({ error: 'empty' }, { status: 400 });

  const history = Array.isArray(body.history)
    ? body.history.slice(-10).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content || '').slice(0, 2000)
      }))
    : [];

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: env.CHAT_MODEL || 'claude-sonnet-5',
      max_tokens: 600,
      system: SYSTEM(),
      messages: [...history, { role: 'user', content: message }]
    })
  });

  if (!r.ok) {
    const detail = await r.text();
    console.log('anthropic error', r.status, detail.slice(0, 300));
    return Response.json({ error: 'upstream' }, { status: 502 });
  }
  const data = await r.json();
  const reply = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n') || '…';
  return Response.json({ reply });
}
