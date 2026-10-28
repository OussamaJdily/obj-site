// Reusable page sections (server components).
import Link from 'next/link';
import type { Dict, Project, ProjectSlug, Rail, Statement as StatementT, Crosslink as CrosslinkT } from '@/content/types';
import { href, type Locale } from '@/lib/i18n';
import { ArrowIcon, Btn, Lines, vars } from './ui';

type L = { lang: Locale };

export function PageHero({ lang, crumb, h, lead, ctas, facts, visual }: L & {
  crumb: React.ReactNode; h: string[]; lead?: string; ctas?: React.ReactNode; facts?: string[]; visual?: React.ReactNode;
}) {
  return (
    <section className="page-hero" data-instant="">
      <p className="t-label t-muted page-hero__crumb reveal">{crumb}</p>
      <Lines as="h1" lines={h} className="t-display t-display--md" />
      {(lead || ctas) && (
        <div className="page-hero__foot">
          {lead ? <p className="lead lead--wide reveal" style={vars({ '--d': 300 })}>{lead}</p> : <span />}
          {ctas && <div className="btn-row reveal" style={vars({ '--d': 450 })}>{ctas}</div>}
        </div>
      )}
      {facts && (
        <div className="page-hero__facts t-label t-muted reveal" style={vars({ '--d': 550 })}>
          {facts.map((f, i) => <span key={f}>{i === 0 ? <span className="dot" /> : '·'} {f}</span>)}
        </div>
      )}
      {visual && <div className="page-hero__visual reveal" style={vars({ '--d': 500 })}>{visual}</div>}
    </section>
  );
}

export const Crumb = ({ lang, items }: L & { items: [string, string?][] }) => (
  <>
    {items.map(([label, to], i) => (
      <span key={label}>{i > 0 && ' / '}{to ? <Link href={href(lang, to)}>{label}</Link> : label}</span>
    ))}
  </>
);

export function Statement({ h, note, strong }: StatementT) {
  return (
    <section className="section statement">
      <Lines lines={h} />
      {note && <p className="statement__note reveal">{note}{strong && <strong>{strong}</strong>}</p>}
      <div className="statement__dot" />
    </section>
  );
}

export function Crosslink({ lang, h, text, href: to, label }: L & CrosslinkT) {
  return (
    <section className="section section--tight">
      <div className="crosslink reveal">
        <h2 className="t-h3" style={{ fontSize: 'clamp(28px,3vw,44px)' }}>{h}</h2>
        <div><p>{text}</p><Btn lang={lang} to={to} kind="ghost" small>{label}</Btn></div>
      </div>
    </section>
  );
}

export function RailSection({ lang, rail }: L & { rail: Rail }) {
  const n = rail.steps.length;
  return (
    <section className="section rail-section">
      <div className="split">
        <Lines lines={rail.h} />
        <div>
          <p className="reveal">{rail.text}</p>
          {rail.link && <div className="reveal"><Btn lang={lang} to={rail.link[0]} kind="ghost" small>{rail.link[1]}</Btn></div>}
        </div>
      </div>
      <div className="rail" data-rail="" style={vars({ '--n': n })}>
        <div className="rail__line">
          <div className="rail__fill" />
          <span className="rail__click" style={{ left: `${((rail.clickAt - 0.5) / (n - 1)) * 100}%` }}>CLICK</span>
        </div>
        {rail.steps.map(s => <div className="step" key={s}>{s}</div>)}
      </div>
    </section>
  );
}

export function ProcessSection({ d }: { d: Dict }) {
  return (
    <section className="process on-space" data-process="" data-space="" aria-label={d.common.howWeWork}>
      <div className="process__sticky">
        <div><p className="t-label t-muted" style={{ marginBottom: 18 }}>{d.common.howWeWork}</p><Lines lines={d.process.h} /></div>
        <div className="process__rail"><i /></div>
        <div>
          <ol>{d.process.steps.map(([t, desc]) => <li key={t} data-desc={desc}>{t}</li>)}</ol>
          <p className="process__desc" aria-live="polite">{d.process.steps[0][1]}</p>
        </div>
      </div>
    </section>
  );
}

export function LosingCta({ lang, d, h = d.losing, label = d.common.firstStep }: L & { d: Dict; h?: string[]; label?: string }) {
  return (
    <section className="section on-space" data-space="">
      <p className="t-label t-muted" style={{ marginBottom: 18 }}>{label}</p>
      <Lines lines={h} style={{ marginBottom: 50 }} />
      <div className="losing">
        <Link href={href(lang, '/visibility')}>{d.common.beforeTheClick} <ArrowIcon /></Link>
        <Link href={href(lang, '/conversion')}>{d.common.afterTheClick} <ArrowIcon /></Link>
        <Link href={href(lang, '/potential-check')}>{d.common.notSureYet} <ArrowIcon /></Link>
      </div>
      <div className="btn-row" style={{ marginTop: 40 }}>
        <Btn lang={lang} to="/potential-check" magnetic>{d.common.startCheck}</Btn>
        <Btn lang={lang} to="/contact" kind="secondary" magnetic>{d.common.talkDirect}</Btn>
      </div>
    </section>
  );
}

