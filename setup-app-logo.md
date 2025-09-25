# PinYinDict App Logo Setup Guide

## 🎨 **Integrating Your Custom Logo**

### **Step 1: Prepare Your Logo Image**

1. **Save your image** to the project directory:
   ```bash
   # Save as: app-logo.png (recommended name)
   # Location: /Users/codelovers/PinYinDict/PinYinDictApp/
   ```

2. **Recommended specifications:**
   - **Format:** PNG (with transparency)
   - **Size:** 512x512 pixels (minimum)
   - **Background:** Transparent or solid color
   - **Style:** Square format, rounded corners work well

### **Step 2: Create Multiple Sizes**

Your logo needs to be resized for different Android screen densities:

```bash
# Required sizes:
- 512x512px (Google Play Store)
- 192x192px (xxxhdpi)
- 144x144px (xxhdpi) 
- 96x96px (xhdpi)
- 72x72px (hdpi)
- 48x48px (mdpi)
- 36x36px (ldpi)
```

### **Step 3: Replace Android App Icons**

Replace the existing app icons in these directories:

```bash
android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
android/app/src/main/res/mipmap-hdpi/ic_launcher.png
android/app/src/main/res/mipmap-mdpi/ic_launcher.png
android/app/src/main/res/mipmap-ldpi/ic_launcher.png
```

### **Step 4: Update Download Page**

Add your logo to the download page:

```html
<!-- Add this to download-page.html -->
<div class="logo-section">
    <img src="app-logo.png" alt="PinYinDict Logo" style="width: 100px; height: 100px; border-radius: 20px; margin: 20px;">
</div>
```

### **Step 5: Update GitHub Repository**

1. **Add logo to README.md:**
   ```markdown
   <div align="center">
     <img src="app-logo.png" alt="PinYinDict Logo" width="200">
   </div>
   ```

2. **Update repository description** with logo

## 🛠️ **Quick Setup Script**

Once you have your logo image saved as `app-logo.png`, run:

```bash
# Make the script executable
chmod +x setup-app-logo.sh

# Run the setup
./setup-app-logo.sh
```

## 📱 **Testing Your Logo**

1. **Build new APK** with updated icons
2. **Install on device** to see the new logo
3. **Check app drawer** for the new icon
4. **Verify download page** shows your logo

## 🎯 **Logo Best Practices**

- **Simple design** - works well at small sizes
- **High contrast** - visible on different backgrounds
- **Consistent branding** - matches your app's theme
- **Professional look** - represents your app quality

## 📋 **Checklist**

- [ ] Logo image saved to project directory
- [ ] Multiple sizes created (512px down to 36px)
- [ ] Android app icons replaced
- [ ] Download page updated
- [ ] GitHub README updated
- [ ] New APK built and tested
- [ ] Logo visible in app drawer

---

**🎉 Once complete, your PinYinDict app will have a professional, custom logo!**
