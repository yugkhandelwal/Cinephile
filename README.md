# Cinephile

Cinephile is a Vite + React + TypeScript app styled with Tailwind CSS and shadcn/ui. Track, discover, and experience movies and TV shows.

## Development

Requirements:

- Node.js 18+ and npm
- A TMDb API Read Access Token (v4)

Setup:

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
npm run dev
```

Environment variables (.env):

```
VITE_TMDB_READ_TOKEN="<TMDB v4 API Read Access Token>"
# OR alternatively, use the v3 API key if you prefer query-string auth
VITE_TMDB_API_KEY="<TMDB v3 API Key>"
VITE_SUPABASE_URL="<your-supabase-url>"
VITE_SUPABASE_PUBLISHABLE_KEY="<your-supabase-anon-key>"
```

## Tech stack

- Vite
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui

## Build and preview

```sh
npm run build
npm run preview
```

## License

This project is yours to customize. Add your preferred license.
