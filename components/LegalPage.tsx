import type { Locale } from '@/lib/i18n';
import { Crumb, PageHero } from './sections';

export default function LegalPage({ lang, title, html }: { lang: Locale; title: string; html: string }) {
  return (
    <>
      <PageHero lang={lang} crumb={<Crumb lang={lang} items={[['OBJ', '/'], [title]]} />} h={[title + '.']} />
      <section className="section legal-page" style={{ paddingTop: 0 }}>
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </section>
    </>
  );
}
