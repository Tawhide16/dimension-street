const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const whiteSrc = 'C:/Users/Betopia/.gemini/antigravity-ide/brain/fa611402-35db-4d7c-be67-2fc3415673ca/.user_uploaded/media_1790835887712.png';
const blackSrc = 'C:/Users/Betopia/.gemini/antigravity-ide/brain/fa611402-35db-4d7c-be67-2fc3415673ca/.user_uploaded/media_1790835497481.png';

async function generateFavicon() {
  if (!fs.existsSync(whiteSrc)) {
    console.error('Source image not found:', whiteSrc);
    process.exit(1);
  }

  // 1. Trim the new white logo for favicon
  const whiteTrimmed = await sharp(whiteSrc).trim().toBuffer();

  // Save white logo asset for dark surfaces
  await sharp(whiteTrimmed).toFile(path.join(__dirname, '../public/images/logo-white.png'));
  console.log('✓ Saved public/images/logo-white.png');

  // Keep black logo for light storefront header
  if (fs.existsSync(blackSrc)) {
    const blackTrimmed = await sharp(blackSrc).trim().toBuffer();
    await sharp(blackTrimmed).toFile(path.join(__dirname, '../public/images/logo.png'));
    console.log('✓ Maintained public/images/logo.png for white header');
  }

  // 2. Next.js App Router icon from the white logo (app/icon.png - 192x192)
  const icon192 = await sharp(whiteTrimmed)
    .resize(164, 164, { fit: 'inside' })
    .toBuffer();

  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{ input: icon192, gravity: 'center' }])
  .png()
  .toFile(path.join(__dirname, '../app/icon.png'));
  console.log('✓ Created app/icon.png (192x192)');

  // 4. Apple Touch Icon (app/apple-icon.png - 180x180)
  const apple180 = await sharp(whiteTrimmed)
    .resize(150, 150, { fit: 'inside' })
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 20, g: 20, b: 20, alpha: 1 }
    }
  })
  .composite([{ input: apple180, gravity: 'center' }])
  .png()
  .toFile(path.join(__dirname, '../app/apple-icon.png'));
  console.log('✓ Created app/apple-icon.png');

  // 5. Favicon ICO (48x48)
  const ico48 = await sharp(whiteTrimmed)
    .resize(48, 48, { fit: 'inside' })
    .toBuffer();

  const square48 = await sharp({
    create: {
      width: 48,
      height: 48,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{ input: ico48, gravity: 'center' }])
  .png()
  .toBuffer();

  fs.writeFileSync(path.join(__dirname, '../app/favicon.ico'), square48);
  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), square48);
  console.log('✓ Updated app/favicon.ico and public/favicon.ico');

  // 6. Favicon 32x32 PNG
  const fav32 = await sharp(whiteTrimmed)
    .resize(28, 28, { fit: 'inside' })
    .toBuffer();

  await sharp({
    create: {
      width: 32,
      height: 32,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{ input: fav32, gravity: 'center' }])
  .png()
  .toFile(path.join(__dirname, '../public/favicon-32x32.png'));
  console.log('✓ Created public/favicon-32x32.png');
}

generateFavicon().catch(err => {
  console.error('Error generating favicon:', err);
  process.exit(1);
});
