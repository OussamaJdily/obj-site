'use client';
// Everything interactive that lives around the pages: floating header pill, fullscreen menu,
// sound toggle, custom cursor, scroll progress, page transitions, smooth scrolling and
// the per-page scroll effects.
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { href, type Locale } from '@/lib/i18n';
import { initPage, initSmoothScroll } from '@/lib/effects';
import { ArrowIcon } from './ui';
import LangSwitch from './LangSwitch';

type Labels = {
  menu: string; openMenu: string; closeMenu: string; checkPotential: string; soundOn: string; soundOff: string;
  solutions: string; contact: string; home: string; mark: string; phone: string; phoneHref: string; email: string;
};

export default function Chrome({ lang, labels, links, services }: {
  lang: Locale; labels: Labels; links: [string, string][]; services: [string, string][];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sound, setSound] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const audio = useRef<AudioContext | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const reduce = useRef(false);

  // per-page scroll effects; re-run after every navigation
  useEffect(() => {
    const root = document.documentElement;
    const intro = document.querySelector('.intro');
    const delay = intro && !(window as unknown as { __objNav?: boolean }).__objNav ? 2300 : 0;
    const cleanup = initPage({ revealDelay: delay });
    if (root.classList.contains('pt-leave')) {
      root.classList.remove('pt-leave');
      root.classList.add('pt-enter');
      const t = setTimeout(() => root.classList.remove('pt-enter'), 700);
      return () => { clearTimeout(t); cleanup(); };
    }
    return cleanup;
  }, [pathname]);

  // global, once: smooth scroll, page transitions, cursor, sound preference
  useEffect(() => {
    const root = document.documentElement;
    reduce.current = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stopSmooth = initSmoothScroll();
    try { setSound(sessionStorage.getItem('obj-sound') === '1'); } catch { /* storage blocked */ }

    // circle grows from the click point, then the next page is revealed
    const onClick = (e: MouseEvent) => {
      if (reduce.current || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      e.preventDefault(); e.stopPropagation();
      root.style.setProperty('--pt-x', (e.clientX / innerWidth) * 100 + '%');
      root.style.setProperty('--pt-y', (e.clientY / innerHeight) * 100 + '%');
      root.classList.add('pt-leave');
      (window as unknown as { __objNav?: boolean }).__objNav = true;
      setTimeout(() => router.push(url.pathname + url.search + url.hash), 620);
    };
    document.addEventListener('click', onClick, true);

    // custom cursor
    let raf = 0;
    const fine = matchMedia('(pointer: fine)').matches;
    const cleanCursor: (() => void)[] = [];
    if (fine && !reduce.current && cursorRef.current) {
      root.classList.add('has-cursor');
      const cur = cursorRef.current;
      let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
      const move = (e: PointerEvent) => { mx = e.clientX; my = e.clientY; };
      const over = (e: PointerEvent) => cur.classList.toggle('is-hover', !!(e.target as Element).closest?.('a, button, label, summary'));
      const loop = () => { cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22; cur.style.transform = `translate(${cx}px,${cy}px)`; raf = requestAnimationFrame(loop); };
      addEventListener('pointermove', move, { passive: true });
      document.addEventListener('pointerover', over);
      loop();
      cleanCursor.push(() => { removeEventListener('pointermove', move); document.removeEventListener('pointerover', over); root.classList.remove('has-cursor'); });
    }
    return () => { stopSmooth(); document.removeEventListener('click', onClick, true); cancelAnimationFrame(raf); cleanCursor.forEach(f => f()); };
  }, [router]);

  // UI sound: soft blip when hovering links/buttons, only if switched on
  useEffect(() => {
    try { sessionStorage.setItem('obj-sound', sound ? '1' : '0'); } catch { /* ignore */ }
    if (!sound) return;
    const over = (e: PointerEvent) => {
      const t = (e.target as Element).closest?.('a, button');
      if (!t || t.contains(e.relatedTarget as Node)) return;
      const ctx = (audio.current ||= new AudioContext());
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 880 + Math.random() * 220; o.type = 'sine';
      g.gain.setValueAtTime(0.04, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.13);
    };
    document.addEventListener('pointerover', over);
    return () => document.removeEventListener('pointerover', over);
  }, [sound]);

  // menu: close on navigation and on Escape; focus management
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', menuOpen);
    if (!menuOpen) return;
    const t = setTimeout(() => closeRef.current?.focus(), 300);
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenuOpen(false); openRef.current?.focus(); } };
    addEventListener('keydown', esc);
    return () => { clearTimeout(t); removeEventListener('keydown', esc); };
  }, [menuOpen]);

  const openMenu = (e: React.MouseEvent) => {
    menuRef.current?.style.setProperty('--mx', e.clientX + 'px');
    menuRef.current?.style.setProperty('--my', e.clientY + 'px');
    setMenuOpen(true);
  };
  const isCurrent = (path: string) => (pathname === href(lang, path) ? 'page' : undefined);

  return (
    <>
      <div className="pill">
        <Link href={href(lang, '/')} className="pill__mark" aria-label={labels.home}>{labels.mark}</Link>
        <Link href={href(lang, '/potential-check')} className="btn btn--primary btn--sm">{labels.checkPotential} <ArrowIcon /></Link>
        <button type="button" className="burger" aria-label={labels.openMenu} aria-expanded={menuOpen} onClick={openMenu} ref={openRef}><span /></button>
      </div>

      <div className="menu" ref={menuRef} aria-hidden={!menuOpen} role="dialog" aria-modal="true" aria-label={labels.menu} inert={!menuOpen}>
        <button type="button" className="burger menu__close" aria-label={labels.closeMenu} onClick={() => setMenuOpen(false)} ref={closeRef}>✕</button>
        <div>
          <p className="t-label t-muted" style={{ marginBottom: 24 }}>{labels.menu}</p>
          {links.map(([path, label], i) => (
            <Link key={path} className="menu__link" style={{ '--i': i } as React.CSSProperties} href={href(lang, path)} aria-current={isCurrent(path)}>{label}</Link>
          ))}
        </div>
        <div className="menu__side">
          <LangSwitch lang={lang} />
          <p className="t-label t-muted" style={{ marginTop: 12 }}>{labels.solutions}</p>
          {services.map(([path, label]) => <Link key={path} href={href(lang, path)}>{label}</Link>)}
          <p className="t-label t-muted" style={{ marginTop: 20 }}>{labels.contact}</p>
          <a href={`tel:${labels.phoneHref}`}>{labels.phone}</a>
          <a href={`mailto:${labels.email}`}>{labels.email}</a>
          <div style={{ marginTop: 16 }}><Link href={href(lang, '/potential-check')} className="btn btn--primary">{labels.checkPotential} <ArrowIcon /></Link></div>
        </div>
      </div>

      <div className="pt" aria-hidden="true" />
      <nav className="pgp" aria-hidden="true"><i /></nav>
      <button type="button" className={`sound${sound ? ' is-on' : ''}`} aria-pressed={sound} onClick={() => setSound(s => !s)}>
        <span>{sound ? labels.soundOn : labels.soundOff}</span>
        <span className="sound__bars" aria-hidden="true"><i /><i /><i /><i /></span>
      </button>
      <div className="cursor" aria-hidden="true" ref={cursorRef}><span className="cursor__dot" /></div>
    </>
  );
}
