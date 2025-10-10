# 🚀 Quick Deployment Checklist

## Before You Start

### 1. Get Your API Keys Ready

**TMDB API Key:**
- [ ] Go to https://www.themoviedb.org/settings/api
- [ ] Copy your API Key (v3 auth)
- [ ] Optionally copy API Read Access Token

**Supabase Credentials:**
- [ ] Go to https://supabase.com/dashboard
- [ ] Select your project
- [ ] Go to Settings → API
- [ ] Copy Project URL (e.g., `https://xxxxx.supabase.co`)
- [ ] Copy anon/public key (starts with `eyJ...`)

---

## Step-by-Step Deployment (5 minutes)

### Step 1: Setup GitHub Repository

```bash
# In your project directory
cd /Users/yugkhandelwal/Downloads/Cinephile

# Run the deployment helper script
./deploy-setup.sh
```

Or manually:

```bash
# Initialize git (if not done)
git init

# Commit all changes
git add .
git commit -m "Initial commit: Ready for deployment"

# Create GitHub repository at https://github.com/new
# Then add remote and push:
git remote add origin https://github.com/YOUR_USERNAME/cinephile.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com/new
2. **Import Repository**: Select your `cinephile` GitHub repo
3. **Configure Project**:
   - Framework: Vite (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variables**:

   Click "Environment Variables" and add:

   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxxxx...
   VITE_TMDB_API_KEY=xxxxx
   VITE_TMDB_API_READ_ACCESS_TOKEN=xxxxx (optional)
   ```

   Select: ✅ Production ✅ Preview ✅ Development

5. **Click "Deploy"** and wait 2-3 minutes

### Step 3: Configure Supabase

After deployment, you'll get a URL like: `https://cinephile-xxxxx.vercel.app`

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://your-vercel-url.vercel.app`
3. Add **Redirect URLs**:
   ```
   https://your-vercel-url.vercel.app/*
   https://your-vercel-url.vercel.app/auth
   http://localhost:8080
   ```

### Step 4: Test Your Deployment

- [ ] Visit your Vercel URL
- [ ] Homepage loads
- [ ] Movies display correctly
- [ ] Search works
- [ ] Login/Register works
- [ ] Watchlist works
- [ ] Account settings accessible

---

## Environment Variables Reference

| Variable | Where to Get It | Required |
|----------|----------------|----------|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | ✅ Yes |
| `VITE_TMDB_API_KEY` | https://www.themoviedb.org/settings/api | ✅ Yes |
| `VITE_TMDB_API_READ_ACCESS_TOKEN` | TMDB Settings → API | ⚪ Optional |

---

## OAuth Setup (Optional)

### Google OAuth

1. **Supabase**: Authentication → Providers → Google → Enable
2. **Google Console**: https://console.cloud.google.com
   - Create OAuth 2.0 credentials
   - Add authorized redirect: `https://xxxxx.supabase.co/auth/v1/callback`
3. Copy Client ID and Secret to Supabase

### GitHub OAuth

1. **Supabase**: Authentication → Providers → GitHub → Enable
2. **GitHub**: Settings → Developer Settings → OAuth Apps → New
   - Homepage URL: `https://your-vercel-url.vercel.app`
   - Callback URL: `https://xxxxx.supabase.co/auth/v1/callback`
3. Copy Client ID and Secret to Supabase

---

## Troubleshooting

### Build Fails
```bash
# Test build locally first
npm run build

# If fails, check:
# - All imports are correct
# - No TypeScript errors
# - All dependencies installed
```

### Login Not Working
- Check Supabase redirect URLs include your Vercel domain
- Verify environment variables are set correctly
- Check browser console for errors

### Images Not Loading
- Verify TMDB API key is correct
- Check browser network tab for failed requests
- Ensure CORS is not blocking requests

### 404 on Page Refresh
- Already fixed with `vercel.json` configuration!
- If still occurs, check Vercel Dashboard → Settings → Rewrites

---

## Post-Deployment

### Monitor Your Site
- **Vercel Analytics**: Project → Analytics (enable for free)
- **Deployment Logs**: Project → Deployments → View Logs
- **Runtime Logs**: Available in real-time

### Update Your Site
```bash
# Make changes
git add .
git commit -m "Update: description"
git push origin main
```
Vercel auto-deploys on push! 🎉

---

## Quick Links

- **Your Project**: Check email from Vercel for URL
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **TMDB API**: https://www.themoviedb.org/settings/api
- **Full Guide**: See `VERCEL_DEPLOYMENT_GUIDE.md`

---

## Need Help?

1. Check `VERCEL_DEPLOYMENT_GUIDE.md` for detailed instructions
2. Vercel Docs: https://vercel.com/docs
3. Supabase Docs: https://supabase.com/docs
4. TMDB API Docs: https://developers.themoviedb.org/3

---

**⏱️ Total Time: 5-10 minutes**  
**📦 Files Created:**
- ✅ `vercel.json` - Vercel configuration
- ✅ `.env.example` - Environment template
- ✅ `deploy-setup.sh` - Deployment helper script
- ✅ `VERCEL_DEPLOYMENT_GUIDE.md` - Complete guide
- ✅ `DEPLOYMENT_CHECKLIST.md` - This checklist

**🎉 You're ready to deploy!**
