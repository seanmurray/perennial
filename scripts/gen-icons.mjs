// Generate the PWA icon set from the Perennial brand artwork.
//
//   brand/app-icon-1024.png  → icon-192.png, icon-512.png,
//                                     apple-touch-icon.png
//   brand/favicon-64.png     → favicon.png (already tuned for tiny sizes)
//
// Run via `npm run gen-icons`.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, '..', 'public');
const BRAND = path.resolve(__dirname, '..', 'brand'); // build sources, not shipped

const SOURCE = path.join(BRAND, 'app-icon-1024.png');

const TARGETS = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

const src = await readFile(SOURCE);
for (const { name, size } of TARGETS) {
  const buf = await sharp(src).resize(size, size, { fit: 'cover' }).png({ compressionLevel: 9, palette: true, quality: 92, effort: 10 }).toBuffer();
  await writeFile(path.join(PUBLIC, name), buf);
  console.log(`wrote public/${name} (${size}×${size})`);
}

// The 64px mark is drawn for legibility at favicon scale — use it as-is.
const fav = await readFile(path.join(BRAND, 'favicon-64.png'));
await writeFile(path.join(PUBLIC, 'favicon.png'), fav);
console.log('wrote public/favicon.png (64×64, from the tuned small mark)');

// Wordmark for the in-app header, trimmed to the lettering so the lockup can
// be sized precisely (the source carries generous even margins for centering).
// It keeps its cream background, which is exactly --bg, so it sits flush.
const wm = await sharp(path.join(BRAND, 'wordmark.png'))
  .trim({ background: '#faf3ec', threshold: 12 })
  .png({ compressionLevel: 9, palette: true, quality: 92, effort: 10 })
  .toBuffer();
const wmMeta = await sharp(wm).metadata();
await writeFile(path.join(PUBLIC, 'wordmark.png'), wm);
console.log(`wrote public/wordmark.png (${wmMeta.width}×${wmMeta.height}, trimmed)`);
