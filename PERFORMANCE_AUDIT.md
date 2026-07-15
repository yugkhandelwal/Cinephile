# Cinephile Performance Audit

## 17. Performance Audit

### Bundle Size & Code Splitting
- **Current State:** The application utilizes React `lazy` and `Suspense` in `App.tsx` for route-based code splitting. 
  - `Landing`, `Index`, `Movies`, `TVShows`, `Player`, and `Anime` routes are all lazy-loaded.
- **Strengths:** Excellent foundational setup. Users visiting the Landing page do not download the Player or Anime logic.
- **Opportunities:** Heavy third-party libraries (like `framer-motion`, `recharts`, `react-player`) could be further aggressively chunked using Vite's `manualChunks` configuration in `vite.config.ts`.

### Caching & Network Strategy
- **Current State:** `setupPersistentCache(queryClient)` is used to persist TanStack React Query data to IndexedDB/LocalStorage.
  - `staleTime` and `gcTime` are set to 24 hours globally in `App.tsx`.
- **Strengths:** Instantaneous subsequent page loads. Returning users experience zero network waterfalls for content they've already browsed.
- **Bottlenecks:** The homepage fires multiple parallel queries (Trending, Popular, Top Rated, Genres). While cached, the initial cold boot can result in 6-10 simultaneous TMDB API requests.
- **Fix:** Implement query batching or combine the initial data fetch via a single backend endpoint (BFF) if backend architecture allows.

### Rendering & Hydration
- **Current State:** Pure SPA (Single Page Application). No server-side rendering (SSR) or Static Site Generation (SSG) is configured natively, though it runs on Vercel.
- **Re-renders:** The Continue Watching hook was recently optimized to use a 1s interval synchronized via custom Window events. This could trigger frequent React re-renders in the `ContinueWatchingCarousel`. 
- **Fix:** Ensure the Carousel uses `memo` and that only the progress bar inner `div` repaints, rather than the entire card, to maintain 60fps animations.

### Image Optimization
- **Current State:** TMDB provides highly optimized images. The app uses standard `<img>` tags.
- **Bottlenecks:** Loading 20 high-res posters per `ContentRail` (with 5-6 rails per page) downloads dozens of megabytes of images.
- **Fix:** 
  1. Enforce `loading="lazy"` on all off-screen `MediaCard` images.
  2. Implement an `<Image />` component wrapper that uses blurhash or low-quality image placeholders (LQIP) while loading.

### Largest Pages & Bottlenecks
- **Search Page (`/search`):** Real-time keystroke searching can cause layout thrashing if not heavily debounced. Ensure `useDebounce` is utilized and that the DOM isn't re-painting 50 posters on every keystroke.
- **Player Page (`/play/:type/:id`):** The iframe itself is incredibly heavy (third-party scripts, ads, trackers). The app isolates this by completely unmounting the standard layout (Navbar/Footer) when on the player route. This is the correct approach.

## Recommendations for Future AI Optimization
When refactoring components, always:
1. Wrap large list items in `React.memo`.
2. Extract heavy state (like current time in a video player) as far down the component tree as possible.
3. Utilize `Virtuoso` or `@tanstack/react-virtual` for any list exceeding 50 items (e.g., full genre browsing).
