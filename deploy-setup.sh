#!/bin/bash

# Cinephile - Quick Deployment Setup Script
# This script helps you prepare and deploy to Vercel

set -e

echo "🎬 Cinephile - Vercel Deployment Helper"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${YELLOW}📦 Git repository not initialized. Initializing...${NC}"
    git init
    echo -e "${GREEN}✓ Git initialized${NC}"
else
    echo -e "${GREEN}✓ Git repository exists${NC}"
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    echo ""
    read -p "Do you want to commit all changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        echo "Enter commit message:"
        read commit_msg
        git commit -m "$commit_msg"
        echo -e "${GREEN}✓ Changes committed${NC}"
    fi
else
    echo -e "${GREEN}✓ No uncommitted changes${NC}"
fi

# Check if remote origin exists
if ! git remote | grep -q "origin"; then
    echo ""
    echo -e "${YELLOW}📡 No remote repository configured${NC}"
    echo "Please enter your GitHub repository URL:"
    echo "Example: https://github.com/username/cinephile.git"
    read repo_url
    git remote add origin "$repo_url"
    echo -e "${GREEN}✓ Remote repository added${NC}"
else
    echo -e "${GREEN}✓ Remote repository configured${NC}"
fi

# Check .env.local exists
if [ ! -f .env.local ]; then
    echo ""
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo "Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo -e "${GREEN}✓ .env.local created${NC}"
    echo -e "${RED}⚠️  IMPORTANT: Please edit .env.local and add your API keys!${NC}"
    echo ""
    read -p "Press enter to continue..."
fi

# Run build test
echo ""
echo -e "${YELLOW}🔨 Testing production build...${NC}"
if npm run build; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed. Please fix errors before deploying.${NC}"
    exit 1
fi

# Push to GitHub
echo ""
echo -e "${YELLOW}📤 Pushing to GitHub...${NC}"
current_branch=$(git branch --show-current)
if [ -z "$current_branch" ]; then
    current_branch="main"
    git branch -M main
fi

read -p "Push to GitHub branch '$current_branch'? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push -u origin "$current_branch"
    echo -e "${GREEN}✓ Pushed to GitHub${NC}"
fi

# Summary
echo ""
echo "========================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Click 'Add New...' → 'Project'"
echo "3. Import your GitHub repository"
echo "4. Add environment variables (see VERCEL_DEPLOYMENT_GUIDE.md)"
echo "5. Click 'Deploy'"
echo ""
echo "📖 Full guide: VERCEL_DEPLOYMENT_GUIDE.md"
echo ""
echo "Environment variables you'll need in Vercel:"
echo "  - VITE_SUPABASE_URL"
echo "  - VITE_SUPABASE_ANON_KEY"
echo "  - VITE_TMDB_API_KEY"
echo "  - VITE_TMDB_API_READ_ACCESS_TOKEN (optional)"
echo ""
echo -e "${GREEN}🚀 Happy deploying!${NC}"
