// Development-only image encoding. Original selected editorial masters are committed JPEGs.
// Normal rebuilds derive the WebP variants from those masters; no runtime library ships.
const { resolve } = require('node:path');
const { mkdirSync, existsSync } = require('node:fs');
let sharp;
try { sharp = require('sharp'); }
catch { throw new Error('Make the development-only sharp package available using NODE_PATH.'); }
const root = resolve(__dirname, '..');
const output = resolve(root, 'assets/editorial');
const topics = ['nutrition', 'savings', 'quitting', 'training', 'habits', 'math', 'development'];

(async () => {
  mkdirSync(output, { recursive: true });
  for (const topic of topics) {
    const master = resolve(output, topic + '.jpg');
    // This optional input path is only for first import, never embedded in public HTML.
    if (process.env.MOOCSOFT_EDITORIAL_INPUT_DIR) {
      if (existsSync(master)) throw new Error('Refusing to overwrite an existing editorial master: ' + topic);
      const original = resolve(process.env.MOOCSOFT_EDITORIAL_INPUT_DIR, topic + '.png');
      await sharp(original).rotate().resize(1200, 675, { fit: 'cover' }).jpeg({ quality: 84, mozjpeg: true }).toFile(master);
    }
    const meta = await sharp(master).metadata();
    if (meta.width !== 1200 || meta.height !== 675 || meta.format !== 'jpeg') throw new Error('Expected a 1200×675 JPEG master: ' + topic);
    for (const width of [480, 800, 1200]) {
      await sharp(master).resize(width, width * 9 / 16).webp({ quality: 78, effort: 6 }).toFile(resolve(output, `${topic}-${width}.webp`));
    }
  }
  console.log('Built seven topic editorial photos and 21 responsive WebP variants; no runtime image library.');
})().catch(error => { console.error(error); process.exitCode = 1; });
