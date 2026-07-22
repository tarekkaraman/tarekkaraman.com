#!/usr/bin/env node
// Encrypts private/vault-content.json → public/vault.enc.json
// Usage:  npm run vault                (uses VAULT_PASS env or .vault-pass file)
//         VAULT_PASS='new-key' npm run vault
// The password itself is never stored in the repo.

import { webcrypto as crypto } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ITERATIONS = 310000;

const pass =
  process.env.VAULT_PASS ||
  (existsSync(join(root, '.vault-pass')) ? readFileSync(join(root, '.vault-pass'), 'utf8').trim() : null);

if (!pass) {
  console.error('No password. Set VAULT_PASS env var or create a .vault-pass file (both are gitignored).');
  process.exit(1);
}

const content = readFileSync(join(root, 'private/vault-content.json'), 'utf8');
JSON.parse(content); // validate

const te = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));

const baseKey = await crypto.subtle.importKey('raw', te.encode(pass), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
  baseKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt']
);
const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(content));

const b64 = (buf) => Buffer.from(buf).toString('base64');
writeFileSync(
  join(root, 'public/vault.enc.json'),
  JSON.stringify({ v: 1, algo: 'AES-256-GCM', kdf: 'PBKDF2-SHA256', iterations: ITERATIONS, salt: b64(salt), iv: b64(iv), ciphertext: b64(ciphertext) }, null, 2)
);
console.log('✓ public/vault.enc.json written (%d bytes ciphertext)', ciphertext.byteLength);
