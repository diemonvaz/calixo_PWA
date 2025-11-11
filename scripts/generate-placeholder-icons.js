// Script to generate placeholder PWA icons
// Run with: node scripts/generate-placeholder-icons.js

const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG template for the icon (Simple "C" for Calixo)
const createSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#5A8DEE;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#22C55E;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
  <text 
    x="${size / 2}" 
    y="${size * 0.65}" 
    font-size="${size * 0.55}" 
    font-family="system-ui, -apple-system, sans-serif" 
    font-weight="bold" 
    text-anchor="middle" 
    fill="#F5F0E8"
    style="letter-spacing: -0.02em;">C</text>
  <circle cx="${size * 0.75}" cy="${size * 0.25}" r="${size * 0.05}" fill="#22C55E"/>
</svg>`.trim();

// Create output directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Generating placeholder PWA icons...\n');

// Try to use sharp if available, otherwise create SVG files
try {
  const sharp = require('sharp');
  
  async function generateIcons() {
    for (const size of sizes) {
      const svg = createSVG(size);
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      
      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated icon-${size}x${size}.png`);
    }
    
    console.log('\n🎉 All placeholder icons generated successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Icons are in public/icons/');
    console.log('   2. Replace with custom icons when ready');
    console.log('   3. See docs/setup/PWA_ICONS_GUIDE.md for details\n');
  }
  
  generateIcons().catch(err => {
    console.error('Error generating icons:', err);
    process.exit(1);
  });
  
} catch (err) {
  console.warn('⚠️  Sharp not installed. Creating SVG files instead...\n');
  console.log('💡 To generate PNG files, install sharp:');
  console.log('   npm install sharp --save-dev\n');
  
  // Create SVG files as fallback
  for (const size of sizes) {
    const svg = createSVG(size);
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
    fs.writeFileSync(outputPath, svg);
    console.log(`✅ Generated icon-${size}x${size}.svg`);
  }
  
  console.log('\n⚠️  Note: PWA requires PNG icons, not SVG.');
  console.log('   Install sharp and re-run this script to generate PNG files.\n');
}

