// ─────────────────────────────────────────────────────────────
// Single source of truth for everything the site (and the AI
// concierge) knows about Tarek. Edit here, everything updates.
// Confidential detail does NOT live here — see private/vault-content.json
// (encrypted at build time into public/vault.enc.json).
// ─────────────────────────────────────────────────────────────

export const profile = {
  name: 'Tarek Karaman',
  headline: 'AI & Digital Transformation Leader',
  role: 'Head of Artificial Intelligence, WSP Middle East',
  targetRoles: 'CTO · Chief AI Officer · Chief Digital Officer',
  location: 'Dubai, United Arab Emirates',
  email: 'tarekkaraman@me.com',
  phone: '+971 55 270 4406',
  linkedin: 'https://www.linkedin.com/in/tarekkaraman',
  status: ['British National', 'UAE Resident — Dubai based', 'English — Fluent'],

  about: `AI & Digital Transformation Leader with 25+ years delivering enterprise-scale innovation across government, infrastructure, and Fortune 500 sectors. Specialist in Generative AI, enterprise AI tooling, digital transformation, and governance — with a proven record of building AI Accelerators, establishing Centres of Excellence, and embedding adoption frameworks that deliver measurable business outcomes. Adept at partnering with C-suite executives and global technology leaders to build AI capability from the ground up — from strategy and governance through to delivery and adoption at scale.`,

  stats: [
    { value: 25, suffix: '+', label: 'Years experience' },
    { value: 8, suffix: '+', label: 'Enterprise AI tools shipped' },
    { value: 60000, suffix: '+', label: 'Users enabled on AI' },
    { value: 20, prefix: '$', suffix: 'M+', label: 'Programs delivered' }
  ],

  linkedinPulse: {
    followers: 4370,
    connections: '500+',
    highlights: [
      { when: '2w', text: 'Hiring: AI-First Graphic Designer & Multimedia Specialist — WSP, Riyadh', impressions: 2334 },
      { when: '2mo', text: 'Hiring: AI Business Partner, Property & Buildings — WSP, Dubai', impressions: 2862 },
      { when: '2mo', text: 'Hiring: AI Business Partner, Shared Services — WSP, Dubai', impressions: 4715 }
    ],
    note: 'Actively growing the Middle East AI engineering & business-partner team at WSP.'
  },

  experience: [
    {
      company: 'WSP',
      role: 'Artificial Intelligence & Innovation Leader',
      period: '2024 – Present',
      location: 'Dubai, UAE · Global & Middle East / Africa',
      locked: true, // full detail lives in the vault
      summary: 'Regional and global AI leader — owning AI strategy and the delivery organisation across the Middle East & Africa while contributing to global enterprise AI delivery. Built the region’s AI capability from the ground up.',
      bullets: [
        'Established the AI Accelerator and a dedicated AI engineering delivery centre',
        'Deployed 8+ enterprise AI tools within six months across bid, resourcing, insights and planning',
        'Enabled 60,000+ users on Microsoft Copilot across the region and beyond',
        'Directed client AI programs from pilots to multi-year engagements valued at $20M+',
        'Founded the AI Academy; embedded ethical & legal guardrails into every deployment'
      ]
    },
    {
      company: 'Majid Al Futtaim',
      role: 'Technology & Innovation Lead',
      period: '2022 – 2024',
      location: 'Dubai, UAE',
      summary: 'Founded and scaled the Generative AI and RPA Centres of Excellence, positioning MAF as one of the region’s earliest enterprise adopters of generative AI and intelligent automation.',
      bullets: [
        'Launched MAF GPT and spearheaded one of the region’s earliest large-scale Microsoft Copilot deployments',
        'Secured partnerships with Microsoft, IBM, PwC, and Google',
        'Recognised by Microsoft and MAF CEOs; ‘Team of the Year’ for AI-driven transformation',
        'Directed a regional GenAI Symposium with Microsoft, IBM, and Gartner'
      ]
    },
    {
      company: 'Alsayegh Media',
      role: 'Head of Digital & Innovation',
      period: '2018 – 2022',
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
      period: '2016 – 2018',
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
      period: '2014 – 2016',
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
      period: '2002 – 2014',
      location: 'London · Dubai',
      summary: 'Two decades of building: fintech, digital music publishing, VR, higher education and digital media.',
      bullets: [
        'Qlikcash — built a FinTech neo-banking platform and secured investment (2014)',
        'Fortis Panels — delivered digital infrastructure for UAE expansion (2013–14)',
        'Deqoy Music — founded a digital music-publishing platform; 6,000+ licensed tracks, 100+ technical staff (2006–12)',
        'Digital transformation leadership across VR, higher education, and digital media (2002–06)'
      ]
    }
  ],

  awards: [
    'Team of the Year — AI-Driven Transformation, Majid Al Futtaim',
    'Executive Recognition — Microsoft & MAF Group leadership',
    'Regional GenAI Symposium — Featured leader (Microsoft · IBM · Gartner)'
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

  education: [
    { title: 'BA (Hons)', place: 'Middlesex University, London' },
    { title: 'Audio Media Engineering Diploma', place: 'SAE Institute, London' }
  ],

  interests: [
    'Generative AI & emerging technology',
    'Enterprise innovation & R&D',
    'Mentoring & capability building'
  ]
};
