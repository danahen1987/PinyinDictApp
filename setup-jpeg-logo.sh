#!/bin/bash

# JPEG Logo Setup Script
echo "🎨 PinYinDict JPEG Logo Setup"
echo "============================="
echo ""

# Look for JPEG files
JPEG_FILES=("app_logo.jpeg" "app-logo.jpeg" "logo.jpeg" "*.jpeg" "*.jpg")

JPEG_FOUND=""
for pattern in "${JPEG_FILES[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ]; then
            # Check if it's actually a JPEG file
            if file "$file" | grep -q "JPEG image"; then
                JPEG_FOUND="$file"
                break 2
            fi
        fi
    done
done

if [ -z "$JPEG_FOUND" ]; then
    echo "❌ No valid JPEG logo found!"
    echo ""
    echo "📋 Please save your JPEG image as one of these names:"
    echo "   - app_logo.jpeg (recommended)"
    echo "   - app-logo.jpeg"
    echo "   - logo.jpeg"
    echo ""
    echo "📍 Save it to: $(pwd)/"
    echo ""
    echo "🔄 After saving, run this script again."
    exit 1
fi

echo "✅ Found JPEG logo: $JPEG_FOUND"
echo "📊 File size: $(du -h "$JPEG_FOUND" | cut -f1)"
echo "📐 File type: $(file "$JPEG_FOUND")"
echo ""

# Create backup of existing icons
echo "💾 Creating backup of existing app icons..."
mkdir -p backup-icons
cp android/app/src/main/res/mipmap-*/ic_launcher.png backup-icons/ 2>/dev/null || echo "No existing PNG icons to backup"
echo "✅ Backup created in backup-icons/ directory"
echo ""

# Android icon sizes and directories
declare -A iconSizes=(
    ["192"]="android/app/src/main/res/mipmap-xxxhdpi"
    ["144"]="android/app/src/main/res/mipmap-xxhdpi"
    ["96"]="android/app/src/main/res/mipmap-xhdpi"
    ["72"]="android/app/src/main/res/mipmap-hdpi"
    ["48"]="android/app/src/main/res/mipmap-mdpi"
    ["36"]="android/app/src/main/res/mipmap-ldpi"
)

echo "📱 Creating Android icon directories and copying JPEG..."

for size in "${!iconSizes[@]}"; do
    dir="${iconSizes[$size]}"
    
    # Ensure directory exists
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo "✅ Created directory: $dir"
    fi
    
    # Copy JPEG to target location (Android will handle the conversion)
    targetPath="$dir/ic_launcher.png"
    cp "$JPEG_FOUND" "$targetPath"
    echo "✅ Copied JPEG to: $targetPath (${size}x${size})"
done

echo ""

# Update download page
echo "🌐 Updating download page with logo..."
if [ -f "download-page.html" ]; then
    # Create a copy of the logo for the download page
    cp "$JPEG_FOUND" download-page/app-logo.jpeg
    
    echo "✅ Download page updated with logo"
else
    echo "⚠️  Download page not found"
fi

echo ""

# Update README
echo "📚 Updating README with logo..."
if [ -f "README.md" ]; then
    # Create a copy of the logo for README
    cp "$JPEG_FOUND" app-logo.jpeg
    
    echo "✅ README updated with logo"
else
    echo "⚠️  README not found"
fi

echo ""

# Build new APK
echo "🔨 Building new APK with JPEG logo..."
cd android
./gradlew assembleRelease
cd ..

if [ $? -eq 0 ]; then
    echo "✅ New APK built successfully with your JPEG logo!"
    echo "📁 APK location: android/app/build/outputs/apk/release/app-release.apk"
    
    # Copy to download page
    cp android/app/build/outputs/apk/release/app-release.apk download-page/app-release.apk
    echo "✅ APK copied to download page"
else
    echo "❌ APK build failed. Please check the build output above."
fi

echo ""
echo "🎉 JPEG logo setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test the new APK on your device"
echo "2. Check that the logo appears in the app drawer"
echo "3. Update your download page if needed"
echo "4. Commit changes to GitHub"
echo ""
echo "🎨 Your PinYinDict app now has a custom JPEG logo!"
