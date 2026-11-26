// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from './src/integrations/sitemap.mjs';
import redirects from './src/data/redirects.json' with { type: 'json' };

export default defineConfig({
  site: 'https://praanavaidya.com',
  trailingSlash: 'always',
  // Hosted on Vercel: redirects become real 301s on Vercel's edge (static output, no server code).
  adapter: vercel(),
  build: {
    format: 'directory',
    // Never inline CSS as <style> tags; everything ships as the Tailwind-built stylesheet.
    inlineStylesheets: 'never',
  },
  // Old WordPress URLs (e.g. /treatment/piles/, /doctors/dr-divya/) -> current pages
  redirects,
  // sitemap_index.xml + per-type sitemaps, regenerated on every build
  integrations: [sitemap()],
});
