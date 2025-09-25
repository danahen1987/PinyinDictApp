#!/usr/bin/env node

// Logo Preparation Helper
// This script helps you prepare your logo for the app

const fs = require('fs');
const path = require('path');

console.log('🎨 PinYinDict Logo Preparation Helper');
console.log('=====================================');
console.log('');

// Check for common image files
const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg'];
const foundImages = [];

console.log('🔍 Looking for image files in the project directory...');
console.log('');

// Check current directory
const files = fs.readdirSync('.');
files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if (imageExtensions.includes(ext)) {
        foundImages.push(file);
        console.log(`✅ Found: ${file}`);
    }
});

if (foundImages.length === 0) {
    console.log('❌ No image files found in the project directory.');
    console.log('');
    console.log('📋 To add your logo:');
    console.log('1. Save your logo image to this directory');
    console.log('2. Name it "app-logo.png" (recommended)');
    console.log('3. Make sure it\'s at least 512x512 pixels');
    console.log('4. Run this script again');
    console.log('');
    console.log('💡 Supported formats: PNG, JPG, JPEG, GIF, BMP, SVG');
} else {
    console.log('');
    console.log('🎯 Found image files! Here\'s what to do:');
    console.log('');
    
    foundImages.forEach(image => {
        console.log(`📁 File: ${image}`);
        
        // Check if it's already named correctly
        if (image.toLowerCase() === 'app-logo.png') {
            console.log('   ✅ Perfect! This is already named correctly.');
        } else {
            console.log(`   🔄 Rename to: app-logo.png`);
            console.log(`   Command: mv "${image}" app-logo.png`);
        }
        
        // Check file size
        const stats = fs.statSync(image);
        const sizeKB = Math.round(stats.size / 1024);
        console.log(`   📊 Size: ${sizeKB} KB`);
        
        if (sizeKB > 1000) {
            console.log('   ⚠️  Large file - consider compressing for web use');
        }
        
        console.log('');
    });
    
    console.log('🚀 Next steps:');
    console.log('1. Make sure your logo is named "app-logo.png"');
    console.log('2. Run: ./setup-app-logo.sh');
    console.log('3. This will automatically:');
    console.log('   - Create multiple sizes for Android');
    console.log('   - Update the download page');
    console.log('   - Update the README');
    console.log('   - Build a new APK with your logo');
}

console.log('');
console.log('📐 Logo Requirements:');
console.log('- Format: PNG (recommended) or JPG');
console.log('- Size: 512x512 pixels minimum');
console.log('- Style: Square format works best');
console.log('- Background: Transparent or solid color');
console.log('- Quality: High resolution for crisp display');
console.log('');
console.log('🎨 Logo Design Tips:');
console.log('- Keep it simple - works well at small sizes');
console.log('- Use high contrast colors');
console.log('- Avoid fine details that disappear when small');
console.log('- Consider your app\'s color scheme');
console.log('- Make it memorable and professional');
console.log('');
console.log('🛠️  Tools for logo creation/editing:');
console.log('- Online: Canva, Figma, Adobe Express');
console.log('- Desktop: GIMP (free), Photoshop, Illustrator');
console.log('- Mobile: Logo Maker apps');
console.log('');
console.log('🎉 Ready to make your app look professional!');
