#!/bin/bash

# PinYinDict App - APK Installation Script
# This script helps install the APK on connected Android devices

echo "🚀 PinYinDict App - APK Installation Script"
echo "=============================================="
echo ""

# Check if ADB is available
if ! command -v adb &> /dev/null; then
    echo "❌ ADB not found. Please install Android SDK Platform Tools."
    echo "   Download from: https://developer.android.com/studio/releases/platform-tools"
    exit 1
fi

# Check if device is connected
echo "📱 Checking for connected devices..."
adb devices

echo ""
echo "🔍 Available APK files:"
ls -lh android/app/build/outputs/apk/release/*.apk 2>/dev/null || echo "No APK files found. Run 'cd android && ./gradlew assembleRelease' first."

echo ""
echo "📋 Installation Options:"
echo "1. Install via ADB (requires connected device)"
echo "2. Show APK location for manual installation"
echo "3. Exit"
echo ""

read -p "Choose an option (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🔌 Installing via ADB..."
        APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
        
        if [ ! -f "$APK_PATH" ]; then
            echo "❌ APK not found. Building first..."
            cd android && ./gradlew assembleRelease
            cd ..
        fi
        
        if [ -f "$APK_PATH" ]; then
            echo "📦 Installing APK..."
            adb install -r "$APK_PATH"
            
            if [ $? -eq 0 ]; then
                echo "✅ Installation successful!"
                echo "📱 You can now find 'PinYinDict' on your device."
                echo ""
                echo "🎉 First time setup:"
                echo "   1. Open the app"
                echo "   2. Register a new user"
                echo "   3. Start learning Chinese characters!"
            else
                echo "❌ Installation failed. Check device connection and permissions."
            fi
        else
            echo "❌ APK build failed. Check the build output above."
        fi
        ;;
    2)
        echo ""
        echo "📁 APK Location:"
        echo "   $(pwd)/android/app/build/outputs/apk/release/app-release.apk"
        echo ""
        echo "📱 Manual Installation Steps:"
        echo "   1. Transfer APK to your device (email, cloud storage, USB)"
        echo "   2. Enable 'Unknown Sources' in device settings"
        echo "   3. Open APK file on device and tap 'Install'"
        echo "   4. Launch 'PinYinDict' app"
        ;;
    3)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option. Please choose 1, 2, or 3."
        ;;
esac

echo ""
echo "📚 For more help, see DEPLOYMENT_GUIDE.md"
echo "🎓 Happy learning!"
