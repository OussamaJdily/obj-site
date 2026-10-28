import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getDict } from '@/content';
import { BRAND } from '@/lib/brand';
import { hasLocale } from '@/lib/i18n';
import { pageMeta } from '@/lib/seo';
import { Lines, vars } from '@/components/ui';
import { Crumb, LosingCta } from '@/components/sections';
import { PostCard, formatDate } from '@/components/PostCard';

export const dynamicParams = false;
export function generateStaticParams() {
  return getDict('en').insights.map(a => ({ slug: a.slug }));
}

const anchor = (h: string) => 's-' + h.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export async function generateMetadata({ params }: PageProps<'/[lang]/insights/[slug]'>) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const a = getDict(lang).insights.find(x => x.slug === slug);
  if (!a) return {};
  const meta = pageMeta(lang, `/insights/${slug}`, a.title, a.excerpt);
  return { ...meta, openGraph: { ...meta.openGraph, type: 'article', publishedTime: a.date } };
}

export default async function ArticlePage({ params }: PageProps<'/[lang]/insights/[slug]'>) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const c = d.common;
  const a = d.insights.find(x => x.slug === slug);
  if (!a) notFound();
  const related = d.insights.filter(x => x !== a).slice(0, 3);
  const author = d.agency.team[0];
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const articleJsonLd = {
    '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.excerpt, datePublished: a.date, inLanguage: lang,
    author: { '@type': 'Person', name: author[0] }, publisher: { '@type': 'Organization', name: BRAND.name },
  };

  return (
    <>
      <div className="read-progress" aria-hidden="true" />
      <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, '\\u003c') }} />
      <section className="page-hero" data-instant="" style={{ paddingBottom: 50 }}>
        <div className="article">
          <p className="t-label t-muted page-hero__crumb reveal"><Crumb lang={lang} items={[[d.nav.insights, '/insights'], [c.topics[a.topic]]]} /></p>
          <Lines as="h1" lines={[a.title]} className="t-h2" style={{ textTransform: 'none', letterSpacing: '-.04em' }} />
          <p className="lead lead--wide reveal" style={vars({ '--d': 300, marginTop: '26px' })}>{a.excerpt}</p>
          <div className="page-hero__facts t-label t-muted reveal" style={vars({ '--d': 450 })}>
            <span><span className="dot" /> {c.topics[a.topic]}</span><span>· <time dateTime={a.date}>{formatDate(a.date, lang)}</time></span><span>· {a.read} {c.minRead}</span>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <article className="article">
          <details className="toc">
            <summary>{c.contents}</summary>
            <ol>{a.sections.map(([h]) => <li key={h}><a href={`#${anchor(h)}`}>{h}</a></li>)}</ol>
          </details>
          <div className="prose">
            {a.sections.map(([h, html]) => (
              <div key={h}><h2 id={anchor(h)}>{h}</h2><div dangerouslySetInnerHTML={{ __html: html }} /></div>
            ))}
          </div>
        </article>
      </section>

      <section className="section section--tight">
        <div className="author reveal"><div className="author__pic" /><div><strong>{author[0]}</strong><p>{author[1]} · {BRAND.name}. {d.insightsPage.authorBio}</p></div></div>
      </section>

      <section className="section">
        <p className="t-label t-muted" style={{ marginBottom: 18 }}>{c.keepReading}</p>
        <Lines lines={[c.moreArticles]} style={{ marginBottom: 40 }} />
        <div className="posts">{related.map(r => <PostCard key={r.slug} lang={lang} a={r} topicLabel={c.topics[r.topic]} minRead={c.minRead} />)}</div>
      </section>

      <LosingCta lang={lang} d={d} h={d.insightsPage.ctaH} />
    </>
  );
}
