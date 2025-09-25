#!/bin/bash

# Quick Logo Setup Script
echo "🎨 PinYinDict Quick Logo Setup"
echo "=============================="
echo ""

# Look for any image file
LOGO_FILES=("app-logo.png" "app-logo.jpg" "logo.png" "logo.jpg" "logo.jpeg" "logo.gif")

LOGO_FOUND=""
for file in "${LOGO_FILES[@]}"; do
    if [ -f "$file" ]; then
        LOGO_FOUND="$file"
        break
    fi
done

if [ -z "$LOGO_FOUND" ]; then
    echo "❌ No logo image found!"
    echo ""
    echo "📋 Please save your image as one of these names:"
    echo "   - app-logo.png (recommended)"
    echo "   - app-logo.jpg"
    echo "   - logo.png"
    echo "   - logo.jpg"
    echo ""
    echo "📍 Save it to: $(pwd)/"
    echo ""
    echo "🔄 After saving, run this script again."
    exit 1
fi

echo "✅ Found logo: $LOGO_FOUND"
echo "📊 File size: $(du -h "$LOGO_FOUND" | cut -f1)"
echo ""

# Rename to standard name if needed
if [ "$LOGO_FOUND" != "app-logo.png" ]; then
    echo "🔄 Renaming to app-logo.png..."
    cp "$LOGO_FOUND" app-logo.png
    echo "✅ Renamed to app-logo.png"
fi

echo ""
echo "🚀 Setting up your logo..."

# Run the main setup script
./setup-app-logo.sh

echo ""
echo "🎉 Logo setup complete!"
echo "📱 Your app now has your custom logo!"
