import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDict } from '@/content';
import { BRAND } from '@/lib/brand';
import { hasLocale, href } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { Btn, Lines, vars } from '@/components/ui';
import { CaseRow, ClientsMarquee, FeaturedCase, LosingCta, ProcessSection } from '@/components/sections';
import { Awards } from '@/components/Footer';
import Globe from '@/components/Globe';
import Intro from '@/components/Intro';

export async function generateMetadata({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDict(lang);
  return { ...pageMeta(lang, '/', d.meta.title, d.meta.description), title: { absolute: d.meta.title } };
}

export default async function Home({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const h = d.home;
  const [featured, ...others] = d.projects;

  return (
    <>
      <Intro word={BRAND.word} />
      <div className="status" aria-hidden="true">
        <span><strong>{BRAND.city}</strong> <strong data-clock={BRAND.timezone}>--:--</strong></span>
        <span>·&nbsp; {d.common.potentialCustomer}</span>
        <span><span className="dot" />&nbsp; {d.common.customer}</span>
      </div>

      <section className="hero" data-hero="">
        <div className="hero__sticky">
          <Globe />
          <div className="hero__glow" />
          <p className="hero__hint t-label t-muted">{d.common.dragRotate}</p>
          <div className="hero__content" data-instant="">
            <p className="t-label t-muted reveal">{h.label}</p>
            <h1 className="t-display hero__title lines" data-lines="">
              {h.h1.map((l, i) => <span key={i} className={`ln${i > 1 ? ' indent' : ''}`} style={vars({ '--i': i })}><span>{l}</span></span>)}
            </h1>
            <div className="hero__foot">
              <p className="lead reveal" style={vars({ '--d': 400 })}>{h.lead}</p>
              <div className="btn-row reveal" style={vars({ '--d': 550 })}>
                <Btn lang={lang} to="/potential-check" magnetic>{d.nav.checkPotential}</Btn>
                <Btn lang={lang} to="/projects" kind="secondary" diag magnetic>{d.common.viewProjects}</Btn>
              </div>
            </div>
          </div>
          <div className="hero__drift" data-drift="" aria-hidden="true">
            {h.drift[0]} <span>{h.drift[1]}</span> — {h.drift[0]} <span>{h.drift[1]}</span>
          </div>
        </div>
      </section>

      <section className="section on-space" data-space="">
        <div className="fork">
          <div className="fork__col">
            <p className="t-label t-muted">{d.common.beforeTheClick}</p>
            <Lines lines={h.fork.left} />
            <div className="fork__chips"><span className="chip">SEO</span><span className="chip">GEO</span></div>
            <Btn lang={lang} to="/visibility" kind="ghost" small style={{ alignSelf: 'flex-start' }}>{d.nav.visibility}</Btn>
          </div>
          <div className="fork__col">
            <p className="t-label t-muted">{d.common.afterTheClick}</p>
            <Lines lines={h.fork.right} />
            <div className="fork__chips">
              <span className="chip">{d.nav.services.websites}</span><span className="chip">{d.nav.services['online-shops']}</span><span className="chip">{d.nav.services['conversion-optimization']}</span>
            </div>
            <Btn lang={lang} to="/conversion" kind="ghost" small style={{ alignSelf: 'flex-start' }}>{d.nav.conversion}</Btn>
          </div>
        </div>
      </section>

      <section className="journey" data-journey="">
        <div className="journey__sticky">
          <div className="journey__rays" />
          <div className="journey__top">
            <Lines lines={h.journey.h} />
            <p className="lead reveal">{h.journey.lead}</p>
          </div>
          <div className="journey__labels t-label t-muted"><span>{h.journey.labels[0]}</span><span>{h.journey.labels[1]}</span></div>
          <div className="rail" style={vars({ '--n': 5 })}>
            <div className="rail__line"><div className="rail__fill" /><span className="rail__click">CLICK</span></div>
            {h.journey.steps.map(s => <div className="step" key={s}>{s}</div>)}
          </div>
        </div>
      </section>

      <section className="section on-space" data-space="">
        <div className="section__head"><div><p className="t-label t-muted">{d.nav.solutions}</p><Lines lines={h.solutionsH} /></div></div>
        <div className="cards">
          {(['visibility', 'conversion'] as const).map(hub => (
            <article className="card" data-card="" key={hub}>
              <p className="t-label t-muted">{d.hubs[hub].crumb}</p>
              <h3 className="t-h2" style={{ marginTop: 14 }}><Link href={href(lang, `/${hub}`)}>{d.hubs[hub].title}</Link></h3>
              <ul>
                {d.hubs[hub].subs.map(s => <li key={s.slug}><Link href={href(lang, `/${s.slug}`)}>{s.name} <span>→</span></Link></li>)}
              </ul>
              <div className="card__foot">
                <Btn lang={lang} to={`/${hub}`} kind="ghost" small>{hub === 'visibility' ? d.common.improveVisibility : d.common.improveConversion}</Btn>
                <span className="card__mirror">{d.hubs[hub].title}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <p className="t-label t-muted" style={{ marginBottom: 30 }}>{d.common.selectedCases}</p>
        <FeaturedCase lang={lang} d={d} p={featured} />
        <ol className="cases">{others.map((p, i) => <CaseRow lang={lang} p={p} i={i} key={p.slug} />)}</ol>
      </section>

      <ClientsMarquee d={d} />

      <section className="stance" data-stance="" aria-label="Stance">
        <div className="stance__sticky">
          {h.stance.map(({ text, mute }) => (
            <p className="stance__item" key={text}>
              {text.split(' ').map((w, i) => <span key={i}><span className={`w${i < mute ? ' mute' : ''}`}>{w}</span>{' '}</span>)}
            </p>
          ))}
          <div className="stance__dots"><i /><i /><i /></div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="panel reveal">
          <Lines lines={h.panel.h} className="t-display" style={{ fontSize: 'clamp(40px,5.4vw,78px)' }} />
          <div className="panel__foot">
            <div className="flow">
              {h.panel.flow.map((f, i) => <span key={f}>{i === 0 ? <><span className="dot" />&nbsp; {f}</> : <>→ &nbsp;{f}</>}</span>)}
            </div>
            <Btn lang={lang} to="/strategy-workshops" kind="ghost" small>{h.panel.btn}</Btn>
          </div>
        </div>
      </section>

      <ProcessSection d={d} />

      <section className="section">
        <div className="agency">
          <div className="portrait" data-portrait=""><canvas data-group="1" /></div>
          <div>
            <div className="logo reveal" style={{ fontSize: 'clamp(60px,7vw,100px)' }}>
              <span>{BRAND.word.slice(0, -1)}<i>{BRAND.word.slice(-1)}</i></span>
              <small style={{ fontSize: 'clamp(14px,1.4vw,20px)' }}>{d.common.tagline}</small>
            </div>
            <p className="lead reveal" style={{ marginTop: 30, maxWidth: '34ch' }}>{h.agencyLead}</p>
            <Awards d={d} />
            <div className="reveal"><Btn lang={lang} to="/agency" kind="ghost" small>{h.meet}</Btn></div>
          </div>
        </div>
      </section>

      <LosingCta lang={lang} d={d} />
    </>
  );
}
