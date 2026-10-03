const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const blackLogoPath = 'C:/Users/Betopia/.gemini/antigravity-ide/brain/fa611402-35db-4d7c-be67-2fc3415673ca/.user_uploaded/media_1791000657609.png';
const whiteLogoPath = path.join(__dirname, '../public/images/logo-white.png');
const publicDir = path.join(__dirname, '../public');
const appDir = path.join(__dirname, '../app');

async function generateFavicons() {
  console.log('Generating theme-aware favicons...');

  // 1. Process Black Logo for Light/White Theme
  const blackImg = sharp(blackLogoPath).trim();
  const blackMeta = await blackImg.metadata();
  const maxDimB = Math.max(blackMeta.width, blackMeta.height);

  // Black 32x32
  await sharp(blackLogoPath)
    .trim()
    .resize(maxDimB, maxDimB, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-black-32x32.png'));

  // Black 192x192
  await sharp(blackLogoPath)
    .trim()
    .resize(maxDimB, maxDimB, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'favicon-black-192x192.png'));

  // Black 512x512
  await sharp(blackLogoPath)
    .trim()
    .resize(maxDimB, maxDimB, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'favicon-black.png'));

  // 2. Process White Logo for Dark Theme
  const whiteImg = sharp(whiteLogoPath).trim();
  const whiteMeta = await whiteImg.metadata();
  const maxDimW = Math.max(whiteMeta.width, whiteMeta.height);

  // White 32x32
  await sharp(whiteLogoPath)
    .trim()
    .resize(maxDimW, maxDimW, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-white-32x32.png'));

  // White 192x192
  await sharp(whiteLogoPath)
    .trim()
    .resize(maxDimW, maxDimW, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'favicon-white-192x192.png'));

  // White 512x512
  await sharp(whiteLogoPath)
    .trim()
    .resize(maxDimW, maxDimW, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'favicon-white.png'));

  // Also save default favicon-32x32.png and favicon.ico as black logo for default white theme
  fs.copyFileSync(path.join(publicDir, 'favicon-black-32x32.png'), path.join(publicDir, 'favicon-32x32.png'));
  fs.copyFileSync(path.join(publicDir, 'favicon-black-32x32.png'), path.join(publicDir, 'favicon.ico'));
  fs.copyFileSync(path.join(publicDir, 'favicon-black-192x192.png'), path.join(appDir, 'icon.png'));
  fs.copyFileSync(path.join(publicDir, 'favicon-black-32x32.png'), path.join(appDir, 'favicon.ico'));

  console.log('Favicon PNGs successfully generated in public/ and app/');
}

generateFavicons().catch(console.error);


