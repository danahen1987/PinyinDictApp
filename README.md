# PinYinDict - Chinese Character Learning App

<div align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.80.12-blue.svg" alt="React Native Version">
  <img src="https://img.shields.io/badge/Android-5.0%2B-green.svg" alt="Android Support">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg" alt="Status">
</div>

## 🎯 **Overview**

PinYinDict is a comprehensive Chinese character learning application built with React Native. It provides an interactive platform for learning Chinese characters through practice, quizzes, and progress tracking.

## ✨ **Features**

### 🎓 **Character Learning**
- **1882 Chinese characters** with stroke order practice
- **Interactive stroke practice** using Hanzi Writer
- **Pinyin pronunciation** with Text-to-Speech
- **Character meanings** and usage examples

### 📊 **Progress Tracking**
- **User registration** and login system
- **Progress indicators** with pie charts
- **Viewed character tracking** with visual feedback
- **Practice count** and learning statistics

### 🧠 **Quiz Mode**
- **Translation Quiz** - Character to English meaning
- **Sentence Completion Quiz** - Fill in missing characters
- **Randomized questions** from viewed characters
- **Score calculation** and progress feedback

### 🔧 **Admin Features**
- **User management** system
- **Admin panel** for viewing registered users
- **Progress monitoring** capabilities

### 📱 **Modern UI/UX**
- **Responsive design** with scrolling support
- **Clean, intuitive interface** with blue color scheme
- **Progress visualization** with pie charts
- **Smooth navigation** between features

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js (v14 or higher)
- React Native CLI
- Android Studio (for Android development)
- Java Development Kit (JDK 11 or higher)

### **Installation**
```bash
# Clone the repository
git clone https://github.com/yourusername/PinYinDict.git
cd PinYinDict

# Install dependencies
npm install

# Link assets
npx react-native link

# Start Metro bundler
npx react-native start

# Run on Android (in a new terminal)
npx react-native run-android
```

### **Standalone APK Installation**
For users who want to install the app without development tools:

1. **Download the APK** from the releases section
2. **Enable Unknown Sources** in Android settings
3. **Install the APK** on your device
4. **Launch the app** and start learning!

## 📱 **Screenshots**

<div align="center">
  <img src="screenshots/landing-page.png" alt="Landing Page" width="200">
  <img src="screenshots/character-practice.png" alt="Character Practice" width="200">
  <img src="screenshots/quiz-mode.png" alt="Quiz Mode" width="200">
  <img src="screenshots/progress-tracking.png" alt="Progress Tracking" width="200">
</div>

## 🏗️ **Architecture**

### **Frontend**
- **React Native** - Cross-platform mobile development
- **JavaScript** - Application logic and state management
- **React Hooks** - State and lifecycle management
- **Styled Components** - UI styling and theming

### **Backend**
- **SQLite** - Local database for character data and user progress
- **React Native SQLite Storage** - Database integration
- **Local Storage** - User preferences and settings

### **Key Components**
```
src/
├── components/          # UI components
│   ├── LandingPage.js   # Main landing page
│   ├── SimpleCharacterCard.js  # Character practice
│   ├── QuizModePage.js  # Quiz functionality
│   └── UserDetailsModal.js  # User management
├── database/            # Database layer
│   ├── DatabaseHelper.js  # Database operations
│   └── DatabaseInitializer.js  # Database setup
├── services/            # Business logic
│   ├── AuthService.js   # Authentication
│   ├── TTSService.js    # Text-to-Speech
│   └── ProgressService.js  # Progress tracking
└── styles/              # Styling
    └── AppStyles.js     # Centralized styles
```

## 📊 **Database Schema**

### **Characters Table**
- `id` - Unique character identifier
- `character` - Chinese character
- `pinyin` - Pinyin pronunciation
- `meaning` - English meaning
- `stroke_data` - Stroke order information

### **Users Table**
- `id` - Unique user identifier
- `username` - User's username
- `password` - Encrypted password
- `viewed_count` - Number of characters viewed
- `is_admin` - Admin privileges flag

### **User Progress Table**
- `user_id` - Foreign key to users
- `character_id` - Foreign key to characters
- `viewed_at` - Timestamp of when character was viewed
- `practice_count` - Number of times practiced

## 🔧 **Development**

### **Building for Production**
```bash
# Generate release APK
cd android
./gradlew assembleRelease

# APK will be created at:
# android/app/build/outputs/apk/release/app-release.apk
```

### **Database Management**
```bash
# Test database connection
node simple-db-test.js

# Analyze character data
node analyze-sentence-characters.js
```

### **Code Quality**
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Clean Architecture** - Separation of concerns
- **Error Handling** - Comprehensive error management

## 📈 **Performance**

### **Optimizations**
- **Code minification** for production builds
- **Resource compression** for smaller APK size
- **Lazy loading** for character data
- **Efficient database queries** with indexing
- **Memory management** for large datasets

### **APK Size**
- **Release APK:** ~28MB
- **Debug APK:** ~45MB
- **Optimized for** multiple Android architectures

## 🧪 **Testing**

### **Manual Testing**
- **Character Practice** - Stroke order and pronunciation
- **Quiz Mode** - Translation and sentence completion
- **User Management** - Registration and login
- **Progress Tracking** - Data persistence and visualization

### **Device Testing**
- **Android 5.0+** - Primary target platform
- **Multiple screen sizes** - Responsive design
- **Different architectures** - ARM64, ARMv7, x86, x86_64

## 📚 **Data Sources**

### **Character Data**
- **1882 Chinese characters** with comprehensive information
- **Pinyin pronunciations** with tone marks
- **English meanings** and usage examples
- **Stroke order data** for practice

### **Sentence Data**
- **Contextual sentences** for each character
- **Pinyin translations** for pronunciation
- **English translations** for understanding

## 🤝 **Contributing**

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Development Guidelines**
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **React Native Community** for the excellent framework
- **Chinese Language Resources** for character data
- **Open Source Contributors** for various libraries used
- **Beta Testers** for feedback and improvements

## 📞 **Support**

### **Getting Help**
- **Issues** - Report bugs or request features
- **Discussions** - Ask questions or share ideas
- **Documentation** - Check the wiki for detailed guides

### **Contact**
- **Email:** your-email@example.com
- **GitHub:** [@yourusername](https://github.com/yourusername)
- **Website:** [your-website.com](https://your-website.com)

## 🎉 **Roadmap**

### **Upcoming Features**
- [ ] **iOS Support** - Native iOS app development
- [ ] **Cloud Sync** - User progress synchronization
- [ ] **Advanced Analytics** - Learning progress insights
- [ ] **Social Features** - User communities and sharing
- [ ] **Offline Mode** - Complete offline functionality
- [ ] **Voice Recognition** - Pronunciation practice

### **Version History**
- **v1.0** - Initial release with core features
- **v1.1** - Style cleanup and centralization
- **v1.2** - Clean logs version and performance improvements

---

<div align="center">
  <p><strong>🎓 Start learning Chinese characters today!</strong></p>
  <p>Built with ❤️ using React Native</p>
</div>
