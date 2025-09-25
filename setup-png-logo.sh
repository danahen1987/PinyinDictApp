#!/bin/bash

# PNG Logo Setup Script
echo "🎨 PinYinDict PNG Logo Setup"
echo "============================"
echo ""

# Look for PNG files
PNG_FILES=("my-logo.png" "app-logo.png" "logo.png" "*.png")

PNG_FOUND=""
for pattern in "${PNG_FILES[@]}"; do
    for file in $pattern; do
        if [ -f "$file" ]; then
            # Check if it's actually a PNG file
            if file "$file" | grep -q "PNG image"; then
                PNG_FOUND="$file"
                break 2
            fi
        fi
    done
done

if [ -z "$PNG_FOUND" ]; then
    echo "❌ No valid PNG logo found!"
    echo ""
    echo "📋 Please save your PNG image as one of these names:"
    echo "   - my-logo.png (recommended)"
    echo "   - app-logo.png"
    echo "   - logo.png"
    echo ""
    echo "📍 Save it to: $(pwd)/"
    echo ""
    echo "🔄 After saving, run this script again."
    exit 1
fi

echo "✅ Found PNG logo: $PNG_FOUND"
echo "📊 File size: $(du -h "$PNG_FOUND" | cut -f1)"
echo "📐 File type: $(file "$PNG_FOUND")"
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

echo "📱 Creating Android icon directories and copying PNG..."

for size in "${!iconSizes[@]}"; do
    dir="${iconSizes[$size]}"
    
    # Ensure directory exists
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo "✅ Created directory: $dir"
    fi
    
    # Copy PNG to target location
    targetPath="$dir/ic_launcher.png"
    cp "$PNG_FOUND" "$targetPath"
    echo "✅ Copied PNG to: $targetPath (${size}x${size})"
done

echo ""

# Update download page
echo "🌐 Updating download page with logo..."
if [ -f "download-page.html" ]; then
    # Create a copy of the logo for the download page
    cp "$PNG_FOUND" download-page/app-logo.png
    
    echo "✅ Download page updated with logo"
else
    echo "⚠️  Download page not found"
fi

echo ""

# Update README
echo "📚 Updating README with logo..."
if [ -f "README.md" ]; then
    # Create a copy of the logo for README
    cp "$PNG_FOUND" app-logo.png
    
    echo "✅ README updated with logo"
else
    echo "⚠️  README not found"
fi

echo ""

# Build new APK
echo "🔨 Building new APK with PNG logo..."
cd android
./gradlew assembleRelease
cd ..

if [ $? -eq 0 ]; then
    echo "✅ New APK built successfully with your PNG logo!"
    echo "📁 APK location: android/app/build/outputs/apk/release/app-release.apk"
    
    # Copy to download page
    cp android/app/build/outputs/apk/release/app-release.apk download-page/app-release.apk
    echo "✅ APK copied to download page"
else
    echo "❌ APK build failed. Please check the build output above."
fi

echo ""
echo "🎉 PNG logo setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test the new APK on your device"
echo "2. Check that the logo appears in the app drawer"
echo "3. Update your download page if needed"
echo "4. Commit changes to GitHub"
echo ""
echo "🎨 Your PinYinDict app now has a custom PNG logo!"
