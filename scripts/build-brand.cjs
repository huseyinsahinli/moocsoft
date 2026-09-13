// Development-only export: install sharp locally or expose it through NODE_PATH.
// The deployed static site has no package or runtime dependency.
const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const sharp = require('sharp');

async function main() {
  const root = resolve(__dirname, '..');
  const svg = readFileSync(resolve(root, 'assets/brand/favicon.svg'));
  for (const [size, file] of [[96, 'assets/brand/favicon-96.png'], [180, 'apple-touch-icon.png']]) {
    await sharp(svg).resize(size, size).png().toFile(resolve(root, file));
  }
  const sizes = [16, 32, 48];
  const images = await Promise.all(sizes.map(size => sharp(svg).resize(size, size).png().toBuffer()));
  const header = Buffer.alloc(6 + sizes.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  images.forEach((png, index) => {
    const entry = 6 + index * 16;
    header[entry] = sizes[index];
    header[entry + 1] = sizes[index];
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  writeFileSync(resolve(root, 'favicon.ico'), Buffer.concat([header, ...images]));
  console.log('Exported 16/32/48px ICO, 96px PNG and 180px touch icon from the Moocsoft SVG.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
