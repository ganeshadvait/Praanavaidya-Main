/** SEO data captured from the Yoast output of each WordPress page. */
export interface Seo {
  title: string;
  robots?: string | null;
  /** [attribute ("name" | "property"), key, content] */
  meta: [string, string, string][];
  /** [rel, href] - canonical / prev / next */
  links: [string, string][];
  /** Raw JSON-LD schema graph */
  jsonLd?: string | null;
}
