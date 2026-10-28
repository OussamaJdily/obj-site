import { notFound } from 'next/navigation';
import { getDict } from '@/content';
import { hasLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import HubPage from '@/components/HubPage';

export async function generateMetadata({ params }: PageProps<'/[lang]/visibility'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const hb = getDict(lang).hubs.visibility;
  return pageMeta(lang, '/visibility', hb.title, hb.lead);
}

export default async function Page({ params }: PageProps<'/[lang]/visibility'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <HubPage lang={lang} d={getDict(lang)} slug="visibility" />;
}