export function CaseRow({ lang, p, i }: L & { p: Project; i: number }) {
  return (
    <li className="case reveal">
      <span className="case__n">{String(i + 1).padStart(2, '0')}</span>
      <div><h3 className="t-h3">{p.title}</h3><p className="case__meta"><strong>{p.name}</strong> · {p.city} · {p.industry}</p></div>
      <span className="case__tags t-label t-muted">{p.tags}</span>
      <span className="arrow-btn" aria-hidden="true"><ArrowIcon /></span>
      <Link className="case__cover" href={href(lang, `/projects/${p.slug}`)} aria-label={p.name} />
    </li>
  );
}

export function ProjectsBlock({ lang, d, slugs }: L & { d: Dict; slugs: ProjectSlug[] }) {
  const list = slugs.map(s => d.projects.find(p => p.slug === s)!);
  return (
    <section className="section">
      <p className="t-label t-muted" style={{ marginBottom: 18 }}>{d.common.selectedCases}</p>
      <Lines lines={[d.common.projectsTitle]} style={{ marginBottom: 50 }} />
      <ol className="cases">{list.map((p, i) => <CaseRow lang={lang} p={p} i={i} key={p.slug} />)}</ol>
      <div style={{ marginTop: 40 }}><Btn lang={lang} to="/projects" kind="ghost" small>{d.common.allProjects}</Btn></div>
    </section>
  );
}

export function FeaturedCase({ lang, d, p, boxed }: L & { d: Dict; p: Project; boxed?: boolean }) {
  return (
    <div className={`fcase${boxed ? ' fcase--boxed' : ''}`}>
      <div>
        <p className="new t-label t-muted"><b>NEW</b> {d.common.latestCase}</p>
        <Lines lines={[p.title]} style={{ margin: '20px 0' }} />
        <p className="case__meta"><strong>{p.name}</strong> &nbsp; {p.industry} · {p.kind}</p>
        <div style={{ marginTop: 30 }}><Btn lang={lang} to={`/projects/${p.slug}`} small>{d.common.viewCase}</Btn></div>
      </div>
      <Link href={href(lang, `/projects/${p.slug}`)} className="media" data-tilt="" style={vars({ '--tint': p.tint })} aria-label={p.name}>
        <div className="media__word">{p.name}</div><div className="media__device" />
      </Link>
    </div>
  );
}

const CLIENTS_A = ['Atlas Bois', 'Lingua Lab', 'ORBIT', 'Lumen', 'Sahara Tech', 'Anfa Café', 'Medina Craft'];
const CLIENTS_B = ['Dar Events', 'Marina Yachts', 'Oasis Clinic', 'Argan & Co', 'Kasbah Hotels', 'Rif Coffee', 'Corniche Fit'];
export const CLIENT_GRID = ['Atlas Bois', 'Lingua Lab', 'ORBIT', 'Lumen', 'Dar Events', 'Sahara Tech', 'Anfa Café', 'Medina Craft', 'Oasis Clinic', 'Kasbah Hotels'];

export function ClientsMarquee({ d }: { d: Dict }) {
  const row = (arr: string[], rev?: boolean) => (
    <div className={`marquee${rev ? ' marquee--rev' : ''}`}>
      <ul className="marquee__track">
        {[...arr, ...arr].map((n, i) => <li className="logo-tile" key={i} aria-hidden={i >= arr.length || undefined}>{n}</li>)}
      </ul>
    </div>
  );
  return (
    <section className="clients on-space" data-space="">
      <div className="section__head"><div><p className="t-label t-muted">{d.common.clients}</p><Lines lines={d.home.clientsH} /></div></div>
      {row(CLIENTS_A)}{row(CLIENTS_B, true)}
    </section>
  );
}

export const SearchMock = ({ ai }: { ai?: boolean }) => ai ? (
  <div className="mock">
    <div className="mock__bar"><i /><b style={{ width: '60%' }} /></div>
    <div className="mock__row"><b /></div><div className="mock__row"><b style={{ flex: 0.9 }} /></div>
    <div className="mock__row is-you"><i /><b style={{ flex: 0.6 }} /><em /></div><div className="mock__row"><b style={{ flex: 0.75 }} /></div>
  </div>
) : (
  <div className="mock">
    <div className="mock__bar"><i /><b /></div>
    <div className="mock__row"><i /><b /><em /></div>
    <div className="mock__row"><i /><b style={{ flex: 0.8 }} /><em /></div>
    <div className="mock__row"><i /><b style={{ flex: 0.9 }} /><em /></div>
    <div className="mock__row is-you"><i /><b style={{ flex: 0.7 }} /><em /></div>
  </div>
);

export const BrowserMock = ({ word, tint = '189 108 247' }: { word: string; tint?: string }) => (
  <div className="media" data-tilt="" style={vars({ '--tint': tint })}><div className="media__word">{word}</div><div className="media__browser" /></div>
);
