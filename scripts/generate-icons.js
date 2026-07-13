const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SVG_PATH = path.join(__dirname, '..', 'src', 'app', 'icon.svg');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

async function generateIcons() {
  const svgBuffer = fs.readFileSync(SVG_PATH);

  await sharp(svgBuffer).resize(180, 180).png()
    .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));

  await sharp(svgBuffer).resize(32, 32).png()
    .toFile(path.join(PUBLIC_DIR, 'favicon-32x32.png'));

  await sharp(svgBuffer).resize(16, 16).png()
    .toFile(path.join(PUBLIC_DIR, 'favicon-16x16.png'));

  await sharp(svgBuffer).resize(192, 192).png()
    .toFile(path.join(PUBLIC_DIR, 'android-chrome-192x192.png'));

  await sharp(svgBuffer).resize(512, 512).png()
    .toFile(path.join(PUBLIC_DIR, 'android-chrome-512x512.png'));

  const png16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();

  const ico = createICO([png16, png32]);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), ico);

  console.log('All icons generated!');
}

function createICO(pngBuffers) {
  const count = pngBuffers.length;
  const dirSize = 6 + count * 16;
  let totalOffset = dirSize;

  const entries = [];
  const imageBuffers = [];

  for (let i = 0; i < count; i++) {
    const buf = pngBuffers[i];
    const size = buf.length;
    const w = i === 0 ? 16 : 32;
    const h = i === 0 ? 16 : 32;

    const entry = Buffer.alloc(16);
    entry.writeUInt8(w === 256 ? 0 : w, 0);
    entry.writeUInt8(h === 256 ? 0 : h, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(size, 8);
    entry.writeUInt32LE(totalOffset, 12);

    entries.push(entry);
    imageBuffers.push(buf);
    totalOffset += size;
  }

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  return Buffer.concat([header, ...entries, ...imageBuffers]);
}

generateIcons().catch(console.error);
