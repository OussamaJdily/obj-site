import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getDict } from '@/content';
import { BRAND } from '@/lib/brand';
import { hasLocale, locales } from '@/lib/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Chrome from '@/components/Chrome';
import '../globals.css';

// Manrope variable font, self-hosted (no request to Google). Latin subset covers English and French.
const manrope = localFont({
  src: '../fonts/manrope-latin-wght-normal.woff2',
  weight: '200 800',
  display: 'swap',
  variable: '--font-manrope',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
});

export const viewport: Viewport = { themeColor: '#080808', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDict(lang);
  return {
    metadataBase: new URL(BRAND.url),
    title: { default: d.meta.title, template: `%s — ${BRAND.name}` },
    description: d.meta.description,
    applicationName: BRAND.name,
    formatDetection: { telephone: false },
  };
}

export function generateStaticParams() {
  return locales.map(lang => ({ lang }));
}

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const n = d.nav;

  const orgJsonLd = {
    '@context': 'https://schema.org', '@type': 'ProfessionalService', name: BRAND.name, url: `${BRAND.url}/${lang}`,
    email: BRAND.email, telephone: BRAND.phone, areaServed: 'MA',
    address: { '@type': 'PostalAddress', streetAddress: BRAND.address[1], addressLocality: BRAND.city, addressCountry: BRAND.country },
  };

  return (
    <html lang={lang} className={`js ${manrope.variable}`}>
      <body>
        <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, '\\u003c') }} />
        <div className="bg-dots" aria-hidden="true" />
        <div className="bg-morph" aria-hidden="true" />
        <Header lang={lang} d={d} />
        <Chrome
          lang={lang}
          labels={{
            menu: n.menu, openMenu: n.openMenu, closeMenu: n.closeMenu, checkPotential: n.checkPotential,
            soundOn: d.common.soundOn, soundOff: d.common.soundOff, solutions: n.solutions, contact: n.contact, home: n.home,
            mark: BRAND.mark, phone: BRAND.phone, phoneHref: BRAND.phoneHref, email: BRAND.email,
          }}
          links={[['/', n.home], ['/visibility', n.visibility], ['/conversion', n.conversion], ['/projects', n.projects], ['/agency', n.agency], ['/insights', n.insights], ['/contact', n.contact]]}
          services={[['/seo', n.services.seo], ['/geo', n.services.geo], ['/websites', n.services.websites], ['/online-shops', n.services['online-shops']], ['/conversion-optimization', n.services['conversion-optimization']], ['/strategy-workshops', n.strategy]]}
        />
        <main id="main">{children}</main>
        <Footer lang={lang} d={d} />
      </body>
    </html>
  );
}
