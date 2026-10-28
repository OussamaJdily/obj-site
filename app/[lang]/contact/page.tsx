import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getDict } from '@/content';
import { BRAND } from '@/lib/brand';
import { hasLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { vars } from '@/components/ui';
import { Crosslink, Crumb, PageHero, Statement } from '@/components/sections';
import ContactForm from '@/components/ContactForm';

export async function generateMetadata({ params }: PageProps<'/[lang]/contact'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDict(lang);
  return pageMeta(lang, '/contact', d.nav.contact, d.contact.description);
}

export default async function Page({ params }: PageProps<'/[lang]/contact'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const t = d.contact;
  const c = d.common;
  return (
    <>
      <PageHero lang={lang} crumb={<Crumb lang={lang} items={[['OBJ', '/'], [d.nav.contact]]} />} h={t.h} />
      <section className="section section--tight" style={{ paddingTop: 0 }}>
        <div className="form-wrap">
          <Suspense><ContactForm lang={lang} t={t} /></Suspense>
          <div className="side-list reveal" style={vars({ '--d': 150 })}>
            <p className="t-label t-muted" style={{ marginBottom: 26 }}>{t.talk}</p>
            <a className="contact__row" href={`tel:${BRAND.phoneHref}`}><span className="t-label t-muted">{c.phone}</span><strong>{BRAND.phone} <span>→</span></strong></a>
            <a className="contact__row" href={`mailto:${BRAND.email}`}><span className="t-label t-muted">{c.email}</span><strong>{BRAND.email} <span>→</span></strong></a>
            <p className="t-label t-muted" style={{ margin: '40px 0 12px' }}>{c.studio}</p>
            <p style={{ margin: 0 }}>{BRAND.address.map((l, i) => <span key={l}>{i > 0 && <br />}{l}</span>)}</p>
            <p className="t-small t-muted" style={{ marginTop: 16 }}>{c.localTime}: <span data-clock={BRAND.timezone}>--:--</span></p>
          </div>
        </div>
      </section>
      <Crosslink lang={lang} {...t.cross} />
      <Statement h={[t.bye]} />
    </>
  );
}
