import { notFound } from 'next/navigation';
import { getDict } from '@/content';
import { hasLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { Crumb, LosingCta, PageHero } from '@/components/sections';
import InsightsGrid from '@/components/InsightsGrid';

export async function generateMetadata({ params }: PageProps<'/[lang]/insights'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDict(lang);
  return pageMeta(lang, '/insights', d.nav.insights, d.insightsPage.description);
}

export default async function Page({ params }: PageProps<'/[lang]/insights'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  return (
    <>
      <PageHero lang={lang} crumb={<Crumb lang={lang} items={[['OBJ', '/'], [d.nav.insights]]} />} h={d.insightsPage.h} lead={d.insightsPage.lead} />
      <section className="section" style={{ paddingTop: 0 }}>
        <InsightsGrid lang={lang} posts={d.insights} topics={d.common.topics} minRead={d.common.minRead} />
      </section>
      <LosingCta lang={lang} d={d} />
    </>
  );
}
