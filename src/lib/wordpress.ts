/**
 * Content loader: pulls blog posts from the WordPress blog (https://blog.praanavaidya.com)
 * through its REST API on every build, so the blog is the single source of truth.
 *
 * Posts are published on this site at https://praanavaidya.com/<slug>/.
 *
 * - SEO: posts that existed before the move keep their original Yoast data
 *   (src/data/post-seo.json). If Yoast is installed on the blog later, its
 *   `yoast_head_json` is used. Otherwise SEO is generated from the post.
 * - Authors: the blog import attributed everything to "admin", so posts keep their
 *   original author, and new posts are credited to DEFAULT_AUTHOR.
 * - Links to the blog domain inside posts are rewritten to this site.
 */
import type { Loader } from 'astro/loaders';
import categories from '../data/categories.json';
import postSeo from '../data/post-seo.json';

const SITE = 'https://praanavaidya.com';
const WP_URL = (import.meta.env.WP_URL || process.env.WP_URL || 'https://blog.praanavaidya.com').replace(/\/$/, '');
const DEFAULT_AUTHOR = { slug: 'preethi', name: 'Praanavaidya' };
/** Default WordPress sample content that must never be published on the site. */
const SKIP_SLUGS = new Set(['hello-world', 'sample-page']);

type Seo = { title: string; robots?: string | null; meta: [string, string, string][]; links: [string, string][]; jsonLd?: string | null };
type Override = { author: string; authorName: string; cardTitle?: string; seo: Seo };
const overrides = postSeo as Record<string, Override>;

/** WordPress category slug -> this site's category path, e.g. "panchakarma-blog" -> "blog/panchakarma-blog" */
const categoryPath = new Map((categories as { path: string; name: string }[]).map((c) => [c.path.split('/').pop()!, c]));

const decode = (s: string) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'").replace(/&nbsp;/g, ' ');
const stripTags = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const escAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

async function fetchJson(url: string, attempt = 1): Promise<{ data: any; totalPages: number }> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'praanavaidya-site-build' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { data: await res.json(), totalPages: Number(res.headers.get('x-wp-totalpages') || 1) };
  } catch (err) {
    if (attempt >= 3) throw new Error(`WordPress fetch failed for ${url}: ${err}`);
    await new Promise((r) => setTimeout(r, 1000 * attempt));
    return fetchJson(url, attempt + 1);
  }
}

async function fetchAllPosts(): Promise<any[]> {
  const url = (page: number) => `${WP_URL}/wp-json/wp/v2/posts?status=publish&per_page=100&page=${page}&_embed=author,wp:featuredmedia,wp:term`;
  const first = await fetchJson(url(1));
  const rest = await Promise.all(Array.from({ length: first.totalPages - 1 }, (_, i) => fetchJson(url(i + 2))));
  return [first, ...rest].flatMap((r) => r.data);
}

/** Point links to the blog's posts/pages at this site; keep uploads on the blog host. */
function rewriteLinks(html: string): string {
  const host = WP_URL.replace(/^https?:\/\//, '');
  return html.replace(new RegExp(`(href=["'])https?://${host.replace(/\./g, '\\.')}(/(?!wp-content|wp-json)[^"']*)?`, 'g'), (_, pre, path = '/') => `${pre}${path}`);
}

function excerptWords(html: string, n = 30): string {
  const words = stripTags(html).replace(/\[&hellip;\]|\[…\]/g, '').trim().split(' ');
  return escAttr(decode(words.slice(0, n).join(' '))) + (words.length > n ? '&hellip;' : '');
}

function generatedSeo(p: any, slug: string, author: string, image?: { url: string; width: number; height: number; type?: string }): Seo {
  const url = `${SITE}/${slug}/`;
  const title = `${decode(stripTags(p.title.rendered))} - Praanavaidya`;
  const description = decode(stripTags(p.excerpt.rendered).replace(/\[&hellip;\]|\[…\]/g, '').trim()).slice(0, 155);
  const words = stripTags(p.content.rendered).split(' ').length;
  const published = `${p.date_gmt}+00:00`;
  const modified = `${p.modified_gmt}+00:00`;
  const meta: [string, string, string][] = [
    ['name', 'description', description],
    ['property', 'og:locale', 'en_US'],
    ['property', 'og:type', 'article'],
    ['property', 'og:title', title],
    ['property', 'og:description', description],
    ['property', 'og:url', url],
    ['property', 'og:site_name', 'Praanavaidya'],
    ['property', 'article:publisher', 'https://www.facebook.com/people/Praanavaidya/100086202962051/'],
    ['property', 'article:published_time', published],
    ['property', 'article:modified_time', modified],
    ...(image ? ([['property', 'og:image', image.url], ['property', 'og:image:width', String(image.width)], ['property', 'og:image:height', String(image.height)]] as [string, string, string][]) : []),
    ...(image?.type ? ([['property', 'og:image:type', image.type]] as [string, string, string][]) : []),
    ['name', 'author', author],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:label1', 'Written by'],
    ['name', 'twitter:data1', author],
    ['name', 'twitter:label2', 'Est. reading time'],
    ['name', 'twitter:data2', `${Math.max(1, Math.ceil(words / 200))} minutes`],
  ];
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        isPartOf: { '@id': url },
        author: { '@type': 'Person', name: author },
        headline: decode(stripTags(p.title.rendered)),
        datePublished: published,
        dateModified: modified,
        mainEntityOfPage: { '@id': url },
        wordCount: words,
        publisher: { '@id': `${SITE}/#organization` },
        ...(image ? { image: { '@type': 'ImageObject', url: image.url, width: image.width, height: image.height } } : {}),
        inLanguage: 'en-US',
      },
      { '@type': 'WebPage', '@id': url, url, name: title, datePublished: published, dateModified: modified, description, inLanguage: 'en-US' },
    ],
  });
  return { title, robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1', meta, links: [['canonical', url]], jsonLd };
}

