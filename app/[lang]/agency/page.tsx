import { notFound } from 'next/navigation';
import { getDict } from '@/content';
import { BRAND } from '@/lib/brand';
import { hasLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { Btn, Lines, vars } from '@/components/ui';
import { CLIENT_GRID, Crosslink, Crumb, LosingCta, PageHero, ProcessSection, Statement } from '@/components/sections';

export async function generateMetadata({ params }: PageProps<'/[lang]/agency'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDict(lang);
  return pageMeta(lang, '/agency', d.nav.agency, d.agency.description);
}

const STARS: [number, number][] = [[-12, 0], [8, 2.3], [-4, 4.6], [16, 1.2], [-20, 5.5]];

export default async function Page({ params }: PageProps<'/[lang]/agency'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const a = d.agency;
  const c = d.common;
  return (
    <>
      <PageHero
        lang={lang} crumb={<Crumb lang={lang} items={[['OBJ', '/'], [d.nav.agency]]} />} h={[a.h]} lead={a.lead}
        ctas={<><Btn lang={lang} to="/contact" magnetic>{a.getToKnow}</Btn><Btn lang={lang} to="/projects" kind="secondary" diag>{c.viewProjects}</Btn></>}
      />
      <Statement {...a.statement} />

      <section className="clients" style={{ paddingTop: 0 }}>
        <div className="section__head"><div><p className="t-label t-muted">{c.clients}</p><Lines lines={[a.clientsH]} /></div></div>
        <div className="logo-grid">{CLIENT_GRID.map(n => <div className="logo-tile reveal" key={n}>{n}</div>)}</div>
      </section>

      <section className="crawl" aria-label={a.crawl.join(' ')}>
        {STARS.map(([angle, delay], i) => <span key={i} className="crawl__star" style={vars({ '--angle': `${angle}deg`, '--dl': `${delay}s` })} />)}
        <div><Lines lines={a.crawl} className="t-display" style={{ fontSize: 'clamp(40px,6vw,90px)' }} /></div>
      </section>

      <section className="section">
        <div className="section__head"><div><p className="t-label t-muted">{a.teamLabel}</p><Lines lines={[a.teamH]} /></div></div>
        <div className="team">
          {a.team.map(([name, role], i) => (
            <div className="member reveal" style={vars({ '--d': i * 100 })} key={name}>
              <div className="portrait" data-portrait=""><canvas data-seed={i * 7 + 3} /></div>
              <h3>{name}</h3><p>{role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section on-space" data-space="">
        <p className="t-label t-muted" style={{ marginBottom: 18 }}>{a.dnaLabel}</p>
        <Lines lines={a.dnaH} style={{ marginBottom: 50 }} />
        <div className="dna">
          {a.dna.map(([t, p], i) => (
            <div className="dna__card reveal" style={vars({ '--d': i * 100 })} key={t}>
              <h3 className="t-h3">{t}</h3><p>{p}</p>
              {i === 0 && <div className="dna__art dna__art--type">Aa</div>}
              {i === 1 && <div className="dna__art dna__art--anim"><span /></div>}
              {i === 2 && <div className="dna__art dna__art--dot"><span /></div>}
            </div>
          ))}
        </div>
      </section>

      <ProcessSection d={d} />

      <section className="section">
        <div className="studio">
          <div><p className="t-label t-muted" style={{ marginBottom: 18 }}>{c.studio}</p><div className="studio__city reveal">{BRAND.city}.</div></div>
          <dl className="reveal">
            <dt>{c.localTime}</dt><dd data-clock={BRAND.timezone}>--:--</dd>
            <dt>{c.address}</dt><dd>{BRAND.address.slice(1).join(', ')}</dd>
            <dt>{c.phone}</dt><dd><a href={`tel:${BRAND.phoneHref}`}>{BRAND.phone}</a></dd>
            <dt>{c.email}</dt><dd><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></dd>
          </dl>
        </div>
      </section>

      <Crosslink lang={lang} {...a.cross} />
      <LosingCta lang={lang} d={d} h={a.ctaH} label={a.ctaLabel} />
    </>
  );
}
