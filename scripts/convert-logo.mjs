import sharp from 'sharp';
import { readFileSync } from 'fs';

const svgBuffer = readFileSync('public/logo.svg');

await sharp(svgBuffer)
  .resize(512, 512)
  .png()
  .toFile('public/logo.png');

console.log('✅ Logo converted: public/logo.png');
