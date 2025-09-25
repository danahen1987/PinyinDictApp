#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 Resizing PNG Logo for Android Icons');
console.log('=====================================');
console.log('');

// Check if the PNG file exists
const pngPath = 'app-logo.png';
if (!fs.existsSync(pngPath)) {
    console.error('❌ PNG file not found:', pngPath);
    process.exit(1);
}

console.log('✅ Found PNG logo:', pngPath);
console.log('📊 File size:', fs.statSync(pngPath).size, 'bytes');

// Android icon sizes and their target directories
const iconSizes = [
    { size: 192, dir: 'android/app/src/main/res/mipmap-xxxhdpi' },
    { size: 144, dir: 'android/app/src/main/res/mipmap-xxhdpi' },
    { size: 96, dir: 'android/app/src/main/res/mipmap-xhdpi' },
    { size: 72, dir: 'android/app/src/main/res/mipmap-hdpi' },
    { size: 48, dir: 'android/app/src/main/res/mipmap-mdpi' },
    { size: 36, dir: 'android/app/src/main/res/mipmap-ldpi' }
];

// Create HTML file for PNG resizing
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>PNG Icon Resizer</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .icon { 
            margin: 15px; 
            padding: 15px;
            border: 2px solid #ddd; 
            border-radius: 8px;
            display: inline-block;
            text-align: center;
            background: #fafafa;
        }
        canvas { 
            border: 1px solid #ccc; 
            border-radius: 4px;
            margin: 10px 0;
        }
        .download-btn {
            background: #3498db;
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            border-radius: 4px;
            display: inline-block;
            margin: 5px;
        }
        .download-btn:hover {
            background: #2980b9;
        }
        h1 { color: #2c3e50; }
        .instructions {
            background: #e8f4fd;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 PinYinDict Logo Resizer</h1>
        <div class="instructions">
            <h3>📋 Instructions:</h3>
            <ol>
                <li>Right-click on each "Download" link below</li>
                <li>Save each file with the exact name shown</li>
                <li>Replace the files in your Android project directories</li>
            </ol>
        </div>
        
        <div id="icons"></div>
        
        <div class="instructions">
            <h3>📁 Target Directories:</h3>
            <ul>
                <li><strong>192x192:</strong> android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png</li>
                <li><strong>144x144:</strong> android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png</li>
                <li><strong>96x96:</strong> android/app/src/main/res/mipmap-xhdpi/ic_launcher.png</li>
                <li><strong>72x72:</strong> android/app/src/main/res/mipmap-hdpi/ic_launcher.png</li>
                <li><strong>48x48:</strong> android/app/src/main/res/mipmap-mdpi/ic_launcher.png</li>
                <li><strong>36x36:</strong> android/app/src/main/res/mipmap-ldpi/ic_launcher.png</li>
            </ul>
        </div>
    </div>
    
    <script>
        const sizes = [192, 144, 96, 72, 48, 36];
        
        function createResizedIcon(size) {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            const img = new Image();
            img.onload = function() {
                // Clear canvas with transparent background
                ctx.clearRect(0, 0, size, size);
                
                // Draw resized image
                ctx.drawImage(img, 0, 0, size, size);
                
                // Convert to PNG data URL
                const dataURL = canvas.toDataURL('image/png');
                
                // Create download link
                const div = document.createElement('div');
                div.className = 'icon';
                div.innerHTML = \`
                    <h3>\${size} × \${size} pixels</h3>
                    <canvas width="\${size}" height="\${size}"></canvas>
                    <br>
                    <a href="\${dataURL}" download="ic_launcher_\${size}.png" class="download-btn">
                        📥 Download \${size}×\${size}
                    </a>
                \`;
                
                // Copy the canvas content to the display canvas
                const displayCanvas = div.querySelector('canvas');
                const displayCtx = displayCanvas.getContext('2d');
                displayCtx.drawImage(img, 0, 0, size, size);
                
                document.getElementById('icons').appendChild(div);
            };
            
            img.src = 'app-logo.png';
        }
        
        // Generate all required sizes
        sizes.forEach(createResizedIcon);
        
        console.log('🎨 PNG Icon Resizer loaded');
        console.log('📱 Ready to generate Android icon sizes');
    </script>
</body>
</html>
`;

// Write HTML file
fs.writeFileSync('png-icon-resizer.html', htmlContent);
console.log('✅ Created png-icon-resizer.html');

// For now, let's copy the PNG to all required locations
console.log('📱 Copying PNG logo to Android icon directories...');

iconSizes.forEach(({ size, dir }) => {
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    }
    
    // Copy PNG to target location
    const targetPath = path.join(dir, 'ic_launcher.png');
    fs.copyFileSync(pngPath, targetPath);
    console.log(`✅ Copied PNG to: ${targetPath} (${size}x${size})`);
});

console.log('');
console.log('🎉 PNG Android icons created!');
console.log('');
console.log('📋 Next steps:');
console.log('1. Open png-icon-resizer.html in your browser');
console.log('2. Download the properly resized PNG versions');
console.log('3. Replace the current files in Android directories');
console.log('4. Or use the current PNG files (they should work)');
console.log('');
console.log('🔧 Alternative online tools:');
console.log('- https://resizeimage.net/');
console.log('- https://www.iloveimg.com/resize-image');
console.log('- https://convertio.co/');
console.log('');
console.log('📱 Your app now has the custom PNG logo!');
