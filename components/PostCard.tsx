import Link from 'next/link';
import type { Insight } from '@/content/types';
import { href, type Locale } from '@/lib/i18n';

export const formatDate = (iso: string, lang: Locale) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export function PostCard({ lang, a, topicLabel, minRead }: { lang: Locale; a: Insight; topicLabel: string; minRead: string }) {
  return (
    <Link className="post" href={href(lang, `/insights/${a.slug}`)}>
      <div className="post__art" style={{ '--tint': a.tint } as React.CSSProperties}><span>{a.word}</span></div>
      <div className="post__body">
        <span className="t-label t-muted" style={{ fontSize: 11 }}>{topicLabel}</span>
        <h3>{a.title}</h3><p>{a.excerpt}</p>
        <div className="post__meta"><time dateTime={a.date}>{formatDate(a.date, lang)}</time><span>{a.read} {minRead}</span></div>
      </div>
    </Link>
  );
}
