#!/bin/bash

# COVID-19 Dashboard Deployment Script
echo "🚀 COVID-19 Dashboard Deployment Setup"
echo "======================================"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "📥 Install it with: brew install gh"
    echo "🔗 Or visit: https://cli.github.com/"
    exit 1
fi

# Repository details
REPO_NAME="covid-dashboard-india"
REPO_DESCRIPTION="🦠 Real-time COVID-19 Dashboard for India with state-wise statistics, live updates, and beautiful visualizations"

echo "📝 Creating GitHub repository: $REPO_NAME"

# Create the repository
gh repo create $REPO_NAME --public --description "$REPO_DESCRIPTION" --clone=false

if [ $? -eq 0 ]; then
    echo "✅ Repository created successfully!"
    
    # Add remote origin
    git remote add origin https://github.com/$(gh api user --jq .login)/$REPO_NAME.git
    
    # Push to GitHub
    echo "📤 Pushing code to GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Code pushed successfully!"
        echo ""
        echo "🔗 Repository URL: https://github.com/$(gh api user --jq .login)/$REPO_NAME"
        echo ""
        echo "📋 Next Steps:"
        echo "1. 🚂 Deploy backend to Railway:"
        echo "   - Go to https://railway.app"
        echo "   - Connect your GitHub repo"
        echo "   - Set environment: SPRING_PROFILES_ACTIVE=prod"
        echo ""
        echo "2. ⚡ Deploy frontend to Vercel:"
        echo "   - Go to https://vercel.com"
        echo "   - Import your GitHub repo"
        echo "   - Root directory: public/"
        echo ""
        echo "3. 🔧 Update API URL:"
        echo "   - After backend deployment, update the URL in public/js/dashboard.js"
        echo "   - Replace 'your-backend-url.railway.app' with actual URL"
        echo ""
        echo "🎉 Deployment setup complete!"
    else
        echo "❌ Failed to push code to GitHub"
    fi
else
    echo "❌ Failed to create GitHub repository"
    echo "💡 You may need to authenticate first: gh auth login"
fi
