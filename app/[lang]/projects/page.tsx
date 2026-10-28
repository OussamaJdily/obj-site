import { notFound } from 'next/navigation';
import { getDict } from '@/content';
import { hasLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { Btn, Lines } from '@/components/ui';
import { CaseRow, FeaturedCase, PageHero } from '@/components/sections';

export async function generateMetadata({ params }: PageProps<'/[lang]/projects'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDict(lang);
  return pageMeta(lang, '/projects', d.nav.projects, d.projectsPage.description);
}

export default async function Page({ params }: PageProps<'/[lang]/projects'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const pp = d.projectsPage;
  const [featured, ...others] = d.projects;
  return (
    <>
      <PageHero lang={lang} crumb={pp.crumb} h={pp.h} lead={pp.lead} />
      <section className="section" style={{ paddingTop: 0 }}>
        <FeaturedCase lang={lang} d={d} p={featured} boxed />
        <ol className="cases">{others.map((p, i) => <CaseRow lang={lang} p={p} i={i} key={p.slug} />)}</ol>
      </section>
      <section className="section">
        <div className="section__head"><Lines lines={pp.outroH} className="t-display" style={{ fontSize: 'clamp(40px,5.4vw,78px)' }} /></div>
        <div className="page-hero__foot" style={{ marginTop: 0 }}>
          <p className="lead">{pp.outroLead}</p>
          <div className="btn-row">
            <Btn lang={lang} to="/potential-check" magnetic>{d.nav.checkPotential}</Btn>
            <Btn lang={lang} to="/contact" kind="secondary" magnetic>{d.common.talkDirect}</Btn>
          </div>
        </div>
      </section>
    </>
  );
}
