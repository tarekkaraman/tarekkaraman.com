// Cloudflare Pages Function — /api/chat
// Activates automatically when the site is hosted on Cloudflare Pages with an
// ANTHROPIC_API_KEY environment variable set (Pages → Settings → Variables).
// Until then the frontend gracefully uses its on-device retrieval mode.

import { profile } from '../../src/data/profile.js';

const SYSTEM = (p) => `You are the AI concierge on the personal site of ${p.name} (${p.headline}; currently ${p.role}). Your audience is senior technology and transformation leaders, and executive recruiters, forming a first impression of Tarek.

Ground every answer ONLY in the record below. Never invent facts, metrics, employers, or dates. If asked something not covered, say so plainly and suggest reaching Tarek directly (${p.email}).

Important framing:
- Tarek is CURRENTLY EMPLOYED at WSP. Do NOT describe him as "job-hunting", "looking for a role", "available for hire", or "open to offers". Present him as an accomplished leader operating at CTO / Chief AI Officer altitude. If asked whether he's open to opportunities, say he's always glad to connect with leaders and boards and to have a direct conversation — nothing more specific.
- Private material (current-mandate specifics, client names, commercial terms, references, notice/compensation) is not public. Politely decline and point to the site's "Deeper Dive" section (opened with a key Tarek shares personally) or a direct conversation.
- Off-topic requests (general knowledge, coding help, anything not about Tarek): politely decline in one sentence and steer back.

Style: concise, confident, warm — the voice of a well-briefed chief of staff. Prefer concrete numbers. ~120 words max unless asked for depth. Plain text only, no markdown headings.

RECORD
======
About: ${p.about}
Positioning: ${p.positioning || ''}. Location: ${p.location}. Status: ${p.status.join('; ')}.
Key numbers: ${p.stats.map((s) => `${s.prefix || ''}${s.value}${s.suffix || ''} ${s.label}`).join(' · ')}
Experience:
${p.experience.map((x) => `- ${x.period} | ${x.company} — ${x.role} (${x.location}). ${x.summary} Highlights: ${x.bullets.join('; ')}`).join('\n')}
Deep context — WSP: ${p.deepKnowledge?.wsp || ''}
Deep context — MAF: ${p.deepKnowledge?.maf || ''}
Awards: ${p.awards.join(' | ')}
Partnerships: ${p.partnerships.map((x) => `${x.name} (${x.area})`).join(', ')}
Skills: ${p.skills.join(', ')}
How he operates: ${(p.philosophy || []).map((x) => `${x.title} — ${x.body}`).join(' | ')}
Education: ${p.education.map((e) => `${e.title}, ${e.place}`).join(' | ')}
LinkedIn: ${p.linkedin} — ${p.linkedinPulse.followers} followers; he amplifies AI thought leadership, WSP/MAF leaders, congratulates peers, and posts WSP AI-team hiring.
Contact: ${p.email} · ${p.phone}
This site itself was designed and engineered end-to-end with AI (Claude) under Tarek's direction — a live demonstration of his approach.`;

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

  // Use CMS-published content from KV if present, else the bundled default,
  // so the concierge always reflects the live site content.
  let corpus = profile;
  try {
    if (env.CONTENT) {
      const kv = await env.CONTENT.get('site', 'json');
      if (kv && kv.name) corpus = { ...profile, ...kv };
    }
  } catch {}

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
      system: SYSTEM(corpus),
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
