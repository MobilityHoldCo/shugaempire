import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shugaempire.com';

/**
 * Generates a dynamic XML sitemap for Mobility Hold Co.
 * Next.js serves this at /sitemap.xml automatically.
 *
 * Priority Guide:
 *   1.0  — Homepage (most important)
 *   0.9  — Core product/sub-brand pages
 *   0.8  — Supporting pages (About, Investors)
 *   0.6  — Utility pages (Contact, FAQ)
 *
 * changeFrequency:
 *   'daily'   — pages with frequent content updates
 *   'weekly'  — product pages updated regularly
 *   'monthly' — stable informational pages
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    // ─── Homepage ────────────────────────────────────────────────────────────
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },

    // ─── Core Sub-Brand Pages ────────────────────────────────────────────────
    {
      url: `${BASE_URL}/shuga-cars`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/shuga-ride`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/shuga-energy`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },

    // ─── Company Pages ───────────────────────────────────────────────────────
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/waitlist`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/investors`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },

    // ─── Utility / Support Pages ─────────────────────────────────────────────
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];
}
