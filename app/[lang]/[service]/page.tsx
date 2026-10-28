import { notFound } from 'next/navigation';
import { getDict } from '@/content';
import type { ServiceSlug } from '@/content/types';
import { hasLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { Btn, Lines, vars } from '@/components/ui';
import { BrowserMock, Crosslink, Crumb, LosingCta, PageHero, ProcessSection, ProjectsBlock, RailSection, SearchMock, Statement } from '@/components/sections';

const SLUGS: ServiceSlug[] = ['seo', 'geo', 'websites', 'online-shops', 'conversion-optimization'];
const isService = (s: string): s is ServiceSlug => (SLUGS as string[]).includes(s);

export const dynamicParams = false;
export function generateStaticParams() {
  return SLUGS.map(service => ({ service }));
}

export async function generateMetadata({ params }: PageProps<'/[lang]/[service]'>) {
  const { lang, service } = await params;
  if (!hasLocale(lang) || !isService(service)) return {};
  const s = getDict(lang).services[service];
  return pageMeta(lang, `/${service}`, s.title, s.lead);
}

export default async function ServicePage({ params }: PageProps<'/[lang]/[service]'>) {
  const { lang, service } = await params;
  if (!hasLocale(lang) || !isService(service)) notFound();
  const d = getDict(lang);
  const s = d.services[service];
  const parent = d.hubs[s.parent];
  const visual = s.visual === 'browser' ? <BrowserMock word={s.visualWord} tint={s.tint} /> : <SearchMock ai={s.visual === 'ai'} />;

  return (
    <>
      <PageHero
        lang={lang} crumb={<Crumb lang={lang} items={[['OBJ', '/'], [parent.title, `/${s.parent}`], [s.title]]} />}
        h={s.h} lead={s.lead} visual={visual}
        ctas={<><Btn lang={lang} to="/potential-check" magnetic>{d.nav.checkPotential}</Btn><Btn lang={lang} to={`/${service}#system`} kind="secondary" diag>{s.systemLabel}</Btn></>}
      />
      <Statement {...s.statement} />

      <section className="section">
        <p className="t-label t-muted" style={{ marginBottom: 18 }}>{s.factors.label}</p>
        <Lines lines={s.factors.h} style={{ marginBottom: 50 }} />
        <div className="factors reveal">
          {s.factors.items.map(([t, p]) => <div className="factor" key={t}><h3><span className="dot" />{t}</h3><p>{p}</p></div>)}
        </div>
      </section>

      <section className="section on-space" id="system" data-space="">
        <p className="t-label t-muted" style={{ marginBottom: 18 }}>{s.pillars.label}</p>
        <Lines lines={s.pillars.h} style={{ marginBottom: 50 }} />
        <div className="pillars">
          {s.pillars.items.map(([tag, name, strong, p], i) => (
            <div className="pillar reveal" style={vars({ '--d': i * 100 })} key={name}>
              <span className="t-label t-muted" style={{ fontSize: 10 }}>{tag}</span><h3>{name}</h3><strong>{strong}</strong><p>{p}</p>
              <span className="card__mirror">{name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <div><p className="t-label t-muted">{d.common.possibleWork}</p><Lines lines={[s.work.h]} /></div>
          <p className="lead reveal">{s.work.lead}</p>
        </div>
        <div className="chip-panel reveal"><div className="chips">{s.work.chips.map(c => <span className="chip" key={c}>{c}</span>)}</div></div>
      </section>

      <RailSection lang={lang} rail={s.rail} />

      <section className="section">
        <div className="split"><Lines lines={s.split.h} /><div><p className="reveal">{s.split.p}</p><p className="reveal"><strong>{s.split.strong}</strong></p></div></div>
      </section>

      <Crosslink lang={lang} {...s.cross} />
      <ProcessSection d={d} />
      <ProjectsBlock lang={lang} d={d} slugs={s.projects} />
      <LosingCta lang={lang} d={d} h={s.cta} />
    </>
  );
}
