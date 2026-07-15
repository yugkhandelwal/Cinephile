# UI/UX Redesign Preparation Brief

## 26. UI/UX Redesign Brief for AI Agents

**Target Audience:** Future AI Agents tasked with overhauling the UI/UX of Cinephile.

### Objective
Your mission is to redesign the visual identity and user experience of Cinephile. You must output highly precise, implementation-ready React/Tailwind/Framer Motion code based on the existing architecture.

### What You Must Know BEFORE Writing Code
1. **The Architecture is Locked:** Do not attempt to rip out React Query, React Router, or Supabase. The data layer is complete and functional. Your focus is strictly on **Presentation and Interaction**.
2. **The App is Dual-Mode:** Cinephile has a TMDB side (Movies/TV) and a MAL side (Anime). They share components (`MediaCard`, `ContentRail`). Ensure your redesigns handle the specific data shapes of *both* modes (e.g., Anime cards often rely heavily on Japanese titles and different rating scales).
3. **The Theme is Strictly Dark:** The application enforces `forcedTheme="dark"`. Do not implement light mode variants. Focus on deep blacks, rich purples (`#9146FF`), glassmorphism (`backdrop-blur`), and neon glows.

### Critical Components to Overhaul
1. **Search Integration (Omnibar):**
   - **Current State:** Search exists on `/search` and `/anime/search`.
   - **Goal:** Build a global, unified Command Palette (`Cmd+K`) using `cmdk` that searches both TMDB and MAL simultaneously with instant debounced results.
2. **Shared Element Transitions:**
   - **Current State:** Basic fade between routes.
   - **Goal:** Implement `layoutId` from Framer Motion so clicking a `MediaCard` poster physically transforms and scales into the Hero poster on the Details page.
3. **Skeleton Loading:**
   - **Current State:** Global spinner.
   - **Goal:** Implement exact-dimension skeleton cards inside `ContentRail` that pulse while React Query fetches data.

### Design Guidelines & Constraints
- **Tailwind Setup:** Rely heavily on `src/index.css` for root CSS variables. If you want to change the border radius of all cards, change `--radius`, do not hardcode `rounded-3xl` everywhere.
- **Glassmorphism:** Use `bg-background/80 backdrop-blur-3xl border-b border-white/10` for floating elements (Navbars, Dialogs).
- **Typography:** Consider injecting a premium display font (e.g., `Outfit`, `Clash Display`) into `tailwind.config.ts` for headings (`h1`, `h2`), while keeping `Inter` for body text.

### Execution Strategy for AI
When instructed to "Redesign the MediaCard":
1. Read `COMPONENT_INVENTORY.md`.
2. Do not change the props interface unless absolutely necessary (it will break 15 other files).
3. Output the fully styled, animated React component using Tailwind and Framer Motion. 

*You are clear to begin generating implementation prompts.*
