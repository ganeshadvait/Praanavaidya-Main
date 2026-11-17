# Praanavaidya website (Astro)

Static Astro version of https://praanavaidya.com, migrated from WordPress (Blocksy child theme + Tailwind).
Markup, content, images and URLs match the WordPress site.

## Commands

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs static site to dist/
npm run preview
```

## Where things live

| What | Where |
| --- | --- |
| Shared `<head>`, body wrapper | `src/layouts/BaseLayout.astro` |
| Header / mega menus / mobile menu | `src/components/Header.astro` |
| Footer, appointment modal, floating menu, site scripts | `src/components/Footer.astro` |
| Sticky "Our Locations / Contact Us" CTA | `src/components/StickyCta.astro` |
| Homepage hiring popup | `src/components/HiringPopup.astro` |
| Pages (home, about, contact, services, …) | `src/pages/*.astro` |
| Treatment pages | `src/pages/ayurvedic-treatments/*.astro` |
| Doctor pages | `src/pages/ayurvedic-doctors/*.astro` |
| Careers / job pages | `src/pages/careers/*.astro` |
| Blog posts (one JSON file per post, filename = URL slug) | `src/content/posts/*.json` |
| Blog post template | `src/pages/[slug].astro` |
| Blog index, category & author archives (generated, 9 per page) | `src/pages/blogs/`, `src/pages/category/`, `src/pages/author/` |
| Categories / authors | `src/data/categories.json`, `src/data/authors.json` |
| Old WordPress URLs → new URLs | `src/data/redirects.json` |
| Images (was `wp-content/uploads/`) | `public/images/<year>/<month>/` |
| Videos | `public/videos/<year>/<month>/` |
| Theme CSS / JS / fonts | `public/assets/` |

### Adding a blog post

Copy an existing file in `src/content/posts/`, rename it to the new slug and edit the fields
(`title`, `date`, `categories`, `heroImage`, `card`, `seo`, `content` …). The blog index,
category/author archives, "Latest Articles" and the homepage/About blog cards update automatically.

## Notes

- Styling uses compiled **Tailwind CSS v3** (`src/styles/tailwind.css`, `tailwind.config.mjs`, `postcss.config.mjs`).
  It is v3 on purpose: the WordPress theme used the v3 Play CDN, and v4 changes several defaults that would alter the design.
  Classes are picked up from `src/**` (including post JSON) and the theme scripts in `public/assets/**/*.js`.
- Forms (appointment modal, contact, job application) post to Google Apps Script, so they work on any static host.
- Analytics: Google Tag Manager (`GTM-TNRHSLB7`) and the DecentCare script are kept.
