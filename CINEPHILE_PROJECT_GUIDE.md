# Cinephile Project Guide

## 1. Project Overview
Cinephile is a modern, high-performance web application designed for movie, TV show, and anime enthusiasts. It serves as a unified platform to discover, track, and watch content from multiple sources (TMDB for western media, MAL for anime). 

**Target Users:** Entertainment enthusiasts looking for a premium, single-pane-of-glass experience for tracking and streaming media.
**Current Maturity:** Advanced prototype / Production-ready frontend with robust TMDB/MAL integrations and Supabase backend.
**Major Features:**
- Universal Continue Watching system with real-time sync.
- Comprehensive search and filtering.
- Watchlist and ratings management.
- Built-in video player with multiple server fallbacks.
- Dedicated Anime portal.

## 2. Technology Stack
**Core:**
- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6

**UI & Styling:**
- **CSS Framework:** Tailwind CSS
- **Component Library:** Radix UI / shadcn/ui
- **Animation:** Framer Motion, tailwindcss-animate
- **Icons:** Lucide React
- **Theme:** next-themes (Dark mode native)

**Data & State Management:**
- **Server State:** TanStack React Query (v5) with Persist Client
- **Local State:** React Context (AuthProvider, ContentModeProvider, RatingsProvider)
- **Local Storage:** Used for history/continue watching (`cinephile_continue_watching`)

**Backend & APIs:**
- **Backend/Auth:** Supabase (PostgreSQL, GoTrue Auth)
- **Primary Data API (Movies/TV):** TMDB API
- **Secondary Data API (Anime):** Jikan / MyAnimeList (MAL) API
- **Analytics:** Vercel Analytics

## 3. Folder Structure
```text
src
 ├── context         # React Context providers (Auth, Content, Ratings, Search)
 ├── features        # Feature-based module organization
 │    ├── account    # User settings and profile management
 │    ├── anime      # Dedicated anime portal (Browse, Details, Player, Seasonal)
 │    ├── auth       # Authentication flows (Login/Signup via Supabase)
 │    ├── home       # Main landing and discovery dashboard
 │    ├── landing    # Pre-auth marketing landing page
 │    ├── movies     # Movie-specific discovery and details
 │    ├── player     # Embedded video playback and server selection
 │    ├── search     # Universal search functionality
 │    ├── tv-shows   # TV Show specific discovery
 │    └── watchlist  # User watchlist management
 ├── shared          # Reusable cross-feature code
 │    ├── api        # API clients (MAL, Supabase, TMDB)
 │    ├── components # Reusable UI (Cards, Carousels, SEO, Loaders, shadcn/ui)
 │    ├── hooks      # Custom React hooks (useContinueWatching, useLocalStorage, etc.)
 │    └── lib        # Utilities, formatters, performance trackers
 └── vite-env.d.ts   # Vite environment types
```

## 4. Route Map
- `/` - **Landing Page** (Pre-auth marketing, uses Hero components).
- `/home` - **Homepage** (Post-auth dashboard, Trending, Continue Watching).
- `/movies` - **Movies Portal** (Movie discovery).
- `/tv-shows` - **TV Shows Portal** (TV discovery).
- `/anime` - **Anime Portal** (Anime specific homepage).
- `/anime/seasonal` - **Seasonal Anime** (Current/Upcoming seasons).
- `/anime/search` - **Anime Search** (MAL-based search).
- `/anime/browse` - **Anime Browse** (Genre filtering).
- `/anime/watch/:id` - **Anime Player** (Anime playback).
- `/anime/:id` - **Anime Details** (MAL details).
- `/movie/:id` & `/tv/:id` - **Media Details** (Semantic SEO routes for TMDB details).
- `/play/:type/:id` - **Media Player** (TMDB video playback).
- `/search` - **Universal Search** (TMDB unified search).
- `/watchlist` - **Watchlist** (Protected, uses Supabase DB).
- `/auth` - **Authentication** (Login/Signup).
- `/account` - **Account Settings** (Profile management).

## 5. Feature Inventory
- **Authentication:** Complete (Supabase Email/Password + OAuth).
- **TMDB Discovery:** Complete (Trending, Popular, Top Rated).
- **MAL Discovery:** Complete (Seasonal, Top Anime).
- **Universal Player:** Complete (Supports Movies, TV with episode selection, and Anime via iframe scraping/embeds).
- **Continue Watching:** Complete (Local storage based, 1s real-time sync across tabs).
- **Watchlist:** Complete (Supabase synced).
- **PWA Support:** Partial/Planned (Manifest and offline indicators exist, service workers need tuning).
- **Search:** Complete (Debounced, multi-category).

## 10. State Management
- **Global Server State:** Managed exclusively by `React Query`. High cache times (24h) and persistent storage are used to reduce API calls.
- **Global Client State:** Managed via React Context:
  - `AuthProvider`: Manages Supabase session.
  - `ContentModeProvider`: Toggles between general media and anime focus.
  - `RatingsProvider`: Syncs user ratings with Supabase.
- **Local State:** Standard `useState` / `useReducer` inside features. LocalStorage is used heavily for non-critical transient data (Continue Watching).

## 11. API Documentation
- **TMDB Integration (`src/shared/api/tmdb`):** Uses standard REST endpoints. Handled via Axios/Fetch inside custom React Query hooks (`useDetails`, `useSeason`, etc.). Features intelligent caching.
- **MAL/Jikan Integration (`src/shared/api/mal`):** Used for anime metadata. Handled similarly via React Query.
- **Supabase (`src/shared/api/supabase`):** Uses `@supabase/supabase-js`. Tables include `watchlist`, `ratings`, and `profiles`.

## 12. Database Architecture
- **Supabase (PostgreSQL):**
  - `users` (managed by GoTrue)
  - `profiles` (extends user data)
  - `watchlist` (FK to profiles, stores `media_id`, `media_type`)
  - `ratings` (user ratings for content)
- **Local Storage:**
  - `cinephile_continue_watching`: JSON array of objects storing `contentId`, `currentTime`, `duration`, `progressPercentage`.

## 14. Player System
The player system (`src/features/player/Player.tsx` and `AnimePlayer.tsx`) is a crucial module.
- **Video Delivery:** Relies on third-party iframe embed servers (`vidking`, `vidsrc`, etc.).
- **Server Selection:** Users can toggle between multiple fallback servers if one is down.
- **Progress Tracking:** Since iframe origins are restricted, progress is "simulated" by tracking active time spent on the player route and persisting it locally every 1 second.
- **Episode Selection:** TV and Anime players include built-in `Sheet` components to switch episodes/seasons without leaving the player.

## 24. Technical Debt & Refactoring
- **Duplicate Player Logic:** `Player.tsx` and `AnimePlayer.tsx` share ~70% identical logic (progress saving, layout, server selection) but are split due to TMDB vs MAL data structures. Abstracting a core `BasePlayer` component is highly recommended.
- **Type Safety:** Ensure TMDB and MAL types are strictly enforced at the API boundary; currently some `any` types exist in deeply nested responses.
- **Component Colocation:** Some UI components in `shared/components` are only used by one feature and should be moved to their respective feature folders.

## 25. Future Roadmap
- **Short-term:** Merge TMDB and Anime search into a truly unified omnibar. Fix minor responsive layout shifts on mobile player.
- **Medium-term:** Implement a unified backend API (Next.js/Node) to mask TMDB/MAL API keys entirely (BFF pattern).
- **Long-term:** Social features (following friends' watchlists), integrated native video hosting (offboarding from third-party iframes).
