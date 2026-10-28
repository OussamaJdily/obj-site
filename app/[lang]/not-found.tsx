'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowIcon, DiagIcon } from '@/components/ui';

// not-found.tsx receives no props, so the language is read from the URL.
const T = {
  fr: { h: 'Perdu dans l’espace.', text: 'Cette page n’existe pas (ou plus). Revenons sur le bon chemin.', home: 'Retour à l’accueil', projects: 'Voir les projets' },
  en: { h: 'Lost in space.', text: 'This page doesn’t exist (anymore). Let’s get you back on track.', home: 'Back to home', projects: 'View projects' },
};

export default function NotFound() {
  const lang = usePathname()?.startsWith('/en') ? 'en' : 'fr';
  const t = T[lang];
  return (
    <section className="notfound">
      <div>
        <div className="notfound__num">4<i />4</div>
        <h1 className="t-h2" style={{ marginTop: 40 }}>{t.h}</h1>
        <p className="lead" style={{ margin: '20px auto 34px' }}>{t.text}</p>
        <div className="btn-row" style={{ justifyContent: 'center' }}>
          <Link href={`/${lang}`} className="btn btn--primary">{t.home} <ArrowIcon /></Link>
          <Link href={`/${lang}/projects`} className="btn btn--secondary btn--diag">{t.projects} <DiagIcon /></Link>
        </div>
      </div>
    </section>
  );
}
