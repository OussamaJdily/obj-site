import Link from 'next/link';
import type { Dict } from '@/content/types';
import { BRAND } from '@/lib/brand';
import { href, type Locale } from '@/lib/i18n';
import { Btn, ChevIcon } from './ui';
import LangSwitch from './LangSwitch';

export const Logo = ({ lang, size, tagline }: { lang: Locale; size?: string; tagline: string }) => (
  <Link href={href(lang, '/')} className="logo" aria-label={`${BRAND.name} — home`} style={size ? { fontSize: size } : undefined}>
    <span>{BRAND.word.slice(0, -1)}<i>{BRAND.word.slice(-1)}</i></span>
    <small>{tagline}</small>
  </Link>
);

export default function Header({ lang, d }: { lang: Locale; d: Dict }) {
  const n = d.nav;
  const s = n.services;
  return (
    <>
      <a className="skip-link" href="#main">{n.skip}</a>
      <header className="site-header">
        <Logo lang={lang} tagline={d.common.tagline} />
        <nav className="nav" aria-label="Main">
          <div className="nav__drop">
            <button type="button" aria-haspopup="true">{n.solutions} <ChevIcon /></button>
            <div className="flyout">
              <div className="flyout__col">
                <span className="t-label t-muted">{n.beforeClick}</span>
                <Link className="flyout__title" href={href(lang, '/visibility')}>{n.visibility}</Link>
                <Link href={href(lang, '/seo')}>{s.seo} <span>→</span></Link>
                <Link href={href(lang, '/geo')}>{s.geo} <span>→</span></Link>
              </div>
              <div className="flyout__col">
                <span className="t-label t-muted">{n.afterClick}</span>
                <Link className="flyout__title" href={href(lang, '/conversion')}>{n.conversion}</Link>
                <Link href={href(lang, '/websites')}>{s.websites} <span>→</span></Link>
                <Link href={href(lang, '/online-shops')}>{s['online-shops']} <span>→</span></Link>
                <Link href={href(lang, '/conversion-optimization')}>{s['conversion-optimization']} <span>→</span></Link>
              </div>
              <Link className="flyout__wide" href={href(lang, '/strategy-workshops')}>
                <span><span className="t-label t-muted">{n.beforeBuild} &nbsp;</span> {n.strategy}</span><span>→</span>
              </Link>
            </div>
          </div>
          <Link href={href(lang, '/projects')}>{n.projects}</Link>
          <Link href={href(lang, '/agency')}>{n.agency}</Link>
          <Link href={href(lang, '/insights')}>{n.insights}</Link>
          <Link href={href(lang, '/contact')}>{n.contact}</Link>
        </nav>
        <div className="head-right">
          <LangSwitch lang={lang} />
          <Btn lang={lang} to="/potential-check" small magnetic>{n.checkPotential}</Btn>
        </div>
      </header>
    </>
  );
}
