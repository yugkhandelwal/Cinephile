# Cinephile UI & UX Audit

## 7. UI Analysis by Screen

### Homepage (`/home`)
- **Current Layout:** Hero carousel at top. Continue Watching row below. Multiple horizontal `ContentRail` rows (Trending, Top Rated, Action, etc.).
- **Strengths:** Highly visual, engaging auto-playing hero section.
- **Weaknesses:** Horizontal scrolling on desktop can be tedious without visual chevron arrows. 
- **UX Problems:** Hovering over a card instantly expands it, which can cause layout shifts or accidental clicks if the delay isn't calibrated perfectly.

### Media Details Page (`/movie/:id` & `/tv/:id`)
- **Current Layout:** Massive backdrop image with gradient overlay. Poster on left, metadata (title, overview, cast, genres) on right. Recommended rail at bottom.
- **Strengths:** Premium "cinematic" feel. Glassmorphism used effectively for the backdrop blur.
- **Missing Features:** Link to Trailer playback in a modal. Quick way to jump directly to specific seasons for TV shows without scrolling to the bottom.

### Anime Home (`/anime`)
- **Current Layout:** Separate ecosystem but mirrors the standard Homepage structure. Includes "Seasonal Anime" specific sections.
- **Improvement Opportunities:** Visually distinguish the Anime portal from the standard portal (perhaps a distinct primary color or theme variant) so users intuitively know which mode they are in.

### Player (`/play/:type/:id`)
- **Current Layout:** Full-bleed video iframe. Absolute positioned back button. Side `Sheet` for episode selection (TV/Anime).
- **Strengths:** Distraction-free. TV/Anime episode selector is well integrated.
- **Weaknesses:** Iframe ad-blocker reliance. If a server has popups, the UI cannot prevent it.
- **Improvement:** Better error states if the iframe fails to load.

## 8. Design System Audit

- **Typography:** Uses Inter (via standard Tailwind sans). Very legible, but lacks a distinct "cinematic" display font for large headings (e.g., Oswald or Playfair Display).
- **Colors:** Deep dark mode (`bg-background` is near black). Primary color is a vibrant purple (`#9146FF` or similar).
- **Cards:** Heavy use of border radius (`rounded-xl` or `2xl`).
- **Glassmorphism:** Extensive use of `bg-black/50 backdrop-blur-md` across the app (Navbar, Modals, Details pages).
- **Theme:** The app enforces `forcedTheme="dark"` in `App.tsx`. Light mode is not supported and would require a massive overhaul of hardcoded `white/10` opacities if ever implemented.

## 9. Animation Audit

- **Page Transitions:** Entire app uses `AnimatePresence` and `PageTransition.tsx` (fade in/out on route change).
- **Hover States:** `MediaCard` scales up slightly (`hover:scale-105`) with a CSS transition.
- **Missing Opportunities:**
  - **Shared Element Transitions:** Clicking a poster in a grid should seamlessly expand into the Details page poster (Framer Motion `layoutId`).
  - **Staggered Lists:** Grids load all at once. They should cascade in.

## 20. UX Audit

- **Confusing Flows:** Navigating between "Movies" and "Anime" requires toggling a mode in the navbar or navigating to distinct routes. If a user searches for an anime while in "Movie" mode, they won't find it. The search bar must clearly communicate its current scope.
- **Missing Loading States:** While `GlobalLoader` exists, there should be more localized skeleton loaders inside the `ContentRail` when React Query is fetching in the background.

## 21. UI Improvement Opportunities

| Feature | Priority | Effort | Suggested Direction |
|---------|----------|--------|---------------------|
| Omnibar Search | High | High | Merge TMDB/MAL search into one command palette (Cmd+K style). |
| Shared Element Transitions | Medium | High | Use Framer Motion layoutId for poster-to-details transition. |
| Skeleton Loaders | High | Low | Replace blank rails with shimmering card skeletons. |
| Rail Nav Arrows | Medium | Low | Add absolute positioned Left/Right arrows on hover for desktop rails. |
