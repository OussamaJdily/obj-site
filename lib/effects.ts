// Scroll- and pointer-driven effects for the current page. `initPage()` wires everything up
// for the DOM that is on screen and returns a cleanup function, so it can be re-run after
// every client-side navigation.

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
export const sectionProgress = (el: Element) => {
  const r = el.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, r.height - innerHeight));
};
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];

export function initPage({ revealDelay = 0 } = {}) {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const cleanups: (() => void)[] = [];
  const on = <K extends keyof WindowEventMap>(t: EventTarget, type: K | string, fn: (e: never) => void, opts?: AddEventListenerOptions) => {
    t.addEventListener(type, fn as EventListener, opts);
    cleanups.push(() => t.removeEventListener(type, fn as EventListener, opts));
  };
  const timers: number[] = [];

  /* ---------- reveals ---------- */
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  cleanups.push(() => io.disconnect());
  $$('[data-lines], .reveal, [data-card], [data-portrait], [data-inview], .timeline li, .mock').forEach(el => {
    if (el.closest('[data-instant]')) timers.push(window.setTimeout(() => el.classList.add('is-in'), revealDelay + 60));
    else io.observe(el);
  });

  /* ---------- scroll-driven pieces ---------- */
  const handlers: (() => void)[] = [];
  const spaces = $$('[data-space]');
  const pgp = document.querySelector<HTMLElement>('.pgp');
  const readBar = document.querySelector<HTMLElement>('.read-progress');
  handlers.push(() => {
    root.classList.toggle('is-scrolled', scrollY > 120);
    const mid = innerHeight * 0.5;
    root.classList.toggle('is-space', spaces.some(s => { const r = s.getBoundingClientRect(); return r.top < mid && r.bottom > mid; }));
    const total = scrollY / Math.max(1, root.scrollHeight - innerHeight);
    pgp?.style.setProperty('--p', String(total));
    if (readBar) { const art = document.querySelector('.article'); readBar.style.setProperty('--p', String(art ? sectionProgress(art) : total)); }
  });

  const journey = document.querySelector('[data-journey]');
  if (journey) {
    const steps = $$('.step', journey), fill = journey.querySelector<HTMLElement>('.rail__fill')!;
    handlers.push(() => {
      const jp = clamp(sectionProgress(journey) * 1.15);
      fill.style.setProperty('--p', String(jp));
      steps.forEach((s, i) => s.classList.toggle('is-on', jp > 0 && jp >= i / (steps.length - 1) - 0.001));
    });
  }
  $$('[data-rail]').forEach(rail => {
    const steps = $$('.step', rail), fill = rail.querySelector<HTMLElement>('.rail__fill')!;
    handlers.push(() => {
      const r = rail.getBoundingClientRect();
      const p = clamp((innerHeight * 0.85 - r.top) / (innerHeight * 0.5));
      fill.style.setProperty('--p', String(p));
      steps.forEach((s, i) => s.classList.toggle('is-on', p > 0 && p >= i / (steps.length - 1) - 0.001));
    });
  });

  const stance = document.querySelector('[data-stance]');
  if (stance) {
    const items = $$('.stance__item', stance), dots = $$('.stance__dots i', stance);
    handlers.push(() => {
      const sp = sectionProgress(stance), n = items.length;
      const idx = Math.min(n - 1, Math.floor(sp * n)), local = sp * n - idx;
      items.forEach((it, i) => {
        it.classList.toggle('is-active', i === idx);
        if (i === idx) { const ws = $$('.w', it); ws.forEach((w, k) => w.classList.toggle('is-lit', local * 1.4 > k / ws.length)); }
      });
      dots.forEach((d, i) => d.classList.toggle('is-on', i <= idx));
    });
  }

  $$('[data-process]').forEach(proc => {
    const items = $$('li', proc), rail = proc.querySelector<HTMLElement>('.process__rail')!, desc = proc.querySelector<HTMLElement>('.process__desc');
    let lastIdx = -1;
    handlers.push(() => {
      const pp = sectionProgress(proc);
      rail.style.setProperty('--p', String(pp));
      const pi = Math.min(items.length - 1, Math.floor(pp * items.length));
      items.forEach((li, i) => li.classList.toggle('is-on', i <= pi));
      if (desc && pi !== lastIdx) { desc.textContent = items[pi].dataset.desc || ''; lastIdx = pi; }
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const drift = hero.querySelector<HTMLElement>('[data-drift]')!, content = hero.querySelector<HTMLElement>('.hero__content')!, glow = hero.querySelector<HTMLElement>('.hero__glow')!;
    handlers.push(() => {
      const p = sectionProgress(hero);
      drift.style.transform = `translateX(${(1 - p) * 100 - p * 60}vw)`;
      drift.style.opacity = String(smooth(clamp((p - 0.15) * 4)));
      const fade = smooth(clamp((p - 0.2) * 3));
      content.style.opacity = String(1 - fade);
      content.style.transform = `translateY(${-fade * 80}px)`;
      glow.style.opacity = String(1 - smooth(clamp((p - 0.6) * 2.5)));
    });
  }

  // search mock: "your" result climbs to the top when in view
  $$('.mock').forEach(m => {
    const you = m.querySelector<HTMLElement>('.mock__row.is-you'), first = m.querySelector<HTMLElement>('.mock__row');
    if (you && first) you.style.setProperty('--lift', String(you.offsetTop - first.offsetTop));
  });

  let ticking = false;
  const run = () => { ticking = false; handlers.forEach(fn => fn()); };
  on(window, 'scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
  on(window, 'resize', run);
  run();

  /* ---------- count-up numbers ---------- */
  const countIO = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    countIO.unobserve(e.target);
    const el = e.target as HTMLElement, to = Number(el.dataset.count), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = pre + to + suf; return; }
    const t0 = performance.now();
    const step = (t: number) => { const k = smooth(clamp((t - t0) / 1600)); el.textContent = pre + Math.round(to * k) + suf; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.5 });
  cleanups.push(() => countIO.disconnect());
  $$('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- halftone "dot" portraits (placeholders until real photos are added) ---------- */
  const drawDots = (c: HTMLCanvasElement) => {
    const r = c.getBoundingClientRect(); if (!r.width) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    c.width = r.width * dpr; c.height = r.height * dpr;
    const g = c.getContext('2d')!; g.scale(dpr, dpr);
    let s = Number(c.dataset.seed || 3); const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    const blobs: [number, number, number][] = c.dataset.group
      ? [[0.3, 0.35, 0.16], [0.62, 0.3, 0.15], [0.45, 0.62, 0.3], [0.8, 0.7, 0.22], [0.18, 0.75, 0.2]]
      : [[0.5 + (rnd() - 0.5) * 0.1, 0.36, 0.2 + rnd() * 0.04], [0.5, 0.82, 0.42 + rnd() * 0.06]];
    for (let y = 6; y < r.height; y += 7) for (let x = 6; x < r.width; x += 7) {
      let v = 0; for (const [bx, by, br] of blobs) v += Math.max(0, 1 - Math.hypot(x / r.width - bx, (y / r.height - by) * 0.8) / br);
      v = Math.min(1, v); if (v < 0.05) continue;
      g.fillStyle = `rgba(245,245,242,${0.15 + v * 0.7})`;
      g.beginPath(); g.arc(x, y, 0.4 + v * 2.2, 0, 6.283); g.fill();
    }
  };
  const canvases = $$<HTMLCanvasElement>('[data-portrait] canvas');
  canvases.forEach(drawDots);
  on(window, 'resize', () => canvases.forEach(drawDots));

  /* ---------- pointer toys: magnetic buttons, tilt cards, wordmark hop ---------- */
  if (fine && !reduce) {
    $$('.magnetic').forEach(b => {
      on(b, 'pointermove', (e: PointerEvent) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      on(b, 'pointerleave', () => { b.style.transform = ''; });
    });
    $$('[data-tilt]').forEach(t => {
      on(t, 'pointermove', (e: PointerEvent) => {
        const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        t.style.setProperty('--ty', (x - 0.5) * 8 + 'deg'); t.style.setProperty('--tx', (0.5 - y) * 8 + 'deg');
        t.style.setProperty('--ts', '1.02'); t.style.setProperty('--lx', x * 100 + '%'); t.style.setProperty('--ly', y * 100 + '%'); t.style.setProperty('--lo', '1');
      });
      on(t, 'pointerleave', () => ['--tx', '--ty', '--ts', '--lo'].forEach(p => t.style.removeProperty(p)));
    });
  }
  $$('[data-wordmark] span').forEach(s => on(s, 'pointerenter', () => { s.classList.remove('hop'); void s.offsetWidth; s.classList.add('hop'); }));

  /* ---------- live clocks ---------- */
  const clocks = $$('[data-clock]');
  if (clocks.length) {
    const tick = () => clocks.forEach(c => { c.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: c.dataset.clock || 'UTC' }); });
    tick(); const id = window.setInterval(tick, 10000); cleanups.push(() => clearInterval(id));
  }

  return () => { timers.forEach(clearTimeout); cleanups.forEach(fn => fn()); };
}

/** Smooth wheel scrolling for mouse/trackpad on desktop. Returns a cleanup function. */
export function initSmoothScroll() {
  const root = document.documentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(pointer: fine)').matches) return () => {};
  let target = scrollY, cur = scrollY, raf = 0, last = 0;
  const max = () => root.scrollHeight - innerHeight;
  const scrollable = (el: Element | null) => {
    for (; el && el !== document.body; el = el.parentElement) {
      if (el.matches('textarea, select, .menu')) return true;
      const s = getComputedStyle(el);
      if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 1) return true;
    }
    return false;
  };
  const tick = (t: number) => {
    const dt = last ? Math.min(50, t - last) : 16.7; last = t;
    cur += (target - cur) * (1 - Math.pow(1 - 0.11, dt / 16.7));
    if (Math.abs(target - cur) < 0.4) cur = target;
    window.scrollTo({ top: cur, behavior: 'instant' });
    raf = cur === target ? 0 : requestAnimationFrame(tick);
    if (!raf) last = 0;
  };
  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || root.classList.contains('menu-open') || scrollable(e.target as Element)) return;
    e.preventDefault();
    if (!raf) { cur = target = scrollY; }
    const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
    target = clamp(target + dy, 0, max());
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const onScroll = () => { if (!raf) cur = target = scrollY; };
  const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; last = 0; cur = target = scrollY; } };
  addEventListener('wheel', onWheel, { passive: false });
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('keydown', stop);
  return () => { stop(); removeEventListener('wheel', onWheel); removeEventListener('scroll', onScroll); removeEventListener('keydown', stop); };
}
