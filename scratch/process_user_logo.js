const sharp = require('sharp');
const fs = require('fs');

async function processUserLogo() {
  const userLogoPath = 'C:/Users/Betopia/.gemini/antigravity-ide/brain/dc736f00-0daf-4c20-9d60-f2f394dca8cb/.user_uploaded/media_1791195136954.png';

  // 1. Copy original 1024x1024 square image
  const squareBuffer = fs.readFileSync(userLogoPath);
  fs.writeFileSync('public/images/dimension-street-logo.png', squareBuffer);
  fs.writeFileSync('public/images/og-image.png', squareBuffer);

  // 2. Create 1200x630 landscape version for Facebook, Twitter, and standard OG
  // Scale the 1024x1024 logo to 580x580 and place centered in 1200x630 pure #000000 black
  const scaledLogo = await sharp(userLogoPath)
    .resize(580, 580, { fit: 'contain', background: '#000000' })
    .toBuffer();

  const landscapeImage = await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([
      {
        input: scaledLogo,
        top: 25,
        left: Math.round((1200 - 580) / 2), // 310
      },
    ])
    .png({ quality: 100 })
    .toBuffer();

  fs.writeFileSync('public/images/og-dimension-street.png', landscapeImage);
  fs.writeFileSync('public/images/og-brand-logo.png', landscapeImage);
  fs.writeFileSync('app/opengraph-image.png', landscapeImage);
  fs.writeFileSync('app/twitter-image.png', landscapeImage);

  console.log('All logo and OpenGraph images successfully generated from user uploaded logo!');
}

processUserLogo().catch(console.error);
