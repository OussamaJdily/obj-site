import { notFound } from 'next/navigation';
import { getDict } from '@/content';
import { hasLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { Btn, Lines, vars } from '@/components/ui';
import { Crosslink, Crumb, LosingCta, PageHero, ProcessSection, RailSection, Statement } from '@/components/sections';

export async function generateMetadata({ params }: PageProps<'/[lang]/strategy-workshops'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const s = getDict(lang).strategy;
  return pageMeta(lang, '/strategy-workshops', s.title, s.lead);
}

export default async function Page({ params }: PageProps<'/[lang]/strategy-workshops'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const s = d.strategy;
  return (
    <>
      <PageHero
        lang={lang} crumb={<Crumb lang={lang} items={[['OBJ', '/'], [s.title]]} />} h={s.h} lead={s.lead} facts={s.facts}
        ctas={<><Btn lang={lang} to="/contact?topic=4" magnetic>{s.book}</Btn><Btn lang={lang} to="/strategy-workshops#formats" kind="secondary" diag>{s.formats}</Btn></>}
      />
      <Statement {...s.statement} />
      <section className="section on-space" id="formats" data-space="">
        <p className="t-label t-muted" style={{ marginBottom: 18 }}>{s.formats}</p>
        <Lines lines={s.formatsH} style={{ marginBottom: 50 }} />
        <div className="built">
          {s.items.map(([n, t, p, dur], i) => (
            <div className="built__item reveal" style={vars({ '--d': i * 100 })} key={n}><span>{n} · {dur}</span><h3>{t}</h3><p>{p}</p></div>
          ))}
        </div>
      </section>
      <RailSection lang={lang} rail={s.rail} />
      <section className="section">
        <div className="split"><Lines lines={s.split.h} /><div><p className="reveal">{s.split.p}</p><p className="reveal"><strong>{s.split.strong}</strong></p></div></div>
      </section>
      <Crosslink lang={lang} {...s.cross} />
      <ProcessSection d={d} />
      <LosingCta lang={lang} d={d} />
    </>
  );
}
