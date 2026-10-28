import { notFound } from 'next/navigation';
import { getDict } from '@/content';
import { hasLocale, href } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { ArrowIcon } from '@/components/ui';
import { Crumb, PageHero } from '@/components/sections';
import PotentialCheck from '@/components/PotentialCheck';

export async function generateMetadata({ params }: PageProps<'/[lang]/potential-check'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDict(lang).check;
  return pageMeta(lang, '/potential-check', t.title, t.description);
}

export default async function Page({ params }: PageProps<'/[lang]/potential-check'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDict(lang).check;
  return (
    <>
      <PageHero
        lang={lang} crumb={<Crumb lang={lang} items={[['OBJ', '/'], [t.title]]} />} h={t.h} lead={t.lead} facts={t.facts}
        ctas={<a className="btn btn--primary magnetic" href={`${href(lang, '/potential-check')}#check`}>{t.start} <ArrowIcon /></a>}
      />
      <section className="section section--tight" style={{ paddingTop: 0 }}>
        <PotentialCheck lang={lang} t={t} />
      </section>
    </>
  );
}
