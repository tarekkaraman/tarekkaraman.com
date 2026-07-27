// ─────────────────────────────────────────────────────────────
// Default / seed content for the site + AI concierge.
// This is a plain, JSON-serialisable object. The admin CMS (/admin.html,
// tarekkaraman.com/admin) edits a copy of exactly this shape and can publish
// it live (Cloudflare KV), commit it (public/content.json) or export it.
// Private material lives encrypted (see private/*-content.json).
// ─────────────────────────────────────────────────────────────

// Branded SVG tiles used as media thumbnails until real screenshots are
// uploaded via the CMS (any uploaded image simply replaces these).
const tile = (svgBody, bg = '#101725') =>
  'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="${bg}"/>${svgBody}</svg>`
  );
const THUMBS = {
  wspHiring: tile(`<text x="320" y="190" text-anchor="middle" font-family="Helvetica,Arial" font-weight="bold" font-size="110" fill="#ff372f">WSP</text><text x="320" y="280" text-anchor="middle" font-family="Georgia" font-size="32" fill="#f2ecdd">Growing the Middle East AI team</text>`, '#181a1f')
};

export const profile = {
  name: 'Tarek Karaman',
  headline: 'AI & Digital Transformation Leader',
  role: 'Head of Artificial Intelligence, WSP Middle East',
  // Internal positioning used to brief the concierge. NOT rendered as an
  // "open to work" banner (Tarek is currently employed).
  positioning: 'A technology leader operating at CTO and Chief AI Officer altitude, who builds enterprise AI capability from strategy through delivery and adoption.',
  location: 'Dubai, United Arab Emirates',
  email: 'tarekkaraman@me.com',
  phone: '+971 55 270 4406',
  linkedin: 'https://www.linkedin.com/in/tarekkaraman',
  status: ['British National', 'UAE Resident, Dubai based', 'English, Fluent'],

  // Optional hero voice intro. Drop an mp3 at public/voice-intro.mp3 (or set a
  // URL in the CMS) and the hero shows a play button. Empty = button hidden.
  voiceIntro: '',

  about: `AI and Digital Transformation Leader with 25+ years delivering enterprise-scale innovation across government, infrastructure, and Fortune 500 sectors. A specialist in Generative AI, enterprise AI tooling, digital transformation, and governance, with a proven record of building AI Accelerators, establishing Centres of Excellence, and embedding adoption frameworks that deliver measurable business outcomes. He partners with C-suite executives and global technology leaders to build AI capability from the ground up: strategy and governance through to delivery and adoption at scale.`,

  stats: [
    { value: 25, suffix: '+', label: 'Years experience' },
    { value: 60000, suffix: '+', label: 'People enabled on AI in the past 4 years' },
    { value: 25, suffix: '+', label: 'Enterprise AI tools shipped' },
    { value: 20, prefix: '$', suffix: 'M+', label: 'Programs delivered' }
  ],

  experience: [
    {
      company: 'WSP',
      role: 'Artificial Intelligence & Innovation Leader',
      period: '2024–Present',
      location: 'Dubai, UAE · Global & Middle East / Africa',
      summary: 'Regional and global AI leader, owning AI strategy and the delivery organisation across the Middle East and Africa while contributing to global enterprise AI delivery. Built the region’s AI capability from the ground up.',
      bullets: [
        'Established the ME AI Accelerator and a dedicated AI engineering delivery centre',
        'Deployed 8+ enterprise AI tools within six months across bid, resourcing, insights and planning',
        'Rolled out Microsoft Copilot across the region',
        'Directed client AI programs from pilots to multi-year engagements valued at $20M+',
        'Founded the AI Academy and embedded ethical and legal guardrails into every deployment'
      ],
      more: true // has additional detail behind the Deeper Dive key
    },
    {
      company: 'Majid Al Futtaim',
      role: 'Technology & Innovation Lead',
      period: '2022–2024',
      location: 'Dubai, UAE',
      summary: 'Founded and scaled the Generative AI and RPA Centres of Excellence, positioning MAF as one of the region’s earliest enterprise adopters of generative AI and intelligent automation.',
      bullets: [
        'Launched MAF GPT and led one of the region’s earliest large-scale Microsoft Copilot deployments',
        'Secured partnerships with Microsoft, IBM, PwC, and Google',
        'Recognised by Microsoft and MAF CEOs, and won ‘Team of the Year’ for AI-driven transformation',
        'Directed a regional GenAI Symposium with Microsoft, IBM, and Gartner'
      ]
    },
    {
      company: 'Alsayegh Media',
      role: 'Head of Digital & Innovation',
      period: '2018–2022',
      location: 'Dubai, UAE',
      summary: 'Led the expansion of the digital division into emerging-technology services, securing multi-million-dirham contracts with government and enterprise clients.',
      bullets: [
        'Expanded into AI, Blockchain, NFT, and Metaverse offerings',
        'Delivered digital governance projects for Dubai Health Authority, Smart Dubai, ARAMCO, and ADDED',
        'Materially increased divisional revenue through new service lines and high-value clients'
      ]
    },
    {
      company: 'Rubix Block',
      role: 'Digital Product & Strategy Director',
      period: '2016–2018',
      location: 'Dubai · UK',
      summary: 'Directed digital product and strategy with a focus on AI, blockchain, and data governance across the GCC.',
      bullets: [
        'Secured multi-million-dirham GCC contracts across AI, blockchain, and data governance',
        'Developed digital transformation frameworks for government and private-sector clients'
      ]
    },
    {
      company: 'Solve IT',
      role: 'Director of Digital & Innovation',
      period: '2014–2016',
      location: 'Dubai, UAE',
      summary: 'Led the digital and innovation practice, driving rapid revenue growth through pioneering digital solutions.',
      bullets: [
        'Achieved 15X revenue growth in the first year',
        'Secured $2M+ in new contracts, including large-scale analytics for Transguard Group',
        'Forged enterprise partnerships with Microsoft and Samsung'
      ]
    },
    {
      company: 'Earlier Roles',
      role: 'Founder, Consultant & Digital Leader',
      period: '2002–2014',
      location: 'London · Dubai',
      summary: 'Two decades of building across fintech, digital music publishing, VR, higher education and digital media.',
      bullets: [
        'Qlikcash: built a FinTech neo-banking platform and secured investment (2014)',
        'Fortis Panels: delivered digital infrastructure for UAE expansion (2013–14)',
        'Deqoy Music: founded a digital music-publishing platform with 6,000+ licensed tracks and 100+ technical staff (2006–12)',
        'Digital transformation leadership across VR, higher education, and digital media (2002–06)'
      ]
    }
  ],

  awards: [
    'Team of the Year for AI-Driven Transformation, Majid Al Futtaim',
    'Executive Recognition from Microsoft & MAF Group leadership',
    'Regional GenAI Symposium, featured leader (Microsoft, IBM, Gartner)'
  ],

  partnerships: [
    { name: 'Microsoft', area: 'Enterprise AI & Copilot' },
    { name: 'IBM', area: 'AI & automation' },
    { name: 'Google', area: 'Cloud & AI' },
    { name: 'PwC', area: 'Transformation advisory' }
  ],

  skills: [
    'AI, Machine Learning & Generative AI',
    'Digital Transformation & Governance',
    'Enterprise AI Tools & Automation',
    'Corporate Innovation & R&D Leadership',
    'Product & Platform Development',
    'Strategic Partnerships & Ecosystem Building',
    'Large-Scale Program Delivery (Govt. & Enterprise)',
    'Operational Excellence & Change Management'
  ],

  philosophy: [
    { title: 'Capability, not projects', body: 'AI initiatives fail as one-off pilots. I build accelerators, delivery centres and academies: the organisational muscle that keeps shipping after the headline project ends.' },
    { title: 'Governance is an enabler', body: 'Ethical and legal guardrails embedded from day one are what let a whole region adopt AI without incident. Compliance done right speeds adoption; it doesn’t slow it.' },
    { title: 'Adoption is the product', body: 'A deployed tool nobody uses is a cost. I measure success in changed ways of working, so enablement, training, and executive sponsorship are engineered, not hoped for.' },
    { title: 'Partner at the top', body: 'Microsoft, IBM, Google, PwC. The fastest route to enterprise-grade AI is pairing internal capability with the ecosystem’s best, on commercial terms that work.' },
    { title: 'Commercial outcomes', body: 'Bid-win rates, delivery effort, revenue growth, $20M+ programs. Technology strategy only matters when it lands on the P&L.' },
    { title: 'Build teams that outlast you', body: 'From 100+ technical staff at my own venture to WSP’s AI delivery hub, hiring, mentoring and operating models are the real legacy of any leadership role.' }
  ],

  // Richer context the concierge draws on. Edit or extend in the CMS: the
  // knowledgeBase list below is free-form and fully editable (add sources,
  // reference material, corrections; every entry is fed to the AI).
  deepKnowledge: {
    wsp: `At WSP (2024 to present) Tarek is the AI & Innovation Leader for the Middle East, contributing to WSP's global enterprise AI delivery. WSP is a global professional-services and engineering firm; the Middle East business alone has 500,000+ LinkedIn followers. Tarek built the region's AI function from zero: the ME AI Accelerator (framework and delivery model), a dedicated AI engineering delivery centre (hiring the team and operating model), and the AI Academy for capability building. Within six months the Accelerator shipped 8+ enterprise AI tools spanning bid automation, resourcing, data insights and project planning, improving bid-win rates and cutting delivery effort. On the client side he has directed AI initiatives in AI-powered water management, city digital twins and environmental simulation, growing them from pilots into multi-year programs valued at $20M+. He rolled out Microsoft Copilot across the region with compliance under global governance frameworks. He is actively hiring AI business partners and AI-first specialists across the region.`,
    maf: `At Majid Al Futtaim (2022 to 2024), the retail, leisure and real-estate group behind Mall of the Emirates, City Centre malls, Carrefour in the region and VOX Cinemas, Tarek was Technology & Innovation Lead. He founded and scaled two Centres of Excellence (Generative AI and RPA), making MAF one of the region's earliest enterprise adopters of generative AI. He launched MAF GPT (a secure internal generative-AI assistant) and led one of the region's earliest large-scale Microsoft Copilot deployments. He secured strategic partnerships with Microsoft, IBM, PwC and Google, and directed a regional GenAI Symposium featuring Microsoft, IBM and Gartner. His team won 'Team of the Year' for AI-driven transformation and he was recognised personally by both Microsoft and MAF group CEOs.`
  },
  knowledgeBase: [
    // { title: 'Topic or source name', body: 'Facts the AI may use, in your words.' }
  ],

  // ── Media: visual highlights (posts, videos, coverage). Fully CMS-editable;
  // items without a url are hidden on the public site until you add the link.
  // Add a thumbnail in the CMS (uploaded images are stored inline) or leave
  // empty for a branded placeholder tile.
  // Ordered newest-first, matching the Journey section. Dates are the post's
  // own publication date (decoded from the LinkedIn activity id) and are kept
  // here as a comment so the ordering stays obvious when items are added.
  // Thumbnails and the one clip are self-hosted under public/media/ — LinkedIn
  // CDN URLs carry expiry tokens and would break once they lapse.
  media: [
    // 2026-05-22
    { title: 'Hiring the WSP AI team', kind: 'post', tag: 'WSP', desc: 'Growing the Middle East AI engineering and business-partner team.', url: 'https://www.linkedin.com/feed/update/urn:li:activity:7463535335600226304/', thumb: THUMBS.wspHiring },
    // 2025-11-03
    { title: 'Five ways AI is reshaping the built environment', kind: 'post', tag: 'WSP', desc: 'WSP Middle East insight on predictive maintenance, computer vision, robotics, data centres and autonomous mobility.', url: 'https://www.linkedin.com/feed/update/urn:li:activity:7391043770210897920/', thumb: '/media/wsp-ai-built-environment.jpg' },
    // 2025-02-13
    { title: 'WSP × Microsoft: a $1B+ global partnership', kind: 'post', tag: 'WSP', desc: 'Tarek on the seven-year strategic partnership, with Microsoft 365 Copilot expanding across WSP globally.', url: 'https://www.linkedin.com/posts/tarekkaraman_wearewsp-wspvisioneers-activity-7295823032579743744-gD2O', thumb: '/media/wsp-microsoft-partnership.jpg' },
    // 2025-02-13
    // Shares the partnership graphic with the card above: this post is the same
    // announcement from WSP's CEO, and its own video cover frame is an unrelated
    // caption about another firm, so it is deliberately not used here.
    { title: 'WSP’s CEO announces the Microsoft partnership', kind: 'video', tag: 'WSP', desc: 'Alexandre L’Heureux, WSP Global CEO, on enabling responsible digital delivery at speed and scale.', url: 'https://www.linkedin.com/feed/update/urn:li:activity:7295792409676828672/', thumb: '/media/wsp-microsoft-partnership.jpg' },
    // 2024-05-29
    { title: 'MAF AI Symposium: leadership transformation first', kind: 'post', tag: 'Majid Al Futtaim', desc: 'Naim Yazbeck of Microsoft on the panel with MAF’s group CEO and IBM, with 150+ MAF leaders in the room.', url: 'https://www.linkedin.com/posts/naim-yazbeck_ai-responsible-ai-ugcPost-7201478910096646144-dDUz', thumb: '/media/maf-ai-symposium.jpg' },
    // 2024-05-29
    { title: 'Scaling GenAI at Majid Al Futtaim', kind: 'post', tag: 'Majid Al Futtaim', desc: 'Francesco Brenna, VP at IBM Consulting, on the MAF–IBM–Microsoft partnership and mitigating ethical risk.', url: 'https://www.linkedin.com/posts/francesco-brenna_ai-responsible-ai-ugcPost-7201529262611251200-PI-k', thumb: '/media/maf-genai-panel.jpg' },
    // 2024-03-25
    { title: 'MAFGPT: a retrieval-augmented legal knowledge base', kind: 'post', tag: 'Majid Al Futtaim', desc: 'Mohamed Tolba on the RAG system built on MAFGPT for document review, contract analysis and legal research.', url: 'https://www.linkedin.com/posts/mohamed-tolba-47b99745_ai-innovation-mafgpt-activity-7177914278081871872-LBV0', thumb: '/media/mafgpt-rag-legal.jpg' },
    // 2024-03-18
    { title: 'The GenAI Centre of Excellence, recognised', kind: 'post', tag: 'Majid Al Futtaim', desc: 'Tarek on the team’s award: among the first in MENA to roll out Microsoft Copilot, and MAFGPT built in-house.', url: 'https://www.linkedin.com/posts/tarekkaraman_greatmoments-bold-passionate-activity-7175540926214193155-RvsX', thumb: '/media/maf-genai-coe-award.jpg' },
    // 2023-11-13
    { title: 'Microsoft × MAF innovation hub', kind: 'post', tag: 'Majid Al Futtaim', desc: 'Campaign Middle East on the partnership driving retail, real estate and entertainment with Azure analytics and AI.', url: 'https://www.linkedin.com/posts/mohamed-tolba-47b99745_microsoft-and-majid-al-futtaim-set-to-drive-activity-7129719696295161857-N_nO', thumb: '/media/maf-microsoft-hub.png' },
    // 2023-11-08 — clip hosted locally so it plays inline on the page
    { title: 'Leading the Copilot & OpenAI 100 rollout', kind: 'video', tag: 'Majid Al Futtaim', desc: 'Tarek on leading the Microsoft Copilot and OpenAI 100 initiative across Majid Al Futtaim.', url: 'https://www.linkedin.com/posts/tarekkaraman_data-ai-activity-7128092402476589056-j7KM', thumb: '/media/maf-copilot-openai100.jpg', video: '/media/maf-copilot-openai100.mp4' }
  ],

  linkedinPulse: {
    followers: 4370,
    connections: '500+',
    intro: 'What Tarek pays attention to and amplifies on LinkedIn, shown with the actual post text. Tap a card to read it in full or open the post.',
    visibleCount: 4, // cards shown before "Show all"
    engagement: [
      { type: 'commented', theme: 'AI thought leadership', actor: 'Saeed Al Falasi', re: 'On a post asking whether framing a product as “too dangerous to use” is itself a launch strategy', text: 'It’s a fascinating intersection of ethics, psychology, and market strategy. Framing a technology as “too dangerous” taps into something primal: curiosity mixed with caution. Human history is full of examples where scarcity, secrecy, or perceived threat amplified demand, from forbidden books to classified inventions. When OpenAI withheld GPT-2 in 2019, it reframed the entire AI narrative from “what can this do?” to “what should we allow this to do?” That shift moves the conversation from pure capability to societal responsibility.', when: '2w', url: 'https://www.linkedin.com/feed/update/urn:li:activity:7360049185531801601/' },
      { type: 'liked', theme: 'AI thought leadership', actor: 'WSP Middle East', text: 'The future of AI in geotechnical engineering isn’t about having more data, it’s about making better decisions. At the MENA Geospatial Forum, Rodrigo E. Betanzo, Associate, Ground Engineering, joined a panel discussion on the growing role of AI and GeoAI in decision-making.', when: '2w', url: 'https://www.linkedin.com/feed/update/urn:li:activity:7481413797270786048/' },
      { type: 'posted', theme: 'Hiring', actor: 'Tarek Karaman', text: 'Hiring: Artificial Intelligence (AI) Business Partner, Shared Services, WSP Dubai (Hybrid).', when: '2mo', impressions: 4715, url: 'https://www.linkedin.com/feed/update/urn:li:activity:7463535335600226304/' },
      { type: 'reshared', theme: 'Team building', actor: 'Rob Davies · WSP', text: 'An exciting and unique opportunity to drive innovation at the intersection of AI and business strategy. Join us! #wearewsp', when: '2mo', url: 'https://www.linkedin.com/feed/update/urn:li:activity:7463534692265492480/' },
      { type: 'liked', theme: 'WSP leadership', actor: 'Kathleen McGrail · MD Advisory, WSP', text: 'The projects our clients are tackling today are increasingly connected, complex, and consequential. Achieving success goes beyond technical excellence; it requires a comprehensive understanding of the bigger picture, balancing strategic, commercial, environmental, organizational, and digital considerations to make informed decisions. Our Global Advisory teams play a crucial role in this.', when: '1w', url: 'https://www.linkedin.com/feed/update/urn:li:activity:7483605934569709568/' },
      { type: 'liked', theme: 'AI thought leadership', actor: 'Jahanzaib Ansari · CEO, Knockri', text: 'Last week, I returned to Jeddah, Saudi Arabia, after nearly 20 years, the city that shaped some of my earliest childhood memories. To return all these years later, not just as an adult but as a tech leader on a business delegation alongside Prime Minister Mark Carney’s visit to the Kingdom, was a beautiful and surreal experience.', when: '1w', url: 'https://www.linkedin.com/feed/update/urn:li:activity:7485292258112532482/' },
      { type: 'reshared', theme: 'Team building', actor: 'Dr. Estefania Tapias · WSP', text: 'Our Smart & Digital (P&B) team is growing! Latest openings include: Graduate, Artificial Intelligence (Emirati National) in Dubai; and Full-Stack Developer, Artificial Intelligence Expert, and UI/UX & Motion Designer across the India Middle East team.', when: '5mo', url: 'https://www.linkedin.com/feed/update/urn:li:activity:7430274927972339713/' },
      { type: 'liked', theme: 'MAF network', actor: 'Andre Melo · Majid Al Futtaim', text: 'A first look at Chef’s Society at City Centre Mirdif. Step into Chef Society, where exceptional chefs, celebrated restaurants, and unforgettable flavours come together under one roof, now open at City Centre Mirdif.', when: '1w', url: 'https://www.linkedin.com/feed/update/urn:li:activity:7483605580000083968/' },
      { type: 'commented', theme: 'Congratulating peers', actor: 'Rob Davies · WSP', re: 'On Rob’s move to Managing Director, Property & Buildings, Hong Kong & Mainland China', text: 'Congrats Rob, wishing you all the best!', when: '2mo', url: 'https://www.linkedin.com/feed/update/urn:li:activity:7391757592148086784/' },
      { type: 'commented', theme: 'Congratulating peers', actor: 'Omar Othman', re: 'On Omar becoming CEO at SABCO Media', text: 'Congrats Omar! 🎉', when: '1mo', url: 'https://www.linkedin.com/feed/update/urn:li:activity:7315022063591694337/' }
    ],
    note: 'Actively growing the Middle East AI engineering and business-partner team at WSP.'
  },

  education: [
    { title: 'BA (Hons)', place: 'Middlesex University, London' },
    { title: 'Audio Media Engineering Diploma', place: 'SAE Institute, London' },
    { title: 'A-Levels & GCSEs', place: 'Sociology, Business Studies and IT at A-Level; 10 GCSEs including Mathematics and English' }
  ],

  interests: [
    'Builds, doesn\'t just sponsor: this site was engineered end-to-end with AI under his direction. Proof of concept, not a slide deck.',
    'Founds things that didn\'t exist: a digital music-publishing platform in 2006, enterprise AI accelerators today. Same instinct, different decade.',
    'Trains the next generation: founded WSP\'s AI Academy and put hundreds of professionals through it. The teams he leaves behind are the real legacy.'
  ],

  // Framing for the key-gated area.
  deeperDive: {
    title: 'Deeper Dive',
    intro: 'A little more than the public page. If I’ve shared a key with you (a recruiter, a board, a prospective partner), this opens the full CV detail, selected case studies, a portfolio and private media. Everything is encrypted with AES-256; nothing here ships in plain text.',
    cta: 'Have a key?',
    referencesTitle: 'References',
    referencesIntro: 'My references are available here, behind a further password. If you’d like access, just ask me and I’ll share the second key.'
  }
};
