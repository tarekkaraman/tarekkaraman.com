// Hidden terminal — the easter egg for the engineers on the hiring panel.
// Reachable via ⌘K → "terminal", or typing "tk!" anywhere on the page.

import { profile } from './data/profile.js';

const $ = (s) => document.querySelector(s);

const FILES = {
  'about.txt': profile.about,
  'experience.log': profile.experience
    .map((x) => `[${x.period}] ${x.company} — ${x.role}\n  ${x.bullets.join('\n  ')}`)
    .join('\n\n'),
  'skills.yaml': profile.skills.map((s) => `- ${s}`).join('\n'),
  'contact.vcf': `EMAIL: ${profile.email}\nLINKEDIN: ${profile.linkedin}\nPHONE: ${profile.phone}\nLOCATION: ${profile.location}`,
  'vault.enc': '�AES-256-GCM�… nice try. Access keys are issued by Tarek in person.'
};

const HELP = `Available commands:
  help          this menu
  ls            list files
  cat <file>    print a file (try: cat experience.log)
  whoami        who is tarek?
  stats         the numbers
  sudo hire     escalate privileges
  exit          close terminal`;

function run(cmd) {
  const [c, ...args] = cmd.trim().split(/\s+/);
  const arg = args.join(' ');
  switch (c) {
    case '': return '';
    case 'help': return HELP;
    case 'ls': return Object.keys(FILES).join('\n');
    case 'cat': return FILES[arg] || `cat: ${arg || '<file>'}: No such file`;
    case 'whoami': return `${profile.name} — ${profile.headline}\n${profile.role}\nTarget: ${profile.targetRoles}`;
    case 'stats': return profile.stats.map((s) => `${(s.prefix || '') + s.value.toLocaleString('en-US') + (s.suffix || '')}  ${s.label}`).join('\n');
    case 'sudo': return arg === 'hire'
      ? `[sudo] password for recruiter: ********\nPrivileges granted. Next step: ${profile.email}`
      : `sudo: ${arg}: command not found`;
    case 'clear': $('#terminal-body').textContent = ''; return null;
    case 'exit': closeTerminal(); return null;
    default: return `zsh: command not found: ${c} — type 'help'`;
  }
}

function print(text, isCmd = false) {
  const body = $('#terminal-body');
  const line = document.createElement('div');
  if (isCmd) line.innerHTML = `<span class="cmd">tk ❯ ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`;
  else line.textContent = text;
  body.append(line);
  body.scrollTop = body.scrollHeight;
}

export function openTerminal() {
  const ov = $('#terminal-overlay');
  if (!ov.hidden) return;
  ov.hidden = false;
  const body = $('#terminal-body');
  if (!body.textContent) {
    print(`Last login: 25 years of shipping — welcome to the hidden layer.`);
    print(`You found it. Type 'help' to explore Tarek's career the engineer's way.`);
  }
  $('#terminal-input').focus();
}

export function closeTerminal() { $('#terminal-overlay').hidden = true; }

export function initTerminal() {
  $('#terminal-close').addEventListener('click', closeTerminal);
  $('#terminal-overlay').addEventListener('click', (e) => { if (e.target === $('#terminal-overlay')) closeTerminal(); });
  $('#terminal-input').addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeTerminal();
    if (e.key !== 'Enter') return;
    const cmd = e.target.value;
    e.target.value = '';
    print(cmd, true);
    const out = run(cmd);
    if (out) print(out);
  });
}
