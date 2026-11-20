// Dynamic XML sitemaps, generated from the built site after every `astro build`.
//
// Mirrors the old Yoast layout so Search Console keeps working:
//   /sitemap_index.xml -> /post-sitemap.xml, /page-sitemap.xml, /treatment-sitemap.xml, ...
//
// Every built page is picked up automatically and placed in a group by its URL.
// A page is left out when it is: noindex, a redirect, a 404, a paginated listing
// (/page/2/), or its canonical URL points somewhere else.
// lastmod comes from the page's article:modified_time / article:published_time meta.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Sitemap groups, in index order. First matching rule wins. */
const GROUPS = [
  { name: 'post', match: (p, ctx) => ctx.postSlugs.has(p.replace(/^\/|\/$/g, '')) },
  { name: 'page', match: () => false }, // filled by the fallback below
  { name: 'treatment', match: (p) => p.startsWith('/ayurvedic-treatments/') },
  { name: 'doctor', match: (p) => p.startsWith('/ayurvedic-doctors/') },
  { name: 'job', match: (p) => p.startsWith('/careers/') },
  { name: 'category', match: (p) => p.startsWith('/category/') },
  { name: 'post_tag', match: (p) => p.startsWith('/tag/') },
  { name: 'author', match: (p) => p.startsWith('/author/') },
];

const EXCLUDE = [/\/page\/\d+\/$/, /^\/404\/?$/];

const meta = (html, key) => {
  const re = new RegExp(`<meta[^>]+(?:name|property)=["']${key}["'][^>]*content=["']([^"']*)["']`, 'i');
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${key}["']`, 'i');
  return (html.match(re) || html.match(re2) || [])[1];
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default function sitemap({ postsDir = 'src/content/posts' } = {}) {
  let site;
  return {
    name: 'praanavaidya-sitemap',
    hooks: {
      'astro:config:done': ({ config }) => {
        if (!config.site) throw new Error('sitemap: set `site` in astro.config.mjs');
        site = config.site.replace(/\/$/, '');
      },
      'astro:build:done': ({ dir, pages, logger }) => {
        const outDir = fileURLToPath(dir);
        const postSlugs = new Set(
          fs.existsSync(postsDir) ? fs.readdirSync(postsDir).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')) : [],
        );
        const groups = Object.fromEntries(GROUPS.map((g) => [g.name, []]));

        for (const { pathname } of pages) {
          const p = '/' + pathname.replace(/^\/|\/$/g, '') + (pathname.replace(/^\/|\/$/g, '') ? '/' : '');
          if (EXCLUDE.some((re) => re.test(p))) continue;
          const file = path.join(outDir, p, 'index.html');
          if (!fs.existsSync(file)) continue;
          const html = fs.readFileSync(file, 'utf8');
          if (/http-equiv=["']refresh["']/i.test(html)) continue; // redirect stub
          const robots = meta(html, 'robots') || '';
          if (/noindex/i.test(robots)) continue;
          const loc = site + p;
          const canonical = (html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) || [])[1];
          if (canonical && canonical.replace(/\/?$/, '/') !== loc) continue;

          const lastmod = meta(html, 'article:modified_time') || meta(html, 'article:published_time');
          const image = meta(html, 'og:image');
          const entry = { loc, lastmod, image: image && image.startsWith(site) ? image : undefined };
          const group = GROUPS.find((g) => g.match(p, { postSlugs })) || GROUPS.find((g) => g.name === 'page');
          groups[group.name].push(entry);
        }

        const index = [];
        for (const { name } of GROUPS) {
          const urls = groups[name].sort((a, b) => a.loc.localeCompare(b.loc));
          if (!urls.length) continue;
          if (name === 'page') urls.sort((a, b) => (a.loc === site + '/' ? -1 : b.loc === site + '/' ? 1 : 0));
          const body = urls
            .map((u) => [
              '\t<url>',
              `\t\t<loc>${esc(u.loc)}</loc>`,
              u.lastmod && `\t\t<lastmod>${esc(u.lastmod)}</lastmod>`,
              u.image && `\t\t<image:image>\n\t\t\t<image:loc>${esc(u.image)}</image:loc>\n\t\t</image:image>`,
              '\t</url>',
            ].filter(Boolean).join('\n'))
            .join('\n');
          fs.writeFileSync(
            path.join(outDir, `${name}-sitemap.xml`),
            `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>\n`,
          );
          const newest = urls.map((u) => u.lastmod).filter(Boolean).sort().pop();
          index.push({ loc: `${site}/${name}-sitemap.xml`, lastmod: newest });
          logger.info(`${name}-sitemap.xml: ${urls.length} URLs`);
        }

        const indexBody = index
          .map((s) => `\t<sitemap>\n\t\t<loc>${esc(s.loc)}</loc>${s.lastmod ? `\n\t\t<lastmod>${esc(s.lastmod)}</lastmod>` : ''}\n\t</sitemap>`)
          .join('\n');
        fs.writeFileSync(
          path.join(outDir, 'sitemap_index.xml'),
          `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexBody}\n</sitemapindex>\n`,
        );
        logger.info(`sitemap_index.xml: ${index.length} sitemaps`);
      },
    },
  };
}
