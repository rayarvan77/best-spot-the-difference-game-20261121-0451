// Harbour Lights — the entry program (Node 22, standard library only).
//
// The game itself is plain static files under game/: an index.html page and
// a few ES modules that draw the pictures on a canvas, with no build step and
// no network request. This program hands that game in: it copies game/ and
// screenshots/ into the output directory and writes the dossier.json the
// judge reads, using the vendored make.fun library (vendor/makefun-game.ts,
// copied from the kit unchanged).
//
// Run it locally with MAKEFUN_OUTPUT_DIR set, e.g.:
//   MAKEFUN_OUTPUT_DIR=out node main.ts
// The grader runs it with /output as the destination instead.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The caps the scorer itself uses (from the bounty's gate): only
// text_max_bytes shapes the dossier's bytes; the rest refuse an entry the
// scorer would refuse — more than 4 screenshots, one over 256 KiB, or a
// game/ tree past 993 entries / 48 MiB / a 1000-byte path.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

writeFileSync(join(out, 'dossier.json'), buildDossier(out, CAPS));
console.log(`Harbour Lights handed in to ${out}`);

// A quick local sanity check the grader does not need, but a builder does:
// the dossier the scorer rebuilds from the same files must match this one
// byte for byte, because buildDossier is deterministic. Rebuilding it here
// and comparing would only repeat the same call, so the real check is to run
// this program twice into two folders and diff the two dossier.json files.

