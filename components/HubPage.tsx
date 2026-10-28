import Link from 'next/link';
import type { Dict, HubSlug } from '@/content/types';
import { href, type Locale } from '@/lib/i18n';
import { Btn, Lines } from './ui';
import { Crumb, LosingCta, PageHero, ProcessSection, ProjectsBlock, RailSection, Statement } from './sections';

export default function HubPage({ lang, d, slug }: { lang: Locale; d: Dict; slug: HubSlug }) {
  const hb = d.hubs[slug];
  return (
    <>
      <PageHero
        lang={lang} crumb={<Crumb lang={lang} items={[['OBJ', '/'], [hb.crumb]]} />} h={hb.h} lead={hb.lead} facts={hb.facts}
        ctas={<><Btn lang={lang} to="/potential-check" magnetic>{d.nav.checkPotential}</Btn><Btn lang={lang} to={`/${slug}#solutions`} kind="secondary" diag>{d.nav.solutions}</Btn></>}
      />
      <Statement {...hb.statement} />
      <section className="section on-space" id="solutions" data-space="">
        <div className="section__head"><div><p className="t-label t-muted">{hb.crumb}</p><Lines lines={[hb.solutionsTitle]} /></div></div>
        <div className="cards" style={{ '--cols': hb.subs.length } as React.CSSProperties}>
          {hb.subs.map(s => (
            <article className="card" data-card="" key={s.slug}>
              <p className="t-label t-muted">{s.sub}</p>
              <h3 className="t-h2" style={{ marginTop: 14, fontSize: 'clamp(30px,3.2vw,48px)' }}><Link href={href(lang, `/${s.slug}`)}>{s.name}</Link></h3>
              <p style={{ color: 'rgb(245 245 242 / .75)', margin: '18px 0 0' }}>{s.text}</p>
              <div className="chips" style={{ marginTop: 24 }}>{s.chips.map(c => <span className="chip" key={c}>{c}</span>)}</div>
              <div className="card__foot"><Btn lang={lang} to={`/${s.slug}`} kind="ghost" small>{d.common.learnMore}</Btn><span className="card__mirror">{s.name}</span></div>
            </article>
          ))}
        </div>
      </section>
      <RailSection lang={lang} rail={hb.rail} />
      <ProcessSection d={d} />
      <ProjectsBlock lang={lang} d={d} slugs={hb.projects} />
      <LosingCta lang={lang} d={d} />
    </>
  );
}
