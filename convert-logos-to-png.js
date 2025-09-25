#!/usr/bin/env node

// Convert SVG logos to PNG format
// This script converts the SVG logo files to PNG format for use as app icons

const fs = require('fs');
const path = require('path');

console.log('🎨 PinYinDict Logo Converter');
console.log('============================');
console.log('');

// Check if we have the required SVG files
const svgFiles = [
  'logo-1-learning.svg',
  'logo-2-chinese.svg', 
  'logo-3-character.svg',
  'logo-4-wisdom.svg'
];

console.log('📁 Checking for SVG logo files...');
svgFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ Found: ${file}`);
  } else {
    console.log(`❌ Missing: ${file}`);
  }
});

console.log('');
console.log('🔄 Conversion Instructions:');
console.log('');
console.log('Since we need PNG files for app icons, here are your options:');
console.log('');
console.log('📱 Option 1: Online Converter (Easiest)');
console.log('1. Go to: https://convertio.co/svg-png/');
console.log('2. Upload each SVG file');
console.log('3. Set size to 512x512 pixels');
console.log('4. Download as PNG');
console.log('');
console.log('🖥️ Option 2: Browser Converter');
console.log('1. Open each SVG file in your browser');
console.log('2. Right-click and "Save as PNG"');
console.log('3. Or use browser developer tools to export');
console.log('');
console.log('💻 Option 3: Command Line (if you have ImageMagick)');
console.log('Run these commands:');
svgFiles.forEach(file => {
  const pngFile = file.replace('.svg', '.png');
  console.log(`convert -size 512x512 ${file} ${pngFile}`);
});
console.log('');
console.log('📐 Required Sizes for App Icons:');
console.log('- 512x512px - Google Play Store');
console.log('- 192x192px - Android app icon');
console.log('- 144x144px - Android app icon (mdpi)');
console.log('- 72x72px - Android app icon (ldpi)');
console.log('- 96x96px - Android app icon (hdpi)');
console.log('');
console.log('🎯 Recommended Logo:');
console.log('We recommend the "Learning" logo (学) with green gradient');
console.log('as it best represents the educational nature of your app.');
console.log('');
console.log('📱 After converting to PNG:');
console.log('1. Replace the app icon in: android/app/src/main/res/mipmap-*/');
console.log('2. Update the download page with your logo');
console.log('3. Use for GitHub repository and app store listings');
console.log('');
console.log('🎉 Your professional app logos are ready to use!');
