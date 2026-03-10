/**
 * One-time script: make white background of weir-here-logo.jpeg transparent
 * and save as weir-here-logo-transparent.png for use in the top banner.
 * Run from repo root: node apps/web/scripts/remove-logo-bg.mjs
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const inputPath = path.join(publicDir, 'weir-here-logo.jpeg');
const outputPath = path.join(publicDir, 'weir-here-logo-transparent.png');

async function main() {
  const { width, height } = await sharp(inputPath).metadata();

  // Mask: 0 where original is white/near-white (transparent), 255 elsewhere (opaque)
  const maskBuffer = await sharp(inputPath)
    .negate()
    .threshold(15) // tune: higher = only pure white removed
    .grayscale()
    .resize(width, height)
    .toBuffer();

  await sharp(inputPath)
    .joinChannel(maskBuffer)
    .png()
    .toFile(outputPath);

  console.log('Saved:', outputPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
