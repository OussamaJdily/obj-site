import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDict } from '@/content';
import { hasLocale, href } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { Lines, vars } from '@/components/ui';
import { BrowserMock, Crumb, LosingCta, Statement } from '@/components/sections';

export const dynamicParams = false;
export function generateStaticParams() {
  return getDict('en').projects.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<'/[lang]/projects/[slug]'>) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const p = getDict(lang).projects.find(x => x.slug === slug);
  return p ? pageMeta(lang, `/projects/${slug}`, `${p.name} — ${p.industry}`, `${p.title} ${p.intro[0]}`) : {};
}

export default async function ProjectPage({ params }: PageProps<'/[lang]/projects/[slug]'>) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const c = d.common;
  const idx = d.projects.findIndex(x => x.slug === slug);
  if (idx < 0) notFound();
  const p = d.projects[idx];
  const next = d.projects[(idx + 1) % d.projects.length];

  return (
    <>
      <section className="page-hero" data-instant="">
        <p className="t-label t-muted page-hero__crumb reveal"><Crumb lang={lang} items={[[d.nav.projects, '/projects'], [p.name]]} /></p>
        <Lines as="h1" lines={[p.name]} className="t-display" />
        <p className="lead lead--wide reveal" style={vars({ '--d': 300, marginTop: '30px' })}>{p.title}</p>
        <dl className="case-hero__meta reveal" style={vars({ '--d': 450 })}>
          <div><dt>{c.client}</dt><dd>{p.name}</dd></div>
          <div><dt>{c.industry}</dt><dd>{p.industry}</dd></div>
          <div><dt>{c.location}</dt><dd>{p.city}</dd></div>
          <div><dt>{c.servicesLabel}</dt><dd>{p.services.join(', ')}</dd></div>
        </dl>
        <div className="page-hero__visual reveal" style={vars({ '--d': 550 })}><BrowserMock word={p.name} tint={p.tint} /></div>
      </section>

      <section className="section">
        <div className="case-intro"><p className="t-label t-muted">{c.bottleneck}</p><div>{p.intro.map(t => <p className="reveal" key={t}>{t}</p>)}</div></div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="grid-2">
          <div><Lines lines={[c.whatHappened]} /></div>
          <ol className="timeline">{p.timeline.map(([t, desc]) => <li key={t}><h3>{t}</h3><p>{desc}</p></li>)}</ol>
        </div>
      </section>

      <Statement h={p.statement} />

      <section className="section section--tight">
        <div className="devices reveal">
          <div className="media" data-tilt="" style={vars({ '--tint': p.tint })}><div className="media__word">{p.name}</div><div className="media__browser" /></div>
          <div className="media" data-tilt="" style={vars({ '--tint': p.tint })}><div className="media__device" style={{ width: '52%' }} /></div>
        </div>
      </section>

      <section className="section on-space" data-space="">
        <p className="t-label t-muted" style={{ marginBottom: 18 }}>{c.deliverables}</p>
        <Lines lines={[c.whatWeBuilt]} style={{ marginBottom: 50 }} />
        <div className="built">
          {p.built.map(([t, desc], i) => (
            <div className="built__item reveal" style={vars({ '--d': (i % 3) * 100 })} key={t}><span>{String(i + 1).padStart(2, '0')}</span><h3>{t}</h3><p>{desc}</p></div>
          ))}
        </div>
      </section>

      <section className="section on-space" data-space="">
        <figure className="quote reveal" style={{ margin: '0 auto' }}><blockquote>{p.quote[0]}</blockquote><figcaption>{p.quote[1]}</figcaption></figure>
      </section>

      <section className="section">
        <p className="t-label t-muted" style={{ marginBottom: 18 }}>{c.outcome}</p>
        <Lines lines={[c.whatChanged]} style={{ marginBottom: 50 }} />
        <div className="metrics">
          {p.metrics.map(([n, suf, pre, label]) => (
            <div className="metric reveal" key={label}>
              <b><span data-count={n} data-prefix={pre} data-suffix={suf}>{pre}{n}{suf}</span></b><p>{label}</p>
            </div>
          ))}
        </div>
        <p className="t-small t-muted" style={{ marginTop: 18 }}>{c.exampleFigures}</p>
      </section>

      <section className="section section--tight">
        <dl className="credits reveal">{p.credits.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      </section>

      <section className="section section--tight">
        <Link className="next-project" href={href(lang, `/projects/${next.slug}`)}>
          <p className="t-label t-muted">{c.nextProject}</p>
          <span className="t-display" style={{ display: 'block', marginTop: 16 }}>{next.name} →</span>
        </Link>
      </section>

      <LosingCta lang={lang} d={d} h={d.projectsPage.outroH} label={c.yourProject} />
    </>
  );
}
