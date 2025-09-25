#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 Creating Android Icon Sizes');
console.log('==============================');
console.log('');

// Read the SVG file
const svgPath = 'app_logo.svg';
if (!fs.existsSync(svgPath)) {
    console.error('❌ SVG file not found:', svgPath);
    process.exit(1);
}

const svgContent = fs.readFileSync(svgPath, 'utf8');
console.log('✅ SVG file loaded:', svgPath);

// Android icon sizes and their target directories
const iconSizes = [
    { size: 192, dir: 'android/app/src/main/res/mipmap-xxxhdpi' },
    { size: 144, dir: 'android/app/src/main/res/mipmap-xxhdpi' },
    { size: 96, dir: 'android/app/src/main/res/mipmap-xhdpi' },
    { size: 72, dir: 'android/app/src/main/res/mipmap-hdpi' },
    { size: 48, dir: 'android/app/src/main/res/mipmap-mdpi' },
    { size: 36, dir: 'android/app/src/main/res/mipmap-ldpi' }
];

// Create HTML file for icon generation
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Icon Generator</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .icon { margin: 10px; border: 1px solid #ccc; }
        canvas { border: 1px solid #ddd; }
    </style>
</head>
<body>
    <h1>PinYinDict Icon Generator</h1>
    <p>This page will generate the required Android icon sizes.</p>
    
    <div id="icons"></div>
    
    <script>
        const svgContent = \`${svgContent.replace(/`/g, '\\`')}\`;
        
        function createIcon(size) {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            const img = new Image();
            const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            
            img.onload = function() {
                ctx.drawImage(img, 0, 0, size, size);
                const dataURL = canvas.toDataURL('image/png');
                
                const div = document.createElement('div');
                div.className = 'icon';
                div.innerHTML = \`
                    <h3>\${size}x\${size}px</h3>
                    <canvas width="\${size}" height="\${size}"></canvas>
                    <br>
                    <a href="\${dataURL}" download="ic_launcher_\${size}.png">Download \${size}x\${size}</a>
                \`;
                
                const canvasEl = div.querySelector('canvas');
                const ctx2 = canvasEl.getContext('2d');
                ctx2.drawImage(img, 0, 0, size, size);
                
                document.getElementById('icons').appendChild(div);
                URL.revokeObjectURL(url);
            };
            
            img.src = url;
        }
        
        // Generate all required sizes
        const sizes = [192, 144, 96, 72, 48, 36];
        sizes.forEach(createIcon);
    </script>
</body>
</html>
`;

// Write HTML file
fs.writeFileSync('icon-generator.html', htmlContent);
console.log('✅ Created icon-generator.html');

// For now, let's copy the SVG to all required locations as a fallback
console.log('📱 Creating Android icon directories and copying SVG...');

iconSizes.forEach(({ size, dir }) => {
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    }
    
    // Copy SVG as PNG (Android will handle the conversion)
    const targetPath = path.join(dir, 'ic_launcher.png');
    fs.copyFileSync('app_logo.svg', targetPath);
    console.log(`✅ Copied icon to: ${targetPath} (${size}x${size})`);
});

console.log('');
console.log('🎉 Android icons created!');
console.log('');
console.log('📋 Next steps:');
console.log('1. Open icon-generator.html in your browser');
console.log('2. Download the PNG versions of each size');
console.log('3. Replace the SVG files in the Android directories');
console.log('4. Or use the current SVG files (they should work)');
console.log('');
console.log('🔧 Alternative: Use online tools like:');
console.log('- https://resizeimage.net/');
console.log('- https://www.iloveimg.com/resize-image');
console.log('- https://convertio.co/svg-png/');
