import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";

// https://vitejs.dev/config/
const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/api/mal": {
        target: "https://api.myanimelist.net/v2",
        changeOrigin: true,
        rewrite: (path) => {
          // Extract endpoint from query param ?endpoint=/anime/ranking
          const url = new URL(path, 'http://localhost');
          const endpoint = url.searchParams.get('endpoint');
          if (endpoint) {
            url.searchParams.delete('endpoint');
            return endpoint + (url.search ? url.search : '');
          }
          return path.replace(/^\/api\/mal/, "");
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            if (env.VITE_MAL_CLIENT_ID) {
              proxyReq.setHeader('X-MAL-CLIENT-ID', env.VITE_MAL_CLIENT_ID);
            }
          });
        }
      },
    },
  },
  plugins: [
    react(),
    // Uncomment when vite-plugin-pwa is installed
    // VitePWA({
    //   registerType: "autoUpdate",
    //   includeAssets: ["favicon.ico", "icon-192.png", "icon-512.png"],
    //   manifest: {
    //     name: "Cinephile - Movie Discovery Platform",
    //     short_name: "Cinephile",
    //     description: "Track, discover, and experience movies and TV shows with personalized recommendations",
    //     theme_color: "#8b5cf6",
    //     background_color: "#0f0f23",
    //     display: "standalone",
    //     icons: [
    //       {
    //         src: "icon-192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //         purpose: "any maskable",
    //       },
    //       {
    //         src: "icon-512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //       },
    //     ],
    //   },
    //   workbox: {
    //     globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/api\.themoviedb\.org\/.*/i,
    //         handler: "CacheFirst",
    //         options: {
    //           cacheName: "tmdb-api-cache",
    //           expiration: {
    //             maxEntries: 100,
    //             maxAgeSeconds: 60 * 60 * 24, // 24 hours
    //           },
    //           cacheableResponse: {
    //             statuses: [0, 200],
    //           },
    //         },
    //       },
    //       {
    //         urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
    //         handler: "CacheFirst",
    //         options: {
    //           cacheName: "tmdb-images-cache",
    //           expiration: {
    //             maxEntries: 200,
    //             maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
    //           },
    //           cacheableResponse: {
    //             statuses: [0, 200],
    //           },
    //         },
    //       },
    //     ],
    //   },
    //   devOptions: {
    //     enabled: true,
    //   },
    // }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
      "@/shared": path.resolve(rootDir, "./src/shared"),
      "@/features": path.resolve(rootDir, "./src/features"),
      "@/app": path.resolve(rootDir, "./src/app"),
      "@/config": path.resolve(rootDir, "./src/config"),
      "@/assets": path.resolve(rootDir, "./src/assets"),
    },
  },
  build: {
    // Optimize bundle size
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI components
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
          ],
          // State management & data fetching
          'query-vendor': ['@tanstack/react-query'],
          // Icons
          'icons-vendor': ['lucide-react'],
          // Supabase & Auth
          'supabase-vendor': ['@supabase/supabase-js'],
        },
        // Optimize chunk names for caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace(/\.\w+$/, '')
            : 'chunk';
          return `assets/js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 500, // Warn for chunks > 500KB
    // Source maps for production debugging (optional)
    sourcemap: false, // Set to true if you need source maps
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
    ],
  },
  };
});
