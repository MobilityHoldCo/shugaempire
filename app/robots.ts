import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shugaempire.com';

/**
 * Generates a robots.txt for SHUGA Empire HoldCo.
 * Next.js serves this at /robots.txt automatically.
 *
 * Rules:
 * - Allow all well-behaved crawlers to index the full site.
 * - Block known junk/scraper bots and AI training scrapers.
 * - Disallow internal Next.js infrastructure paths and API routes.
 * - Reference the XML sitemap for crawler discovery.
 *
 * Blocked AI-training scrapers: GPTBot, Claude-Web, CCBot,
 * Google-Extended, anthropic-ai, PerplexityBot, Bytespider,
 * Diffbot, FacebookBot (for training), SemrushBot (aggressive).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Main rule: allow all reputable search engine bots ─────────────────
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/_next/',          // Next.js build output — not useful to index
          '/api/',            // API routes — not for search engines
          '/studio/',         // CMS studio (if ever added)
          '/*.json$',         // JSON data files
          '/*?*',             // Query-string variants (prevents duplicate content)
        ],
      },

      // ── Googlebot — give full access ─────────────────────────────────────
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/_next/',
          '/api/',
        ],
      },

      // ── Bingbot — give full access ────────────────────────────────────────
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/_next/',
          '/api/',
        ],
      },

      // ── Block OpenAI GPTBot (AI training scraper) ─────────────────────────
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },

      // ── Block Claude-Web / Anthropic crawler ──────────────────────────────
      {
        userAgent: 'Claude-Web',
        disallow: ['/'],
      },
      {
        userAgent: 'anthropic-ai',
        disallow: ['/'],
      },

      // ── Block Common Crawl (used for LLM training datasets) ───────────────
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },

      // ── Block Google-Extended (Bard/Gemini AI training) ───────────────────
      {
        userAgent: 'Google-Extended',
        disallow: ['/'],
      },

      // ── Block PerplexityBot (AI training) ────────────────────────────────
      {
        userAgent: 'PerplexityBot',
        disallow: ['/'],
      },

      // ── Block Bytespider (ByteDance / TikTok AI scraper) ──────────────────
      {
        userAgent: 'Bytespider',
        disallow: ['/'],
      },

      // ── Block Diffbot (data extraction) ──────────────────────────────────
      {
        userAgent: 'Diffbot',
        disallow: ['/'],
      },

      // ── Block ImagesiftBot ────────────────────────────────────────────────
      {
        userAgent: 'ImagesiftBot',
        disallow: ['/'],
      },

      // ── Block Omgili / Webz.io scrapers ──────────────────────────────────
      {
        userAgent: 'Omgilibot',
        disallow: ['/'],
      },
      {
        userAgent: 'Webzio-Extended',
        disallow: ['/'],
      },

      // ── Block SemrushBot (aggressive commercial crawler) ──────────────────
      {
        userAgent: 'SemrushBot',
        disallow: ['/'],
      },

      // ── Block AhrefsBot (aggressive link crawler) ─────────────────────────
      {
        userAgent: 'AhrefsBot',
        disallow: ['/'],
      },

      // ── Block MJ12bot (Majestic SEO, aggressive) ──────────────────────────
      {
        userAgent: 'MJ12bot',
        disallow: ['/'],
      },

      // ── Block DotBot (Moz, aggressive) ────────────────────────────────────
      {
        userAgent: 'DotBot',
        disallow: ['/'],
      },

      // ── Block Petalbot (Huawei, aggressive) ───────────────────────────────
      {
        userAgent: 'Petalbot',
        disallow: ['/'],
      },
    ],

    sitemap: `${BASE_URL}/sitemap.xml`,

    // Crawl-delay hint (honoured by some bots, not Googlebot)
    // Note: Next.js MetadataRoute.Robots doesn't expose crawlDelay directly,
    // so it is omitted here; configure via Google Search Console if needed.
  };
}
