# Cinephile Component Inventory

## Core Layout Components

### Navbar (`src/shared/components/layout/Navbar.tsx`)
- **Purpose:** Primary navigation header.
- **Features:** Responsive hamburger menu, ThemeToggle, Search trigger, Auth state rendering, ContentMode toggle (Movies vs Anime).
- **Should Redesign:** Minor polish. The mobile menu could use better exit animations.

### Footer (`src/shared/components/layout/Footer.tsx`)
- **Purpose:** Standard site footer with links and legal.
- **Should Redesign:** Low priority. Clean and functional.

## Display Components

### MediaCard (`src/shared/components/MediaCard.tsx`)
- **Purpose:** Displays movie/TV/anime posters with hover effects, ratings, and quick-add-to-watchlist actions.
- **Variants:** Portrait poster mode (default), Landscape backdrop mode.
- **Animations:** Extensive Framer Motion hover states.
- **Where Used:** Grids, carousels, search results.
- **Should Redesign:** Core component. Highly reusable, but could benefit from Skeleton loading states baked directly into the component.

### ContinueWatchingCarousel (`src/shared/components/ContinueWatchingCarousel.tsx`)
- **Purpose:** Renders the massive, premium landscape cards for resuming playback.
- **Features:** Real-time progress bar, responsive sizing, filter prop (`movies_tv` | `anime`).
- **Should Redesign:** Recently redesigned. Currently state-of-the-art.

### ContentRail (`src/shared/components/ContentRail.tsx`)
- **Purpose:** Horizontal scrolling carousel for categories (e.g., "Trending", "Top Rated").
- **Features:** Snap scrolling, hides scrollbar, uses `MediaCard`.
- **Should Redesign:** Could benefit from visible left/right navigation arrows on desktop for users without trackpads.

### InfiniteGrid & VirtualGrid (`src/shared/components/InfiniteGrid.tsx`)
- **Purpose:** Renders massive lists of content efficiently using infinite scrolling.
- **Features:** IntersectionObserver integration for fetching next pages.
- **Should Redesign:** High priority for performance tuning. Ensure virtualization is properly utilized if lists exceed 100 items.

## UI Elements (shadcn/ui based)
Located in `src/shared/components/ui/`
- **Button, Input, Select, Sheet, Dialog, DropdownMenu, Toast, Slider, Progress.**
- **Purpose:** Standardized building blocks.
- **Styling:** Controlled via `tailwind.config.ts` and `index.css` CSS variables.
- **Should Redesign:** Do not rewrite the logic (managed by Radix UI), but update CSS variables and radius tokens in `index.css` to globally shift the aesthetic if a redesign is requested.

## Utility Components

### ErrorBoundary & RouteErrorBoundary
- **Purpose:** Catches rendering errors to prevent white screens of death. Displays fallback UI.
- **Where Used:** Wrapped around every route in `App.tsx`.

### SEO & MovieSEO
- **Purpose:** Injects meta tags via `react-helmet-async` for rich previews.

### PageTransition
- **Purpose:** Wraps routes in `framer-motion` to provide smooth fade/slide transitions during client-side navigation.
