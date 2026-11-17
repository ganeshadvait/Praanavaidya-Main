import { getCollection, type CollectionEntry } from 'astro:content';
import type { Seo } from './seo';
import categories from '@/data/categories.json';
import authors from '@/data/authors.json';

export type Post = CollectionEntry<'posts'>;

/** Posts per page on the blog index, category and author archives. */
export const PER_PAGE = 9;

/** All posts, newest first (same order WordPress used). */
export async function getPosts(): Promise<Post[]> {
  const all = await getCollection('posts');
  return all.sort((a, b) => b.data.date.localeCompare(a.data.date) || b.data.wpId - a.data.wpId);
}

export function postUrl(post: Post): string {
  return `/${post.id}/`;
}

/** e.g. "2026-11-16T11:56:23" -> "November 16, 2026" (no timezone shifting). */
export function formatDate(date: string): string {
  const [y, m, d] = date.slice(0, 10).split('-').map(Number);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[m - 1]} ${d}, ${y}`;
}

/** URL of page `n` of an archive whose first page lives at `base` (with trailing slash). */
export function pageUrl(base: string, n: number): string {
  return n <= 1 ? base : `${base}page/${n}/`;
}

export function chunk<T>(items: T[], size = PER_PAGE): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages.length ? pages : [[]];
}

export interface PageMeta {
  seo: Seo;
  bodyClass: string;
}

type PageMap = Record<string, PageMeta | undefined>;

/**
 * SEO/body class for archive page `n`. Pages that did not exist on the WordPress site
 * (because of its pagination bug) get page 1's data with the URL/title adjusted.
 */
export function pageMeta(pages: PageMap, n: number, base: string): PageMeta {
  const exact = pages[String(n)];
  if (exact) return exact;
  const first = pages['1'] ?? Object.values(pages)[0]!;
  const url = `https://praanavaidya.com${pageUrl(base, n)}`;
  const title = first.seo.title.replace(/ - Praanavaidya$/, ` - Page ${n} - Praanavaidya`);
  return {
    bodyClass: first.bodyClass.replace(/\bpaged-\d+\b/g, '').trim() + ` paged paged-${n}`,
    seo: {
      ...first.seo,
      title,
      meta: first.seo.meta.map(([a, k, v]) => [a, k, k === 'og:url' ? url : k === 'og:title' ? title : v] as [string, string, string]),
      links: [['canonical', url]],
      jsonLd: null,
    },
  };
}

export interface Category {
  path: string;
  name: string;
  description: string | null;
  wpId: number;
  pages: PageMap;
}

export interface Author {
  slug: string;
  heading: string;
  wpId: number;
  pages: PageMap;
}

export const allCategories = categories as Category[];
export const allAuthors = authors as Author[];

/** Posts in a category, including its sub-categories (WordPress behaviour). */
export function inCategory(post: Post, path: string): boolean {
  return post.data.categories.some((c) => c === path || c.startsWith(path + '/'));
}
