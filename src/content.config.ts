import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const seo = z.object({
  title: z.string(),
  robots: z.string().nullable().optional(),
  meta: z.array(z.tuple([z.string(), z.string(), z.string()])),
  links: z.array(z.tuple([z.string(), z.string()])),
  jsonLd: z.string().nullable().optional(),
});

/**
 * Blog posts migrated from WordPress. One JSON file per post in src/content/posts/,
 * the file name is the URL slug (https://praanavaidya.com/<slug>/).
 * HTML fields (title, heroLabel, heroExcerpt, content, card.excerpt) are rendered as-is.
 */
const posts = defineCollection({
  loader: glob({
    pattern: '*.json',
    base: './src/content/posts',
    generateId: ({ entry }) => entry.replace(/\.json$/, ''),
  }),
  schema: z.object({
    wpId: z.number(),
    title: z.string(),
    /** Publish date in site-local time, e.g. 2026-11-16T11:56:23 */
    date: z.string(),
    modified: z.string(),
    /** Author slug (see src/data/authors.json) */
    author: z.string(),
    authorName: z.string(),
    readTime: z.string(),
    /** Category paths, e.g. "blog/ayurveda-benefits" (see src/data/categories.json) */
    categories: z.array(z.string()),
    heroLabel: z.string(),
    heroExcerpt: z.string(),
    /** Attributes of the hero <img> (src, srcset, sizes, alt, ...) */
    heroImage: z.record(z.string(), z.string()).nullable(),
    articleId: z.string(),
    articleClass: z.string(),
    /** Data used by the post cards in listings */
    card: z.object({
      image: z.string().nullable(),
      alt: z.string(),
      labels: z.array(z.string()),
      excerpt: z.string().nullable(),
    }),
    cardTitle: z.string().optional(),
    bodyClass: z.string(),
    seo,
    content: z.string(),
  }),
});

export const collections = { posts };
