import fs from 'fs';
import path from 'path';

// This script generates a sitemap.xml for static routes.
// For dynamic routes (movies/tv shows), we include a few top ones if possible, 
// or let the client-side crawler find them through the popular lists.
// Since we don't want to make 1000s of API calls during build, we will generate static routes here.

const SITE_URL = 'https://cinephile.app';

const staticRoutes = [
  '/',
  '/movies',
  '/tv-shows',
  '/search',
  '/recommendations'
];

function generateSitemap() {
  const date = new Date().toISOString().split('T')[0];

  const urls = staticRoutes.map(route => `
  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>
  `).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;

  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  console.log('sitemap.xml generated successfully in public directory.');
}

generateSitemap();
