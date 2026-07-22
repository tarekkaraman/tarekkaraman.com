#!/usr/bin/env node
// Encrypts the private content files into public/*.enc.json:
//   private/vault-content.json      -> public/vault.enc.json       (key: VAULT_PASS / .vault-pass)
//   private/references-content.json -> public/references.enc.json  (key: REFS_PASS  / .refs-pass)
// The references live behind a SECOND, separate password inside the Deeper Dive.
// Passwords are never stored in the repo (.vault-pass / .refs-pass are gitignored).

import { webcrypto as crypto } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ITERATIONS = 310000;
const te = new TextEncoder();
const b64 = (buf) => Buffer.from(buf).toString('base64');

function readPass(envName, file) {
  return process.env[envName] || (existsSync(join(root, file)) ? readFileSync(join(root, file), 'utf8').trim() : null);
}

async function encryptFile(srcRel, outRel, pass, label) {
  if (!existsSync(join(root, srcRel))) { console.log('· skipped %s (no %s)', label, srcRel); return; }
  if (!pass) { console.log('· skipped %s (no password)', label); return; }
  const content = readFileSync(join(root, srcRel), 'utf8');
  JSON.parse(content); // validate
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const baseKey = await crypto.subtle.importKey('raw', te.encode(pass), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    baseKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
  );
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(content));
  writeFileSync(
    join(root, outRel),
    JSON.stringify({ v: 1, algo: 'AES-256-GCM', kdf: 'PBKDF2-SHA256', iterations: ITERATIONS, salt: b64(salt), iv: b64(iv), ciphertext: b64(ciphertext) }, null, 2)
  );
  console.log('✓ %s written (%d bytes ciphertext)', outRel, ciphertext.byteLength);
}

const vaultPass = readPass('VAULT_PASS', '.vault-pass');
const refsPass = readPass('REFS_PASS', '.refs-pass');

if (!vaultPass && !refsPass) {
  console.error('No passwords. Set VAULT_PASS/.vault-pass (and optionally REFS_PASS/.refs-pass).');
  process.exit(1);
}

await encryptFile('private/vault-content.json', 'public/vault.enc.json', vaultPass, 'Deeper Dive');
await encryptFile('private/references-content.json', 'public/references.enc.json', refsPass, 'References');
