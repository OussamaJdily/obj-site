import { ImageResponse } from 'next/og';
import { getDict } from '@/content';
import { BRAND } from '@/lib/brand';
import { hasLocale } from '@/lib/i18n';

// Share preview (WhatsApp, LinkedIn, Facebook…) for every page of a language.
export const alt = `${BRAND.name} — branding & design studio, ${BRAND.city}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const d = getDict(hasLocale(lang) ? lang : 'fr');
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72,
        color: '#f5f5f2', background: 'radial-gradient(70% 90% at 90% 0%, rgba(189,108,247,.55), rgba(60,28,126,.9) 45%, #080808 85%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', fontSize: 88, fontWeight: 800, letterSpacing: -4 }}>
          {BRAND.word}
          <div style={{ width: 26, height: 26, borderRadius: 26, background: '#cdfb50', marginLeft: 8, marginTop: 6 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1, letterSpacing: -3, textTransform: 'uppercase' }}>{`${d.home.h1[0]} ${d.home.h1[1]}`}</div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1, letterSpacing: -3, textTransform: 'uppercase' }}>{`${d.home.h1[2]} ${d.home.h1[3]}`}</div>
          <div style={{ fontSize: 28, marginTop: 28, color: 'rgba(245,245,242,.75)' }}>{`Branding & design · ${BRAND.city}`}</div>
        </div>
      </div>
    ),
    size,
  );
}
