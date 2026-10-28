import Link from 'next/link';
import type { Dict } from '@/content/types';
import { BRAND } from '@/lib/brand';
import { href, type Locale } from '@/lib/i18n';

export const Awards = ({ d, style }: { d: Dict; style?: React.CSSProperties }) => {
  const [a, b] = d.common.awards;
  return (
    <div className="awards" style={style}>
      <b>W</b><span>{a}</span><hr /><span>{b}</span>
    </div>
  );
};

export default function Footer({ lang, d }: { lang: Locale; d: Dict }) {
  const c = d.common;
  return (
    <footer className="site-footer" id="footer">
      <div className="contact reveal">
        <div><p className="t-label t-muted" style={{ marginBottom: 18 }}>{c.contactLabel}</p><h2 className="t-h2">{c.contactTitle}</h2></div>
        <div>
          <a className="contact__row" href={`tel:${BRAND.phoneHref}`}><span className="t-label t-muted">{c.phone}</span><strong>{BRAND.phone} <span>→</span></strong></a>
          <a className="contact__row" href={`mailto:${BRAND.email}`}><span className="t-label t-muted">{c.email}</span><strong>{BRAND.email} <span>→</span></strong></a>
        </div>
        <div className="foot-cols">
          <div><Awards d={d} style={{ margin: 0 }} /></div>
          <div>
            <p className="t-label t-muted">{c.solutions}</p>
            <Link href={href(lang, '/visibility')}>{d.nav.visibility}</Link>
            <Link href={href(lang, '/conversion')}>{d.nav.conversion}</Link>
            <Link href={href(lang, '/strategy-workshops')}>{d.nav.strategy}</Link>
          </div>
          <div>
            <p className="t-label t-muted">{BRAND.name}</p>
            <Link href={href(lang, '/projects')}>{d.nav.projects}</Link>
            <Link href={href(lang, '/agency')}>{d.nav.agency}</Link>
            <Link href={href(lang, '/insights')}>{d.nav.insights}</Link>
            <Link href={href(lang, '/contact')}>{d.nav.contact}</Link>
          </div>
          <div>
            <p className="t-label t-muted">{c.studio}</p>
            <p style={{ margin: '8px 0 0' }}>{BRAND.address.map((l, i) => <span key={l}>{i > 0 && <br />}{l}</span>)}</p>
            <div className="socials">
              {BRAND.socials.map(([short, label, url]) => <a key={short} href={url} target="_blank" rel="noopener noreferrer" aria-label={label}>{short}</a>)}
            </div>
          </div>
        </div>
      </div>
      <div className="legal">
        <span>© {BRAND.year} {BRAND.name}. {c.rights}</span>
        <span><Link href={href(lang, '/legal-notice')}>{c.legalNotice}</Link> &nbsp;·&nbsp; <Link href={href(lang, '/privacy')}>{c.privacy}</Link></span>
      </div>
      <div className="wordmark" data-wordmark="" aria-hidden="true">
        {[...BRAND.word].map((ch, i, a) => <span key={i} className={i === a.length - 1 ? 'wm-i' : undefined}>{ch}</span>)}
      </div>
    </footer>
  );
}
