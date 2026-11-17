// @ts-check
import { defineConfig } from 'astro/config';
import redirects from './src/data/redirects.json' with { type: 'json' };

export default defineConfig({
  site: 'https://praanavaidya.com',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    // Never inline CSS as <style> tags; everything ships as the Tailwind-built stylesheet.
    inlineStylesheets: 'never',
  },
  // Old WordPress URLs (e.g. /treatment/piles/, /doctors/dr-divya/) -> current pages
  redirects,
});
