#!/bin/bash

# PinYinDict App Logo Setup Script
# This script helps integrate your custom logo into the app

echo "🎨 PinYinDict App Logo Setup"
echo "============================"
echo ""

# Check if logo file exists
LOGO_FILE="app-logo.png"
if [ ! -f "$LOGO_FILE" ]; then
    echo "❌ Logo file not found: $LOGO_FILE"
    echo ""
    echo "📋 Please save your logo image as 'app-logo.png' in the project directory:"
    echo "   $(pwd)/$LOGO_FILE"
    echo ""
    echo "📐 Recommended specifications:"
    echo "   - Format: PNG (with transparency)"
    echo "   - Size: 512x512 pixels (minimum)"
    echo "   - Background: Transparent or solid color"
    echo "   - Style: Square format"
    echo ""
    echo "🔄 After saving your logo, run this script again."
    exit 1
fi

echo "✅ Found logo file: $LOGO_FILE"
echo "📊 Logo size: $(file $LOGO_FILE | grep -o '[0-9]*x[0-9]*')"
echo ""

# Create backup of existing icons
echo "💾 Creating backup of existing app icons..."
mkdir -p backup-icons
cp android/app/src/main/res/mipmap-*/ic_launcher.png backup-icons/ 2>/dev/null || echo "No existing icons to backup"
echo "✅ Backup created in backup-icons/ directory"
echo ""

# Check if ImageMagick is available for resizing
if command -v convert &> /dev/null; then
    echo "🖼️  ImageMagick found - creating multiple sizes..."
    
    # Create different sizes
    convert "$LOGO_FILE" -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
    convert "$LOGO_FILE" -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
    convert "$LOGO_FILE" -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
    convert "$LOGO_FILE" -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
    convert "$LOGO_FILE" -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
    convert "$LOGO_FILE" -resize 36x36 android/app/src/main/res/mipmap-ldpi/ic_launcher.png
    
    echo "✅ Created all required icon sizes"
else
    echo "⚠️  ImageMagick not found. Please manually resize your logo:"
    echo ""
    echo "📐 Required sizes:"
    echo "   - 192x192px → android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"
    echo "   - 144x144px → android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png"
    echo "   - 96x96px → android/app/src/main/res/mipmap-xhdpi/ic_launcher.png"
    echo "   - 72x72px → android/app/src/main/res/mipmap-hdpi/ic_launcher.png"
    echo "   - 48x48px → android/app/src/main/res/mipmap-mdpi/ic_launcher.png"
    echo "   - 36x36px → android/app/src/main/res/mipmap-ldpi/ic_launcher.png"
    echo ""
    echo "💡 You can use online tools like:"
    echo "   - https://resizeimage.net/"
    echo "   - https://www.iloveimg.com/resize-image"
fi

echo ""

# Update download page
echo "🌐 Updating download page with logo..."
if [ -f "download-page.html" ]; then
    # Create a copy of the logo for the download page
    cp "$LOGO_FILE" download-page/app-logo.png
    
    # Update the download page HTML
    sed -i.bak 's/<h1>🎓 PinYinDict<\/h1>/<div class="logo-section" style="text-align: center; margin: 20px 0;"><img src="app-logo.png" alt="PinYinDict Logo" style="width: 100px; height: 100px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);"><\/div><h1>🎓 PinYinDict<\/h1>/' download-page.html
    
    echo "✅ Download page updated with logo"
else
    echo "⚠️  Download page not found"
fi

echo ""

# Update README
echo "📚 Updating README with logo..."
if [ -f "README.md" ]; then
    # Add logo to README
    sed -i.bak '1i\
<div align="center">\
  <img src="app-logo.png" alt="PinYinDict Logo" width="200">\
</div>\
\
' README.md
    
    echo "✅ README updated with logo"
else
    echo "⚠️  README not found"
fi

echo ""

# Build new APK
echo "🔨 Building new APK with updated logo..."
cd android
./gradlew assembleRelease
cd ..

if [ $? -eq 0 ]; then
    echo "✅ New APK built successfully with your logo!"
    echo "📁 APK location: android/app/build/outputs/apk/release/app-release.apk"
else
    echo "❌ APK build failed. Please check the build output above."
fi

echo ""
echo "🎉 Logo setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test the new APK on your device"
echo "2. Check that the logo appears in the app drawer"
echo "3. Update your download page if needed"
echo "4. Commit changes to GitHub"
echo ""
echo "🎨 Your PinYinDict app now has a custom logo!"
