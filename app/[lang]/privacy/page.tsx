import { notFound } from 'next/navigation';
import { getDict } from '@/content';
import { BRAND } from '@/lib/brand';
import { hasLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import LegalPage from '@/components/LegalPage';

export async function generateMetadata({ params }: PageProps<'/[lang]/privacy'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDict(lang).legal.privacyTitle;
  return pageMeta(lang, '/privacy', t, `${t} — ${BRAND.name}, ${BRAND.city}.`);
}

export default async function Page({ params }: PageProps<'/[lang]/privacy'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const l = getDict(lang).legal;
  return <LegalPage lang={lang} title={l.privacyTitle} html={l.privacyHtml} />;
}
