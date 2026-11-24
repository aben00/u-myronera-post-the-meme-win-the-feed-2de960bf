// SPDX-License-Identifier: MIT
// Post the Meme, Win the Feed — make.fun entry (Node 22, standard library only).
//
// The entry is the X post itself: a meme picture about make.fun, posted from a
// public X account with @_myronera tagged and a make.fun play code in its text.
// POST.json at the repository root names that post. All this program has to do
// is copy POST.json into /output, where the house's gate reads it. Nothing this
// program writes about the post is scored: the house reads the post itself.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand
// in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// An X post address: https://x.com/<handle>/status/<digits> (twitter.com and
// www./mobile. prefixes pass too, and so does /i/web/status/<digits>). The gate
// refuses anything else, so fail here instead of shipping a bad POST.json.
const POST_URL =
  /^(?:https?:\/\/)?(?:www\.|mobile\.)?(?:x\.com|twitter\.com)\/(?:i\/web\/status\/|[A-Za-z0-9_]+\/status\/)\d+\/?(?:[?#].*)?$/;

const source = join(BOT_DIR, 'POST.json');
const parsed: unknown = JSON.parse(readFileSync(source, 'utf8'));
if (
  typeof parsed !== 'object' ||
  parsed === null ||
  typeof (parsed as { url?: unknown }).url !== 'string' ||
  !POST_URL.test((parsed as { url: string }).url)
) {
  console.error('POST.json must be {"url": "https://x.com/<handle>/status/<id>"}');
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(source, join(OUTPUT_DIR, 'POST.json'));

// Read back what was written and verify it is byte-for-byte the file we
// validated, so a partial or altered copy can never reach the gate silently.
const written = readFileSync(join(OUTPUT_DIR, 'POST.json'));
const original = readFileSync(source);
if (!written.equals(original)) {
  console.error('POST.json copy does not match the source byte-for-byte');
  process.exit(1);
}
