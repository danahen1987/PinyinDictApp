#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 Converting JPEG to PNG for Android');
console.log('====================================');
console.log('');

// Check if JPEG file exists
const jpegPath = 'app_logo.jpeg';
if (!fs.existsSync(jpegPath)) {
    console.error('❌ JPEG file not found:', jpegPath);
    process.exit(1);
}

console.log('✅ Found JPEG logo:', jpegPath);
console.log('📊 File size:', fs.statSync(jpegPath).size, 'bytes');

// Create HTML converter
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>JPEG to PNG Converter</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
        canvas { border: 2px solid #ddd; margin: 20px; }
        .download-btn { 
            background: #3498db; color: white; padding: 12px 24px; 
            text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px;
        }
    </style>
</head>
<body>
    <h1>🎨 Convert JPEG to PNG</h1>
    <p>Your JPEG logo will be converted to PNG format below:</p>
    
    <div id="converter"></div>
    
    <script>
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const pngDataURL = canvas.toDataURL('image/png');
            
            document.getElementById('converter').innerHTML = \`
                <h3>Original JPEG (\${img.width} × \${img.height})</h3>
                <img src="app_logo.jpeg" style="max-width: 200px; border: 1px solid #ccc;">
                <br><br>
                <h3>Converted PNG</h3>
                <canvas width="\${img.width}" height="\${img.height}" style="max-width: 200px; border: 1px solid #ccc;"></canvas>
                <br><br>
                <a href="\${pngDataURL}" download="app-logo.png" class="download-btn">
                    📥 Download PNG Logo
                </a>
            \`;
            
            // Copy to display canvas
            const displayCanvas = document.querySelector('canvas');
            const displayCtx = displayCanvas.getContext('2d');
            displayCtx.drawImage(img, 0, 0);
        };
        img.src = 'app_logo.jpeg';
    </script>
</body>
</html>
`;

// Write HTML file
fs.writeFileSync('jpeg-to-png-converter.html', htmlContent);
console.log('✅ Created jpeg-to-png-converter.html');

console.log('');
console.log('📋 Next steps:');
console.log('1. Open jpeg-to-png-converter.html in your browser');
console.log('2. Download the PNG version');
console.log('3. Save it as app-logo.png in this directory');
console.log('4. Run: ./setup-png-logo.sh');
console.log('');
console.log('🔧 Alternative: Use online converters:');
console.log('- https://convertio.co/jpeg-png/');
console.log('- https://www.iloveimg.com/convert-to-png');
console.log('- https://cloudconvert.com/jpeg-to-png');
console.log('');
console.log('📱 Your JPEG logo will then work perfectly with Android!');
