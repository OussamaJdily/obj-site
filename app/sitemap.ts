import type { MetadataRoute } from 'next';
import en from '@/content/en';
import { BRAND } from '@/lib/brand';
import { locales } from '@/lib/i18n';

const PATHS = [
  '', '/visibility', '/conversion', '/seo', '/geo', '/websites', '/online-shops', '/conversion-optimization',
  '/strategy-workshops', '/projects', '/agency', '/insights', '/contact', '/potential-check', '/legal-notice', '/privacy',
  ...en.projects.map(p => `/projects/${p.slug}`),
  ...en.insights.map(a => `/insights/${a.slug}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap(p => locales.map(l => ({
    url: `${BRAND.url}/${l}${p}`,
    changeFrequency: 'monthly' as const,
    priority: p === '' ? 1 : 0.7,
    alternates: { languages: Object.fromEntries(locales.map(x => [x, `${BRAND.url}/${x}${p}`])) },
  })));
}
