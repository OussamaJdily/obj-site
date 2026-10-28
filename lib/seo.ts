import type { Metadata } from 'next';
import { BRAND } from './brand';
import { locales, type Locale } from './i18n';

/** Per-page metadata with canonical URL, FR/EN alternates and Open Graph tags. */
export function pageMeta(lang: Locale, path: string, title: string, description: string): Metadata {
  const p = path === '/' ? '' : path;
  const languages = Object.fromEntries(locales.map(l => [l, `/${l}${p}`]));
  return {
    title,
    description,
    alternates: { canonical: `/${lang}${p}`, languages: { ...languages, 'x-default': `/fr${p}` } },
    openGraph: {
      type: 'website', siteName: BRAND.name, title, description, url: `/${lang}${p}`,
      locale: lang === 'fr' ? 'fr_MA' : 'en_US',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export const withBrand = (title: string) => `${title} — ${BRAND.name}`;
