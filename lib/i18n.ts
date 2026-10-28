export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

export const hasLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

/** Prefix an internal path with the locale: href('fr', '/contact') -> '/fr/contact' */
export const href = (locale: Locale, path: string) => {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  return `/${locale}${path === '/' ? '' : path}`;
};

export const otherLocale = (locale: Locale): Locale => (locale === 'fr' ? 'en' : 'fr');
