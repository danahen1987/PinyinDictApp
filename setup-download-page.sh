#!/bin/bash

# PinYinDict App - Download Page Setup Script
# This script helps create a download page for your APK

echo "🌐 PinYinDict App - Download Page Setup"
echo "======================================"
echo ""

# Check if APK exists
APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
if [ ! -f "$APK_PATH" ]; then
    echo "❌ APK not found. Building first..."
    cd android && ./gradlew assembleRelease
    cd ..
fi

if [ -f "$APK_PATH" ]; then
    echo "✅ APK found: $APK_PATH"
    echo "📊 Size: $(ls -lh $APK_PATH | awk '{print $5}')"
    echo ""
    
    # Copy APK to download directory
    mkdir -p download-page
    cp "$APK_PATH" download-page/app-release.apk
    cp download-page.html download-page/index.html
    
    echo "📁 Created download page directory:"
    echo "   $(pwd)/download-page/"
    echo ""
    echo "📋 Files created:"
    echo "   - index.html (download page)"
    echo "   - app-release.apk (your app)"
    echo ""
    echo "🌐 Hosting Options:"
    echo "1. GitHub Pages (Free)"
    echo "2. Netlify (Free)"
    echo "3. Vercel (Free)"
    echo "4. Your own web server"
    echo ""
    echo "📤 To upload to GitHub Pages:"
    echo "1. Create a new repository called 'pinyindict-download'"
    echo "2. Upload the contents of 'download-page/' folder"
    echo "3. Enable GitHub Pages in repository settings"
    echo "4. Your download page will be available at:"
    echo "   https://yourusername.github.io/pinyindict-download/"
    echo ""
    echo "🎯 Direct APK link will be:"
    echo "   https://yourusername.github.io/pinyindict-download/app-release.apk"
    echo ""
    echo "📱 Test the download page:"
    echo "   Open download-page/index.html in your browser"
    
else
    echo "❌ APK build failed. Please check the build output above."
fi

echo ""
echo "🎉 Download page setup complete!"
echo "📚 For more hosting options, see the documentation"
