# PWA Setup Guide

## Task 7: Progressive Web App Implementation

### Status: Ready for Installation

All PWA configuration files have been created and are ready to use. You just need to install the required package.

---

## Quick Setup (3 Steps)

### 1. Install vite-plugin-pwa

First, install Node.js if you haven't already (download from https://nodejs.org)

Then run ONE of these commands in the project directory:

```bash
npm install -D vite-plugin-pwa
# OR
yarn add -D vite-plugin-pwa
# OR
pnpm add -D vite-plugin-pwa
# OR
bun add -D vite-plugin-pwa
```

### 2. Uncomment PWA Configuration

Open `vite.config.ts` and:
- Uncomment line 5: `import { VitePWA } from "vite-plugin-pwa";`
- Uncomment lines 16-74: The entire `VitePWA({ ... })` plugin configuration

### 3. Add PWA Icons

Create these icon files in the `public/` directory:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

You can use your existing logo/branding, or create simple icons using:
- Canva: https://canva.com
- Figma: https://figma.com
- Online icon generators

---

## What's Already Configured

✅ **manifest.json** - App metadata with:
- App name, description, theme colors
- Icon references (192x192, 512x512)
- Display mode: standalone
- Shortcuts to Search, Watchlist, Recommendations

✅ **index.html** - PWA meta tags:
- `theme-color` for browser UI
- Apple touch icon support
- Mobile web app capabilities
- Manifest link

✅ **vite.config.ts** - Service worker configuration (commented out):
- Auto-update registration
- Workbox caching strategies:
  - TMDb API: CacheFirst (24 hours)
  - TMDb Images: CacheFirst (7 days)
  - Static assets: Pre-cached
- Dev mode enabled for testing

---

## Features Enabled

### 📱 Installability
Users can install Cinephile as a native-like app on:
- Android (Chrome, Edge, Samsung Internet)
- iOS/iPadOS (Safari - Add to Home Screen)
- Desktop (Chrome, Edge, Firefox)

### 🚀 Offline Support
- **Static assets**: All HTML, CSS, JS files cached
- **TMDb API responses**: Cached for 24 hours
- **Movie/TV images**: Cached for 7 days
- **Fonts & icons**: Pre-cached on install

### 🎯 Performance Benefits
- Instant loading on repeat visits
- Reduced data usage (caching)
- Works in poor network conditions
- Fast image loading from cache

### 📍 App Shortcuts
Quick actions from home screen icon:
1. Search Movies
2. View Watchlist  
3. Get Recommendations

---

## Verification

After installation and uncommenting the config:

1. **Build the app**: `npm run build`
2. **Preview**: `npm run preview`
3. **Open in browser**: Usually http://localhost:4173
4. **Check DevTools**: 
   - Chrome DevTools → Application → Manifest
   - Should see Cinephile manifest details
   - Service Worker should be registered

5. **Test installation**:
   - Chrome: Address bar → Install icon
   - Mobile: Share menu → Add to Home Screen

---

## Troubleshooting

**Issue**: Icons not showing
- **Fix**: Ensure `icon-192.png` and `icon-512.png` exist in `public/`

**Issue**: Service worker not registering
- **Fix**: Make sure you uncommented both the import AND the plugin config in `vite.config.ts`

**Issue**: Manifest errors in DevTools
- **Fix**: Check `public/manifest.json` is valid JSON (no trailing commas)

**Issue**: Can't install app
- **Fix**: 
  - Must be served over HTTPS (or localhost)
  - Must have valid manifest
  - Must have service worker registered

---

## Custom Icon Guide

### Design Recommendations
- **Size**: Create at 512x512, then scale down to 192x192
- **Style**: Simple, recognizable icon (avoid text/detail)
- **Colors**: Use your brand colors (#8b5cf6 purple theme)
- **Safe area**: Keep important content in center 80%
- **Format**: PNG with transparency

### Example Tools
1. **Figma** (free): Create vector logo, export as PNG
2. **Canva** (free): Use icon templates
3. **RealFaviconGenerator**: https://realfavicongenerator.net
4. **PWA Asset Generator**: https://github.com/elegantapp/pwa-asset-generator

---

## Testing Checklist

- [ ] Package installed (`vite-plugin-pwa`)
- [ ] Config uncommented in `vite.config.ts`
- [ ] Icons created (192x192, 512x512)
- [ ] Build succeeds without errors
- [ ] Manifest loads in browser DevTools
- [ ] Service worker registers successfully
- [ ] Install prompt appears (desktop)
- [ ] Add to Home Screen works (mobile)
- [ ] App launches in standalone mode
- [ ] Offline mode works (disable network in DevTools)
- [ ] Images cache correctly
- [ ] API responses cache for 24h

---

## Next Steps After Setup

1. Test on real devices (Android phone, iPhone, etc.)
2. Optimize icon designs for different contexts
3. Add custom splash screens (iOS)
4. Configure badge notifications (future enhancement)
5. Add periodic background sync (future enhancement)
6. Implement push notifications (future enhancement)

---

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Workbox Strategies](https://developer.chrome.com/docs/workbox/modules/workbox-strategies/)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
