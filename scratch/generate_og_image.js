const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createOgImage() {
  const width = 1200;
  const height = 630;

  // Resize white logo to 260px height
  const logoWhiteBuffer = await sharp('public/images/logo-white.png')
    .resize({ height: 260 })
    .toBuffer();

  const logoMetadata = await sharp(logoWhiteBuffer).metadata();
  const logoWidth = logoMetadata.width;
  const logoHeight = logoMetadata.height;

  // We want the logo centered at Y: 80 to 340 (height 260)
  const logoLeft = Math.round((width - logoWidth) / 2);
  const logoTop = 100;

  // Text SVG
  const textSvg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ambient" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="#222222" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#050505" stop-opacity="1"/>
        </radialGradient>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#333333" stop-opacity="0"/>
          <stop offset="50%" stop-color="#666666" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#333333" stop-opacity="0"/>
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="#050505"/>
      <rect width="${width}" height="${height}" fill="url(#ambient)"/>

      <!-- Architectural Grid Lines & Border -->
      <rect x="40" y="40" width="${width - 80}" height="${height - 80}" fill="none" stroke="#222222" stroke-width="1"/>
      <rect x="44" y="44" width="${width - 88}" height="${height - 88}" fill="none" stroke="#161616" stroke-width="1"/>

      <!-- Corner Crosshairs -->
      <path d="M 32 40 L 48 40 M 40 32 L 40 48" stroke="#555555" stroke-width="1"/>
      <path d="M ${width - 48} 40 L ${width - 32} 40 M ${width - 40} 32 L ${width - 40} 48" stroke="#555555" stroke-width="1"/>
      <path d="M 32 ${height - 40} L 48 ${height - 40} M 40 ${height - 48} L 40 ${height - 32}" stroke="#555555" stroke-width="1"/>
      <path d="M ${width - 48} ${height - 40} L ${width - 32} ${height - 40} M ${width - 40} ${height - 48} L ${width - 40} ${height - 32}" stroke="#555555" stroke-width="1"/>

      <!-- Corner Metadata Badges -->
      <text x="60" y="72" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Montserrat, sans-serif" font-weight="700" font-size="11" letter-spacing="3" fill="#666666">DIMENSION STREET // ARCHIVE</text>
      <text x="${width - 60}" y="72" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Montserrat, sans-serif" font-weight="700" font-size="11" letter-spacing="3" fill="#666666">DHAKA // TOKYO // WORLDWIDE</text>

      <!-- Divider line -->
      <line x1="300" y1="410" x2="900" y2="410" stroke="url(#lineGrad)" stroke-width="1"/>

      <!-- Brand Typography Below Cube -->
      <text x="${width / 2}" y="475" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Montserrat, sans-serif" font-weight="900" font-size="46" letter-spacing="10" fill="#ffffff">DIMENSION STREET</text>
      <text x="${width / 2}" y="525" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Montserrat, sans-serif" font-weight="600" font-size="15" letter-spacing="5" fill="#a0a0a0">PREMIUM ARCHITECTURAL HEAVYWEIGHT STREETWEAR</text>

      <!-- Bottom Tag -->
      <text x="60" y="${height - 62}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Montserrat, sans-serif" font-weight="600" font-size="10" letter-spacing="2" fill="#555555">DIMENSIONSTREET.COM</text>
      <text x="${width - 60}" y="${height - 62}" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Montserrat, sans-serif" font-weight="600" font-size="10" letter-spacing="2" fill="#555555">320-480 GSM CRAFT</text>
    </svg>
  `;

  const textBuffer = Buffer.from(textSvg);

  const finalImage = await sharp(textBuffer)
    .composite([
      {
        input: logoWhiteBuffer,
        top: logoTop,
        left: logoLeft,
      },
    ])
    .png({ quality: 95 })
    .toBuffer();

  // Save to multiple canonical locations
  fs.writeFileSync('public/images/og-dimension-street.png', finalImage);
  fs.writeFileSync('public/images/og-brand-logo.png', finalImage);
  fs.writeFileSync('app/opengraph-image.png', finalImage);

  console.log('Successfully generated og-dimension-street.png, og-brand-logo.png, and app/opengraph-image.png!');
}

createOgImage().catch(console.error);
