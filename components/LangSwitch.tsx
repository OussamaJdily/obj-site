'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n';

/** FR / EN pill that keeps the visitor on the same page in the other language. */
export default function LangSwitch({ lang }: { lang: Locale }) {
  const pathname = usePathname() || `/${lang}`;
  const rest = pathname.replace(/^\/(fr|en)(?=\/|$)/, '');
  return (
    <nav className="lang" aria-label="Language">
      {locales.map(l => (
        <Link key={l} href={`/${l}${rest}`} hrefLang={l} className={l === lang ? 'is-on' : undefined} aria-current={l === lang ? 'true' : undefined}>
          {l.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
