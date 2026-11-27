// Hearth & Ledger — hand-in program (Node 22, standard library only).
//
// The entry is the static site under app/ plus its screenshots. This program
// assembles the submission bundle: it copies app/ and screenshots/ next to
// this file into the output directory and writes dossier.json there, using
// buildDossier from the vendored make.fun library. The library file is the
// kit's copy and must not be changed — the scorer rebuilds the dossier with
// its own copy and compares the two byte for byte.
//
// Where the bundle goes: /output inside the grader. Anywhere else, the
// MAKEFUN_OUTPUT_DIR environment variable names the directory instead:
//   MAKEFUN_OUTPUT_DIR=out node main.ts
// The program runs twice and must write identical bytes both times, so it
// copies files in a fixed order and writes nothing with a timestamp in it.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

function copyTree(sourceDir, targetDir) {
  rmSync(targetDir, { recursive: true, force: true });
  mkdirSync(targetDir, { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true });
}

function main() {
  // Fail loudly instead of handing in a half-empty bundle.
  for (const needed of ['app', 'screenshots']) {
    if (!existsSync(join(repoRoot, needed))) {
      throw new Error('missing ' + needed + '/ beside main.ts — nothing to hand in');
    }
  }
  mkdirSync(outputDir, { recursive: true });

  // The site itself, exactly as it is served.
  copyTree(join(repoRoot, 'app'), join(outputDir, 'app'));

  // Real browser renders of the site; at least three, at most four.
  copyTree(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));

  // The dossier the judge reads: screenshots, first-load totals and source.
  // These caps mirror the gate so a bundle that passes here passes there.
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

main();