/** Yoast data from the blog (if Yoast is ever installed there), re-pointed at this site. */
function yoastSeo(y: any): Seo | null {
  if (!y?.title) return null;
  const host = WP_URL.replace(/^https?:\/\//, '');
  const fix = (s: string) => s.split(`https://${host}`).join(SITE).split(`http://${host}`).join(SITE);
  const meta: [string, string, string][] = [];
  if (y.description) meta.push(['name', 'description', y.description]);
  for (const [k, v] of Object.entries<any>({ 'og:locale': y.og_locale, 'og:type': y.og_type, 'og:title': y.og_title, 'og:description': y.og_description, 'og:url': y.og_url, 'og:site_name': y.og_site_name, 'article:published_time': y.article_published_time, 'article:modified_time': y.article_modified_time }))
    if (v) meta.push(['property', k, fix(String(v))]);
  for (const img of y.og_image || []) meta.push(['property', 'og:image', img.url]);
  if (y.twitter_card) meta.push(['name', 'twitter:card', y.twitter_card]);
  const robots = y.robots ? Object.values(y.robots).join(', ') : null;
  return { title: y.title, robots, meta, links: y.canonical ? [['canonical', fix(y.canonical)]] : [], jsonLd: y.schema ? fix(JSON.stringify(y.schema)) : null };
}

export function wordpressPosts(): Loader {
  return {
    name: 'wordpress-posts',
    load: async ({ store, logger, parseData, generateDigest }) => {
      logger.info(`Fetching posts from ${WP_URL}`);
      const posts = (await fetchAllPosts()).filter((p) => !SKIP_SLUGS.has(p.slug));
      store.clear();
      for (const p of posts) {
        const slug: string = p.slug;
        const override = overrides[slug];
        const terms: any[] = (p._embedded?.['wp:term'] || []).flat().filter((t: any) => t?.taxonomy === 'category');
        const cats = terms.map((t) => categoryPath.get(t.slug)).filter(Boolean) as { path: string; name: string }[];
        const label = cats[0]?.name ?? (terms[0] ? decode(terms[0].name) : '');
        const media = p._embedded?.['wp:featuredmedia']?.[0];
        const img = media?.source_url
          ? {
              url: media.source_url as string,
              width: media.media_details?.width ?? 0,
              height: media.media_details?.height ?? 0,
              type: media.mime_type as string | undefined,
              alt: (media.alt_text as string) || decode(stripTags(p.title.rendered)),
              srcset: Object.values<any>(media.media_details?.sizes || {})
                .filter((s) => s.source_url && s.width)
                .sort((a, b) => b.width - a.width)
                .map((s) => `${s.source_url} ${s.width}w`)
                .join(', '),
            }
          : undefined;
        const author = override ? { slug: override.author, name: override.authorName } : DEFAULT_AUTHOR;
        const words = stripTags(p.content.rendered).split(' ').length;
        const excerpt = excerptWords(p.excerpt.rendered || p.content.rendered);

        const data = {
          wpId: p.id,
          title: p.title.rendered,
          date: p.date,
          modified: p.modified,
          author: author.slug,
          authorName: author.name,
          readTime: `${Math.max(1, Math.ceil(words / 200))} min`,
          categories: cats.map((c) => c.path),
          heroLabel: label,
          heroExcerpt: excerpt,
          heroImage: img
            ? {
                width: String(img.width),
                height: String(img.height),
                src: img.url,
                class: 'w-full h-full rounded-l-3xl wp-post-image',
                alt: img.alt,
                decoding: 'async',
                fetchpriority: 'high',
                ...(img.srcset ? { srcset: img.srcset, sizes: `(max-width: ${img.width}px) 100vw, ${img.width}px` } : {}),
              }
            : null,
          articleId: `post-${p.id}`,
          articleClass: (p.class_list || []).join(' '),
          card: {
            image: img?.url ?? 'https://via.placeholder.com/400x300',
            alt: decode(stripTags(p.title.rendered)),
            labels: label ? [label] : [],
            excerpt,
          },
          ...(override?.cardTitle ? { cardTitle: override.cardTitle } : {}),
          bodyClass: `wp-singular post-template-default single single-post postid-${p.id} single-format-standard wp-embed-responsive wp-theme-blocksy wp-child-theme-blocksy-child`,
          seo: yoastSeo(p.yoast_head_json) ?? override?.seo ?? generatedSeo(p, slug, author.name, img),
          content: rewriteLinks(p.content.rendered),
        };
        store.set({ id: slug, data: await parseData({ id: slug, data }), digest: generateDigest(`${p.id}:${p.modified_gmt}`) });
      }
      logger.info(`Loaded ${posts.length} posts from WordPress`);
    },
  };
}
