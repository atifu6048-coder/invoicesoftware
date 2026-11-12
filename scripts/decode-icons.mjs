// Generates the PNG app icons at build time from base64 text files.
//
// Why: the GitHub connection can only push text files, so the binary PNGs
// cannot be committed directly. The icons live here as base64 text
// (public/icon-192.png.b64, public/icon-512.png.b64) and this script
// decodes them into public/icon-192.png / public/icon-512.png before
// Vite builds. The manifest (vite.config.js) points at the PNGs, which
// Android needs for installing the app — SVG-only icons make the
// installed app crash on launch ("keeps stopping") on many phones.
// Uses only Node built-ins; no extra dependency.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');

for (const size of [192, 512]) {
  const b64 = readFileSync(join(publicDir, `icon-${size}.png.b64`), 'utf8').trim();
  writeFileSync(join(publicDir, `icon-${size}.png`), Buffer.from(b64, 'base64'));
  console.log(`decoded icon-${size}.png`);
}
