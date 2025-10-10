# GitHub Repository Setup Commands

## Quick Setup (Copy & Paste)

### 1. Initialize Git (if not already done)
```bash
cd /Users/yugkhandelwal/Downloads/Cinephile
git init
```

### 2. Commit All Files
```bash
git add .
git commit -m "Initial commit: Cinephile - Modern movie discovery platform"
```

### 3. Create GitHub Repository

Go to: https://github.com/new

**Settings:**
- Repository name: `cinephile` (or your choice)
- Description: `A modern movie and TV show discovery platform with personalized recommendations`
- Visibility: Public or Private (your choice)
- ❌ DO NOT initialize with README, .gitignore, or license (we already have these)

Click "Create repository"

### 4. Push to GitHub

**After creating the repository, GitHub will show you commands. Use these:**

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/cinephile.git

# Set branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

---

## Alternative: Using Deploy Script

```bash
# Make script executable (if not already)
chmod +x deploy-setup.sh

# Run the helper script
./deploy-setup.sh
```

The script will guide you through the process interactively!

---

## Verify Upload

After pushing, verify at: `https://github.com/YOUR_USERNAME/cinephile`

You should see all your files uploaded!

---

## Next: Deploy to Vercel

1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `cinephile` repository
4. Follow the deployment checklist

**Full instructions in:**
- `DEPLOYMENT_CHECKLIST.md` - Quick guide (5 mins)
- `VERCEL_DEPLOYMENT_GUIDE.md` - Complete guide with screenshots

---

## Common Git Commands

```bash
# Check status
git status

# View commit history
git log --oneline

# Create new branch
git checkout -b feature/new-feature

# Switch back to main
git checkout main

# Pull latest changes
git pull origin main

# Push changes
git push origin main
```

---

## Troubleshooting

### "fatal: remote origin already exists"
```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/cinephile.git
```

### "Updates were rejected because the remote contains work"
```bash
# Force push (only if this is your first push and you're sure)
git push -u origin main --force
```

### "Permission denied (publickey)"
```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/YOUR_USERNAME/cinephile.git
```

Or set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

---

## Files That Will Be Uploaded

✅ All source code (`src/`)  
✅ Configuration files (`vite.config.ts`, `tsconfig.json`, etc.)  
✅ `package.json` and `package-lock.json`  
✅ Documentation (README, guides)  
✅ `vercel.json` (deployment config)  

❌ NOT uploaded (gitignored):  
- `node_modules/`
- `dist/`
- `.env.local`
- `*.log`

---

**Ready? Let's deploy! 🚀**

Next: Open `DEPLOYMENT_CHECKLIST.md` for deployment steps.
