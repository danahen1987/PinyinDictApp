#!/bin/bash

# PinYinDict App - GitHub Setup Script
# This script helps set up your project on GitHub

echo "🚀 PinYinDict App - GitHub Setup Script"
echo "========================================"
echo ""

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install Git first."
    echo "   Download from: https://git-scm.com/downloads"
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please run 'git init' first."
    exit 1
fi

echo "📋 GitHub Setup Options:"
echo "1. Check current git status"
echo "2. Add GitHub remote (you'll need to create repository first)"
echo "3. Push to GitHub"
echo "4. Create a new release"
echo "5. Show GitHub repository URL"
echo "6. Exit"
echo ""

read -p "Choose an option (1-6): " choice

case $choice in
    1)
        echo ""
        echo "📊 Current Git Status:"
        git status
        echo ""
        echo "📈 Recent Commits:"
        git log --oneline -5
        ;;
    2)
        echo ""
        echo "🔗 Adding GitHub Remote..."
        echo ""
        echo "First, create a repository on GitHub:"
        echo "1. Go to https://github.com"
        echo "2. Click 'New repository'"
        echo "3. Name it 'PinYinDict' or 'chinese-learning-app'"
        echo "4. Don't initialize with README (we already have one)"
        echo "5. Click 'Create repository'"
        echo ""
        read -p "Enter your GitHub username: " username
        read -p "Enter your repository name: " repo_name
        
        if [ -z "$username" ] || [ -z "$repo_name" ]; then
            echo "❌ Username and repository name are required."
            exit 1
        fi
        
        echo "🔗 Adding remote origin..."
        git remote add origin "https://github.com/$username/$repo_name.git"
        
        if [ $? -eq 0 ]; then
            echo "✅ Remote added successfully!"
            echo "📡 Remote URL: https://github.com/$username/$repo_name.git"
        else
            echo "❌ Failed to add remote. Check your repository name and permissions."
        fi
        ;;
    3)
        echo ""
        echo "📤 Pushing to GitHub..."
        
        # Check if remote exists
        if ! git remote get-url origin &> /dev/null; then
            echo "❌ No remote origin found. Please add GitHub remote first (option 2)."
            exit 1
        fi
        
        echo "📡 Remote URL: $(git remote get-url origin)"
        echo ""
        echo "🚀 Pushing to GitHub..."
        git push -u origin main
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully pushed to GitHub!"
            echo "🌐 Your repository is now available at:"
            echo "   $(git remote get-url origin)"
        else
            echo "❌ Push failed. Check your GitHub credentials and repository permissions."
            echo "💡 You might need to:"
            echo "   1. Set up GitHub authentication (personal access token)"
            echo "   2. Check repository permissions"
            echo "   3. Verify repository exists on GitHub"
        fi
        ;;
    4)
        echo ""
        echo "📦 Creating a New Release..."
        echo ""
        echo "To create a release:"
        echo "1. Go to your GitHub repository"
        echo "2. Click 'Releases' tab"
        echo "3. Click 'Create a new release'"
        echo "4. Tag version: v1.0.0"
        echo "5. Release title: PinYinDict v1.0.0 - Initial Release"
        echo "6. Upload your APK file: android/app/build/outputs/apk/release/app-release.apk"
        echo "7. Click 'Publish release'"
        echo ""
        echo "📁 APK Location:"
        echo "   $(pwd)/android/app/build/outputs/apk/release/app-release.apk"
        ;;
    5)
        echo ""
        echo "🌐 GitHub Repository Information:"
        if git remote get-url origin &> /dev/null; then
            echo "📡 Remote URL: $(git remote get-url origin)"
            echo "🔗 Web URL: $(git remote get-url origin | sed 's/\.git$//')"
        else
            echo "❌ No remote origin found. Please add GitHub remote first (option 2)."
        fi
        ;;
    6)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option. Please choose 1-6."
        ;;
esac

echo ""
echo "📚 For detailed instructions, see GITHUB_SETUP_GUIDE.md"
echo "🎓 Happy coding!"
