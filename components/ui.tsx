import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { href, type Locale } from '@/lib/i18n';

export const ArrowIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
);
export const DiagIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 4l8 8M12 5v7H5" /></svg>
);
export const ChevIcon = () => (
  <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M2 3.5l3 3 3-3" /></svg>
);

/** Heading whose lines slide up from behind a mask when scrolled into view. */
export function Lines({ as: Tag = 'h2', lines, className = 't-h2', style }: {
  as?: 'h1' | 'h2' | 'h3' | 'p'; lines: string[]; className?: string; style?: CSSProperties;
}) {
  return (
    <Tag className={`${className} lines`} data-lines="" style={style}>
      {lines.map((l, i) => (
        <span className="ln" style={{ '--i': i } as CSSProperties} key={i}><span>{l}</span></span>
      ))}
    </Tag>
  );
}

type BtnProps = {
  lang: Locale; to: string; children: ReactNode; kind?: 'primary' | 'secondary' | 'ghost';
  small?: boolean; diag?: boolean; magnetic?: boolean; className?: string; style?: CSSProperties;
};
export function Btn({ lang, to, children, kind = 'primary', small, diag, magnetic, className = '', style }: BtnProps) {
  const cls = ['btn', `btn--${kind}`, small && 'btn--sm', diag && 'btn--diag', magnetic && 'magnetic', className].filter(Boolean).join(' ');
  return (
    <Link href={href(lang, to)} className={cls} style={style}>
      {children} {diag ? <DiagIcon /> : <ArrowIcon />}
    </Link>
  );
}

/** Inline style helper for CSS custom properties (animation delays etc.). */
export const vars = (v: Record<string, string | number>) => v as CSSProperties;
