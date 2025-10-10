# Vercel Deployment Guide for Cinephile

## 🚀 Complete Step-by-Step Deployment Guide

### Prerequisites
- [x] GitHub account
- [x] Vercel account (sign up at https://vercel.com)
- [x] Supabase project with authentication enabled
- [x] TMDB API key (from https://www.themoviedb.org/settings/api)

---

## Part 1: Prepare Your GitHub Repository

### Step 1: Initialize Git Repository (if not already done)

```bash
cd /Users/yugkhandelwal/Downloads/Cinephile
git init
git add .
git commit -m "Initial commit: Cinephile movie app"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `cinephile` (or your preferred name)
3. Description: "A modern movie discovery and recommendation platform"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

### Step 3: Push to GitHub

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/cinephile.git

# Push your code
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Part 2: Configure Supabase for Production

### Step 1: Set Up Supabase Authentication

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel deployment URL to **Site URL** and **Redirect URLs**:
   - Site URL: `https://your-project-name.vercel.app`
   - Redirect URLs:
     - `https://your-project-name.vercel.app/auth`
     - `https://your-project-name.vercel.app`
     - `http://localhost:8080` (for local development)

### Step 2: Configure OAuth Providers (if using Google/GitHub login)

#### For Google OAuth:
1. Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Enable Google provider
3. Add authorized redirect URIs:
   - `https://your-supabase-project.supabase.co/auth/v1/callback`
   - `https://your-project-name.vercel.app`

#### For GitHub OAuth:
1. Supabase Dashboard → **Authentication** → **Providers** → **GitHub**
2. Enable GitHub provider
3. Add callback URL: `https://your-supabase-project.supabase.co/auth/v1/callback`

### Step 3: Get Your Supabase Credentials

1. Supabase Dashboard → **Settings** → **API**
2. Copy these values (you'll need them for Vercel):
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

---

## Part 3: Deploy to Vercel

### Step 1: Import Project to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your **cinephile** repository from GitHub
5. Click **"Import"**

### Step 2: Configure Build Settings

Vercel should auto-detect Vite. Verify these settings:

- **Framework Preset**: Vite
- **Root Directory**: `./` (leave as is)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Add Environment Variables

In the Vercel project configuration, add these environment variables:

Click **"Environment Variables"** and add:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `VITE_TMDB_API_KEY` | Your TMDB API key | Production, Preview, Development |
| `VITE_TMDB_API_READ_ACCESS_TOKEN` | Your TMDB read token (optional) | Production, Preview, Development |

**Where to find these:**

**Supabase:**
- Dashboard → Settings → API
- Copy "Project URL" and "anon public" key

**TMDB:**
- Go to https://www.themoviedb.org/settings/api
- Copy your API Key (v3 auth)
- Optionally copy API Read Access Token (v4 auth)

### Step 4: Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://cinephile-xxxxx.vercel.app`

---

## Part 4: Post-Deployment Configuration

### Step 1: Update Supabase URLs

Now that you have your Vercel URL, update Supabase:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Update **Site URL**: `https://your-actual-vercel-url.vercel.app`
3. Add to **Redirect URLs**:
   - `https://your-actual-vercel-url.vercel.app/*`
   - `https://your-actual-vercel-url.vercel.app/auth`

### Step 2: Add Custom Domain (Optional)

1. In Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `cinephile.com`)
4. Follow DNS configuration instructions
5. Update Supabase redirect URLs with your custom domain

### Step 3: Test Your Deployment

Visit your Vercel URL and test:
- [ ] Homepage loads correctly
- [ ] Movies and TV shows display
- [ ] Search functionality works
- [ ] User registration/login works
- [ ] Google/GitHub OAuth works (if configured)
- [ ] Watchlist functionality works
- [ ] Recommendations work
- [ ] Account settings page works

---

## Part 5: Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push origin main
```

Vercel will automatically:
1. Detect the push
2. Build your project
3. Deploy to production
4. Keep your previous deployment as backup

### Preview Deployments

For branches other than `main`:

```bash
git checkout -b feature/new-feature
git add .
git commit -m "Working on new feature"
git push origin feature/new-feature
```

Vercel creates a **preview deployment** with a unique URL for testing.

---

## Part 6: Environment Variables Management

### For Local Development

Create a `.env.local` file (already gitignored):

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your actual values:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx...
VITE_TMDB_API_KEY=xxxxx
VITE_TMDB_API_READ_ACCESS_TOKEN=xxxxx
```

### For Production

Environment variables are already set in Vercel Dashboard (Step 3 above).

---

## Part 7: Monitoring & Analytics

### Vercel Analytics (Optional)

1. Vercel Dashboard → Your Project → **Analytics**
2. Enable Vercel Analytics (free tier available)
3. View real-time traffic, page views, and performance

### Error Monitoring

Check deployment logs:
1. Vercel Dashboard → Your Project → **Deployments**
2. Click on latest deployment
3. View **Build Logs** and **Function Logs**

---

## Troubleshooting Common Issues

### Issue 1: Build Fails

**Error**: `Module not found` or `Cannot resolve module`

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build  # Test locally
```

### Issue 2: Environment Variables Not Working

**Symptoms**: API calls fail, Supabase errors

**Solution**:
1. Check all env vars start with `VITE_`
2. Redeploy after adding env vars
3. Clear cache: Vercel Dashboard → Settings → Clear Cache

### Issue 3: Authentication Not Working

**Symptoms**: Login redirects fail, OAuth errors

**Solution**:
1. Check Supabase redirect URLs include your Vercel domain
2. Ensure Site URL in Supabase matches your deployment
3. Check OAuth provider callback URLs

### Issue 4: 404 on Refresh

**Symptoms**: Page works initially but 404 on refresh

**Solution**: Already fixed with `vercel.json` rewrites config!

### Issue 5: TMDB Images Not Loading

**Symptoms**: Poster images broken

**Solution**: 
- Check TMDB API key is valid
- Verify env variable `VITE_TMDB_API_KEY` is set
- Check browser console for CORS errors

---

## Project Structure for Deployment

```
cinephile/
├── .env.example              # Template for environment variables
├── .gitignore                # Already configured
├── vercel.json               # Vercel configuration (created)
├── package.json              # Dependencies
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── index.html               # Entry point
├── src/                     # Source code
├── public/                  # Static assets
└── dist/                    # Build output (generated)
```

---

## Security Checklist

- [x] Environment variables use `VITE_` prefix
- [x] `.env.local` is in `.gitignore`
- [x] Sensitive keys are in Vercel environment variables
- [x] Supabase Row Level Security (RLS) enabled
- [x] CORS configured in Supabase
- [x] Security headers in `vercel.json`
- [x] HTTPS enforced (automatic with Vercel)

---

## Performance Optimization

Already implemented in your project:
- ✅ React lazy loading for routes
- ✅ Image lazy loading
- ✅ Code splitting
- ✅ Vite build optimization
- ✅ React Query caching
- ✅ Service worker for offline support

Vercel automatically adds:
- ✅ CDN distribution
- ✅ Automatic compression (gzip/brotli)
- ✅ Image optimization
- ✅ Edge caching

---

## Quick Command Reference

```bash
# Local Development
npm run dev                    # Start dev server
npm run build                  # Test production build
npm run preview                # Preview production build

# Git & GitHub
git status                     # Check changes
git add .                      # Stage all changes
git commit -m "message"        # Commit changes
git push origin main           # Push to GitHub (triggers Vercel deploy)

# Vercel CLI (optional)
npm i -g vercel               # Install Vercel CLI
vercel                        # Deploy from CLI
vercel --prod                 # Deploy to production
vercel logs                   # View logs
vercel env pull              # Pull env vars to local
```

---

## Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Deployment**: https://vercel.com/docs/deployments/overview
- **Supabase Docs**: https://supabase.com/docs
- **TMDB API**: https://developers.themoviedb.org/3
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html

---

## Next Steps After Deployment

1. **Set up custom domain** (optional)
2. **Enable Vercel Analytics** for traffic insights
3. **Configure Vercel Speed Insights** for performance monitoring
4. **Set up Sentry** or error tracking (optional)
5. **Add OG images** for social media previews
6. **Configure sitemap.xml** for SEO
7. **Add robots.txt** for search engines

---

## Deployment Checklist

Before going live, verify:

- [ ] All environment variables are set in Vercel
- [ ] Supabase redirect URLs include your Vercel domain
- [ ] TMDB API key is valid and working
- [ ] Test user registration and login
- [ ] Test OAuth providers (Google/GitHub)
- [ ] Verify watchlist functionality
- [ ] Check account settings page
- [ ] Test search functionality
- [ ] Verify movie/TV show details load
- [ ] Check responsive design on mobile
- [ ] Test in different browsers
- [ ] Verify all images load correctly
- [ ] Check console for errors
- [ ] Test error boundaries

---

**🎉 Your Cinephile app is now ready for deployment!**

**Estimated deployment time**: 5-10 minutes  
**First build time**: 2-3 minutes  
**Subsequent builds**: 1-2 minutes

Need help? Check the troubleshooting section or Vercel's excellent documentation.

---

**Last Updated**: October 11, 2025  
**Status**: ✅ Ready for Deployment
