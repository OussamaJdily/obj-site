/* Nova Studio — shared behaviour for every page.
   No libraries: requestAnimationFrame, IntersectionObserver and Canvas 2D only.
   Every module checks that its elements exist, so one file serves all pages. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
  const sectionProgress = el => { const r = el.getBoundingClientRect(); return clamp(-r.top / Math.max(1, r.height - innerHeight)); };
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) {} },
  };
  const scrollHandlers = [];
  const onScroll = fn => scrollHandlers.push(fn);

  /* ---------- page transition: circle grows from the click, shrinks on the next page ---------- */
  const pt = $('.pt');
  if (pt && !reduce) {
    const saved = store.get('nova-pt');
    store.del('nova-pt');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (Date.now() - p.t < 4000) {
          root.style.setProperty('--pt-x', p.x + '%'); root.style.setProperty('--pt-y', p.y + '%');
          root.classList.add('pt-enter', 'no-intro');
          setTimeout(() => root.classList.remove('pt-enter'), 700);
        }
      } catch (e) {}
    }
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || /^(mailto|tel|https?):/.test(href)) return;
      const url = new URL(href, location.href);
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      const x = e.clientX / innerWidth * 100, y = e.clientY / innerHeight * 100;
      root.style.setProperty('--pt-x', x + '%'); root.style.setProperty('--pt-y', y + '%');
      store.set('nova-pt', JSON.stringify({ x, y, t: Date.now() }));
      root.classList.add('pt-leave');
      setTimeout(() => { location.href = url.href; }, 620);
    });
    addEventListener('pageshow', e => { if (e.persisted) root.classList.remove('pt-leave'); });
  }

  /* ---------- intro (home only), once per session ---------- */
  const intro = $('.intro');
  let introDelay = 0;
  if (intro) {
    if (store.get('nova-intro') || reduce || root.classList.contains('no-intro')) root.classList.add('no-intro');
    else introDelay = 2300;
    store.set('nova-intro', '1');
  }

  /* ---------- reveals ---------- */
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  $$('[data-lines], .reveal, [data-card], [data-portrait], [data-inview], .timeline li').forEach(el => {
    // above-the-fold content plays on load (after the intro), staggered by its --d / --i
    if (el.closest('[data-instant]')) return setTimeout(() => el.classList.add('is-in'), introDelay + 60);
    io.observe(el);
  });

  /* ---------- header state, background morph, page progress ---------- */
  const spaces = $$('[data-space]');
  const pgp = $('.pgp');
  const readBar = $('.read-progress');
  onScroll(() => {
    root.classList.toggle('is-scrolled', scrollY > 120);
    const mid = innerHeight * .5;
    root.classList.toggle('is-space', spaces.some(s => { const r = s.getBoundingClientRect(); return r.top < mid && r.bottom > mid; }));
    const total = scrollY / Math.max(1, root.scrollHeight - innerHeight);
    if (pgp) pgp.style.setProperty('--p', total);
    if (readBar) { const art = $('.article'); readBar.style.setProperty('--p', art ? sectionProgress(art) : total); }
  });

  /* ---------- smooth wheel scrolling (desktop) ---------- */
  if (!reduce && fine) {
    let target = scrollY, cur = scrollY, raf = 0, last = 0;
    const max = () => root.scrollHeight - innerHeight;
    const scrollable = el => {
      for (; el && el !== document.body; el = el.parentElement) {
        if (el.matches?.('textarea, select, .menu')) return true;
        const s = getComputedStyle(el);
        if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 1) return true;
      }
      return false;
    };
    const tick = t => {
      const dt = last ? Math.min(50, t - last) : 16.7; last = t;
      cur += (target - cur) * (1 - Math.pow(1 - .11, dt / 16.7));
      if (Math.abs(target - cur) < .4) cur = target;
      scrollTo({ top: cur, behavior: 'instant' });
      raf = cur === target ? 0 : requestAnimationFrame(tick);
      if (!raf) last = 0;
    };
    addEventListener('wheel', e => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || root.classList.contains('menu-open') || scrollable(e.target)) return;
      e.preventDefault();
      if (!raf) { cur = target = scrollY; }
      const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
      target = clamp(target + dy, 0, max());
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: false });
    addEventListener('scroll', () => { if (!raf) cur = target = scrollY; }, { passive: true });
    addEventListener('keydown', () => { if (raf) { cancelAnimationFrame(raf); raf = 0; last = 0; cur = target = scrollY; } });
  }

  /* ---------- solutions dropdown (click/keyboard support on top of CSS hover) ---------- */
  $$('.nav__drop').forEach(d => {
    const btn = $('button', d);
    btn.addEventListener('click', () => { const open = d.classList.toggle('is-open'); btn.setAttribute('aria-expanded', open); });
    document.addEventListener('click', e => { if (!d.contains(e.target)) { d.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); } });
  });

  /* ---------- fullscreen menu ---------- */
  const menu = $('.menu');
  if (menu) {
    const openBtn = $('[data-menu-open]'), closeBtn = $('[data-menu-close]');
    openBtn.addEventListener('click', e => {
      menu.style.setProperty('--mx', e.clientX + 'px'); menu.style.setProperty('--my', e.clientY + 'px');
      root.classList.add('menu-open'); menu.setAttribute('aria-hidden', 'false'); openBtn.setAttribute('aria-expanded', 'true');
      setTimeout(() => closeBtn.focus(), 300);
    });
    const close = () => { root.classList.remove('menu-open'); menu.setAttribute('aria-hidden', 'true'); openBtn.setAttribute('aria-expanded', 'false'); };
    closeBtn.addEventListener('click', close);
    $$('a', menu).forEach(a => a.addEventListener('click', close));
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ---------- live clocks ---------- */
  const clocks = $$('[data-clock]');
  if (clocks.length) {
    const tickClock = () => clocks.forEach(c => c.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: c.dataset.clock || 'Europe/Berlin' }));
    tickClock(); setInterval(tickClock, 10000);
  }
  $$('[data-year]').forEach(y => y.textContent = new Date().getFullYear());

  /* ---------- custom cursor, magnetic buttons, tilt cards ---------- */
  if (fine && !reduce) {
    const cur = $('.cursor');
    if (cur) {
      root.classList.add('has-cursor');
      let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
      addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
      const loop = () => { cx += (mx - cx) * .22; cy += (my - cy) * .22; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); };
      loop();
      document.addEventListener('pointerover', e => cur.classList.toggle('is-hover', !!e.target.closest('a, button, label, summary')));
    }
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      b.addEventListener('pointerleave', () => b.style.transform = '');
    });
    $$('[data-tilt]').forEach(t => {
      t.addEventListener('pointermove', e => {
        const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        t.style.setProperty('--ty', (x - .5) * 8 + 'deg'); t.style.setProperty('--tx', (.5 - y) * 8 + 'deg');
        t.style.setProperty('--ts', 1.02); t.style.setProperty('--lx', x * 100 + '%'); t.style.setProperty('--ly', y * 100 + '%'); t.style.setProperty('--lo', 1);
      });
      t.addEventListener('pointerleave', () => ['--tx', '--ty', '--ts', '--lo'].forEach(p => t.style.removeProperty(p)));
    });
  }

  /* ---------- footer wordmark hop ---------- */
  $$('[data-wordmark] span').forEach(s => s.addEventListener('pointerenter', () => { s.classList.remove('hop'); void s.offsetWidth; s.classList.add('hop'); }));

  /* ---------- UI sound (soft blip on hover when switched on) ---------- */
  const soundBtn = $('[data-sound]');
  if (soundBtn) {
    let actx = null, on = store.get('nova-sound') === '1';
    const render = () => {
      soundBtn.classList.toggle('is-on', on); soundBtn.setAttribute('aria-pressed', on);
      $('[data-sound-label]', soundBtn).textContent = on ? 'Sound on' : 'Sound off';
    };
    render();
    soundBtn.addEventListener('click', () => {
      on = !on; store.set('nova-sound', on ? '1' : '0'); render();
      if (on && !actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    });
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('a, button');
      if (!on || !t || t.contains(e.relatedTarget)) return;
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.frequency.value = 880 + Math.random() * 220; o.type = 'sine';
      g.gain.setValueAtTime(.04, actx.currentTime); g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime + .12);
      o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + .13);
    });
  }

  /* ---------- halftone "dot" portraits (placeholders until real photos are added) ---------- */
  const drawDots = c => {
    const r = c.getBoundingClientRect(); if (!r.width) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    c.width = r.width * dpr; c.height = r.height * dpr;
    const g = c.getContext('2d'); g.scale(dpr, dpr);
    let s = +(c.dataset.seed || 3); const rnd = () => ((s = s * 16807 % 2147483647) - 1) / 2147483646;
    const blobs = c.dataset.group
      ? [[.3, .35, .16], [.62, .3, .15], [.45, .62, .3], [.8, .7, .22], [.18, .75, .2]]
      : [[.5 + (rnd() - .5) * .1, .36, .2 + rnd() * .04], [.5, .82, .42 + rnd() * .06]];
    for (let y = 6; y < r.height; y += 7) for (let x = 6; x < r.width; x += 7) {
      let v = 0; for (const [bx, by, br] of blobs) v += Math.max(0, 1 - Math.hypot(x / r.width - bx, (y / r.height - by) * .8) / br);
      v = Math.min(1, v); if (v < .05) continue;
      g.fillStyle = `rgba(245,245,242,${.15 + v * .7})`;
      g.beginPath(); g.arc(x, y, .4 + v * 2.2, 0, 6.283); g.fill();
    }
  };
  const dotCanvases = $$('[data-portrait] canvas');
  dotCanvases.forEach(drawDots);

  /* ---------- count-up numbers ---------- */
  const countIO = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    countIO.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = pre + to + suf; return; }
    const t0 = performance.now();
    const step = t => { const k = smooth(clamp((t - t0) / 1600)); el.textContent = pre + Math.round(to * k) + suf; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .5 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- pinned sections ---------- */
  const journey = $('[data-journey]');
  if (journey) {
    const steps = $$('.step', journey), fill = $('.rail__fill', journey);
    onScroll(() => {
      const jp = clamp(sectionProgress(journey) * 1.15);
      fill.style.setProperty('--p', jp);
      steps.forEach((s, i) => s.classList.toggle('is-on', jp > 0 && jp >= i / (steps.length - 1) - .001));
    });
  }
  // non-pinned rails fill while they cross the viewport
  $$('[data-rail]').forEach(rail => {
    const steps = $$('.step', rail), fill = $('.rail__fill', rail);
    onScroll(() => {
      const r = rail.getBoundingClientRect();
      const p = clamp((innerHeight * .85 - r.top) / (innerHeight * .5));
      fill.style.setProperty('--p', p);
      steps.forEach((s, i) => s.classList.toggle('is-on', p > 0 && p >= i / (steps.length - 1) - .001));
    });
  });

  const stance = $('[data-stance]');
  if (stance) {
    const items = $$('.stance__item', stance), dots = $$('.stance__dots i', stance);
    items.forEach(p => {
      const words = p.textContent.trim().split(/\s+/), mute = +(p.dataset.mute || 2);
      p.innerHTML = words.map((w, i) => `<span class="w${i < mute ? ' mute' : ''}">${w}</span>`).join(' ');
    });
    onScroll(() => {
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
    const items = $$('li', proc), rail = $('.process__rail', proc), desc = $('.process__desc', proc);
    let lastIdx = -1;
    onScroll(() => {
      const pp = sectionProgress(proc);
      rail.style.setProperty('--p', pp);
      const pi = Math.min(items.length - 1, Math.floor(pp * items.length));
      items.forEach((li, i) => li.classList.toggle('is-on', i <= pi));
      if (desc && pi !== lastIdx) { desc.textContent = items[pi].dataset.desc || ''; lastIdx = pi; }
    });
  });

  // search mock: "your" result climbs to the top when in view
  $$('.mock').forEach(m => {
    const you = $('.mock__row.is-you', m), first = $('.mock__row', m);
    if (you && first) you.style.setProperty('--lift', you.offsetTop - first.offsetTop);
    io.observe(m); m.setAttribute('data-inview', '');
  });

  /* ---------- insights filter ---------- */
  const filters = $('[data-filters]');
  if (filters) {
    $$('button', filters).forEach(b => b.addEventListener('click', () => {
      $$('button', filters).forEach(x => x.classList.toggle('is-on', x === b));
      const f = b.dataset.filter;
      $$('[data-topic]').forEach(p => p.classList.toggle('is-hidden', f !== 'all' && p.dataset.topic !== f));
    }));
  }

  /* ---------- contact form: validate, then send to data-endpoint or fall back to e-mail ---------- */
  $$('form[data-contact]').forEach(form => {
    const wrap = form.closest('.form');
    // pre-select a topic from ?topic=
    const topic = new URLSearchParams(location.search).get('topic');
    if (topic) { const o = form.querySelector(`input[name="topic"][value="${CSS.escape(topic)}"]`); if (o) o.checked = true; }
    const note = new URLSearchParams(location.search).get('note');
    if (note && form.message) form.message.value = note;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (form.website_hp && form.website_hp.value) return;   // honeypot
      let ok = true;
      $$('[required]', form).forEach(f => {
        const bad = f.type === 'checkbox' ? !f.checked : !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
        f.classList.toggle('is-invalid', bad); if (bad && ok) { f.focus(); ok = false; }
      });
      if (!ok) return;
      const data = Object.fromEntries(new FormData(form));
      data.topic = $$('input[name="topic"]:checked', form).map(i => i.value).join(', ');
      const endpoint = form.dataset.endpoint;
      if (endpoint) {
        try {
          const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
          if (!res.ok) throw new Error(res.status);
        } catch (err) { alert('Sorry, sending failed. Please e-mail us directly.'); return; }
      } else {
        const body = Object.entries(data).filter(([k, v]) => v && k !== 'privacy' && k !== 'website_hp').map(([k, v]) => `${k}: ${v}`).join('\n');
        location.href = `mailto:${form.dataset.mail}?subject=${encodeURIComponent('Project inquiry')}&body=${encodeURIComponent(body)}`;
      }
      wrap.classList.add('is-sent');
      wrap.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    });
    $$('[required]', form).forEach(f => f.addEventListener('input', () => f.classList.remove('is-invalid')));
  });

  /* ---------- potential check ---------- */
  const pc = $('[data-check]');
  if (pc) {
    const steps = $$('.pc__step', pc), bar = $('.pc__progress', pc), back = $('[data-back]', pc), next = $('[data-next]', pc), count = $('[data-step-count]', pc);
    let i = 0;
    const show = () => {
      steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
      bar.style.setProperty('--p', i / steps.length);
      back.disabled = i === 0;
      next.disabled = !$$('input', steps[i]).some(x => x.checked) && !steps[i].dataset.optional;
      next.firstChild.textContent = i === steps.length - 1 ? 'See result ' : 'Next ';
      count.textContent = `${i + 1} / ${steps.length}`;
    };
    pc.addEventListener('change', show);
    $('form', pc).addEventListener('submit', e => { e.preventDefault(); if (!next.disabled) next.click(); });
    back.addEventListener('click', () => { if (i > 0) { i--; show(); } });
    next.addEventListener('click', () => {
      if (i < steps.length - 1) { i++; show(); return; }
      const ans = Object.fromEntries(new FormData($('form', pc)));
      const score = { before: 0, after: 0 };
      if (ans.problem === 'found') score.before += 3; if (ans.problem === 'convert') score.after += 3; if (ans.problem === 'both') { score.before += 2; score.after += 2; }
      if (ans.searchable === 'no') score.before += 2; if (ans.searchable === 'partly') score.before += 1;
      if (ans.source === 'ads' || ans.source === 'social') score.after += 1;
      if (ans.clear === 'few' || ans.clear === 'unknown') score.after += 2;
      if (ans.ads === 'yes') score.after += 1;
      const key = Math.abs(score.before - score.after) <= 1 ? 'both' : score.before > score.after ? 'before' : 'after';
      $$('[data-result]', pc).forEach(r => r.hidden = r.dataset.result !== key);
      const note = `Potential check result: ${key}. Answers: ${Object.entries(ans).map(([k, v]) => `${k}=${v}`).join(', ')}`;
      $$('[data-result-cta]', pc).forEach(a => a.href = `contact.html?topic=${key === 'before' ? 'Visibility' : key === 'after' ? 'Conversion' : 'Not sure yet'}&note=${encodeURIComponent(note)}`);
      pc.classList.add('is-done');
      bar.style.setProperty('--p', 1);
      scrollTo({ top: pc.getBoundingClientRect().top + scrollY - 120, behavior: reduce ? 'auto' : 'smooth' });
    });
    $$('[data-check-start]').forEach(b => b.addEventListener('click', () => {
      pc.classList.remove('pc__start-hidden');
      scrollTo({ top: pc.getBoundingClientRect().top + scrollY - 120, behavior: reduce ? 'auto' : 'smooth' });
    }));
    $('[data-restart]', pc)?.addEventListener('click', () => { $('form', pc).reset(); i = 0; pc.classList.remove('is-done'); show(); });
    show();
  }

  /* ---------- home hero: drift line + content fade ---------- */
  const hero = $('[data-hero]');
  let heroP = 0;
  if (hero) {
    const drift = $('[data-drift]', hero), content = $('.hero__content', hero), glow = $('.hero__glow', hero);
    onScroll(() => {
      heroP = sectionProgress(hero);
      drift.style.transform = `translateX(${(1 - heroP) * 100 - heroP * 60}vw)`;
      drift.style.opacity = smooth(clamp((heroP - .15) * 4));
      const fade = smooth(clamp((heroP - .2) * 3));
      content.style.opacity = 1 - fade;
      content.style.transform = `translateY(${-fade * 80}px)`;
      glow.style.opacity = 1 - smooth(clamp((heroP - .6) * 2.5));
    });
  }

  /* ---------- run scroll handlers ---------- */
  let ticking = false;
  const runScroll = () => { ticking = false; scrollHandlers.forEach(fn => fn()); };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(runScroll); } }, { passive: true });
  addEventListener('resize', () => { runScroll(); dotCanvases.forEach(drawDots); });
  runScroll();

  /* ============ HERO GLOBE (Canvas 2D) ============ */
  const canvas = $('[data-globe]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const GREEN = '205, 251, 80', WHITE = '245, 245, 242';
  let W = 0, H = 0, dpr = 1, pts = [], stars = [];
  let seed = 7; const rnd = () => ((seed = seed * 16807 % 2147483647) - 1) / 2147483646;
  // cheap 3D value noise for continent-like patches
  const hash = (x, y, z) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
  const noise = (x, y, z) => {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = smooth(x - xi), yf = smooth(y - yi), zf = smooth(z - zi);
    const L = (a, b, t) => a + (b - a) * t;
    return L(L(L(hash(xi, yi, zi), hash(xi + 1, yi, zi), xf), L(hash(xi, yi + 1, zi), hash(xi + 1, yi + 1, zi), xf), yf),
             L(L(hash(xi, yi, zi + 1), hash(xi + 1, yi, zi + 1), xf), L(hash(xi, yi + 1, zi + 1), hash(xi + 1, yi + 1, zi + 1), xf), yf), zf);
  };
  const isLand = (x, y, z) => noise(x * 2.2 + 5, y * 2.2, z * 2.2) * .65 + noise(x * 5 + 1, y * 5, z * 5) * .35 > .55;

  const build = () => {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, r.width * r.height > 1600 * 900 ? 1.25 : 1.5);
    W = r.width; H = r.height; canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const N = W < 700 ? 1100 : 2400, golden = Math.PI * (3 - Math.sqrt(5));
    seed = 7; pts = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - i / (N - 1) * 2, rad = Math.sqrt(1 - y * y), th = golden * i;
      const x = Math.cos(th) * rad, z = Math.sin(th) * rad;
      pts.push({ x, y, z, land: isLand(x, y, z), found: rnd() < .08, litAt: rnd() });
    }
    stars = []; for (let i = 0; i < 240; i++) stars.push(rnd(), rnd(), rnd());
  };

  let rotY = 0, rotX = -.35, spin = 0, vel = 0, dragging = false, lastX = 0, lastY = 0, mouse = null, lastActive = 0;
  canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; lastActive = performance.now();
    if (!dragging) return;
    vel = (e.clientX - lastX) * .006; spin += vel;
    if (e.pointerType === 'mouse') rotX = clamp(rotX + (e.clientY - lastY) * .004, -1.05, .35);
    lastX = e.clientX; lastY = e.clientY;
  });
  const endDrag = () => dragging = false;
  canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', () => mouse = null);
  addEventListener('scroll', () => lastActive = performance.now(), { passive: true });

  let lastT = 0, frame = 0;
  const draw = t => {
    requestAnimationFrame(draw);
    if (hero.getBoundingClientRect().bottom < 0) return;                       // off screen
    if (!dragging && t - lastActive > 500 && ++frame % 2) return;              // half rate when idle
    const dt = lastT ? Math.min(64, t - lastT) : 16; lastT = t;

    const intro = smooth(clamp(heroP / .35));          // 0 = horizon arc, 1 = sphere on the right
    const conv = smooth(clamp((heroP - .55) / .4));    // found dots fly into the core
    if (!reduce) rotY += dt * 1.2e-4 * (1 - conv * .8);
    if (!dragging) { spin += vel; vel *= .94; }

    const mobile = W < 900;
    const endX = mobile ? W * .5 : W * .7, endY = mobile ? H * .3 : H * .46;
    const endR = Math.min(W * (mobile ? .44 : .3), H * (mobile ? .26 : .42));
    const startR = mobile ? W * 1.25 : Math.max(W * .82, H * 1.25);
    const startY = H * (mobile ? 1.05 : 1.18);
    const cx = W * .5 + (endX - W * .5) * intro, cy = startY + (endY - startY) * intro;
    const R = startR + (endR - startR) * intro, arc = 1 - intro;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(225, 215, 255, .28)';
    ctx.beginPath();
    for (let i = 0; i < stars.length; i += 3) {
      const near = stars[i + 2] > .7, sx = stars[i] * W, sy = ((stars[i + 1] * H - heroP * H * (near ? .5 : .18)) % H + H) % H, s = near ? 1.3 : .75;
      ctx.rect(sx - s / 2, sy - s / 2, s, s);
    }
    ctx.fill();

    let g = ctx.createRadialGradient(cx, cy, R * .2, cx, cy, R * 1.6);
    g.addColorStop(0, 'rgba(60, 28, 126, .45)'); g.addColorStop(1, 'rgba(60, 28, 126, 0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    if (arc > .02) {
      const rr = R * .71;
      g = ctx.createRadialGradient(cx, cy, rr * .9, cx, cy, rr * 1.12);
      g.addColorStop(0, 'rgba(120, 70, 230, 0)'); g.addColorStop(.62, `rgba(150, 100, 255, ${.32 * arc})`);
      g.addColorStop(.7, `rgba(200, 170, 255, ${.5 * arc})`); g.addColorStop(.8, `rgba(120, 70, 230, ${.18 * arc})`); g.addColorStop(1, 'rgba(60, 28, 126, 0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }

    const bodyR = R * .74;
    if (intro > .03) {
      g = ctx.createRadialGradient(cx - bodyR * .42, cy - bodyR * .5, 0, cx, cy, bodyR);
      g.addColorStop(0, `rgba(74, 42, 160, ${.32 * intro})`); g.addColorStop(.55, `rgba(22, 13, 46, ${.78 * intro})`); g.addColorStop(1, `rgba(9, 8, 14, ${.92 * intro})`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, bodyR, 0, Math.PI * 2); ctx.fill();
    }

    const a = rotY + spin, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(rotX), sb = Math.sin(rotX);
    const hoverR = 190 + arc * 130;
    for (const p of pts) {
      const x1 = p.x * ca - p.z * sa, z1 = p.x * sa + p.z * ca;
      const y2 = p.y * cb - z1 * sb, z2 = p.y * sb + z1 * cb;
      const persp = 1 / (1.9 - z2 * .55);
      let sx = cx + x1 * R * persp * 1.35, sy = cy + y2 * R * persp * 1.35;
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
      const depth = (z2 + 1) / 2, back = z2 < -.15;
      let glowAmt = 0;
      if (mouse) {
        const dx = sx - mouse.x, dy = sy - mouse.y, d = Math.hypot(dx, dy);
        if (z2 > -.1 && d < hoverR) glowAmt = Math.pow(1 - d / hoverR, 1.4);
        if (d < 90 && d > .01) { const push = Math.pow(1 - d / 90, 2) * 26 * (.4 + depth * .6); sx += dx / d * push; sy += dy / d * push; }
      }
      if (p.found) {
        const lit = intro >= p.litAt * .9 + .05;
        const k = smooth(clamp((conv - p.litAt * .45) / .55));
        sx += (cx - sx) * k; sy += (cy - sy) * k;
        if (k > .999) continue;
        const size = (1.2 + depth * 1.6) + (lit ? .8 : 0), alpha = lit ? .55 + depth * .45 : .1 + depth * .4;
        if (lit) { ctx.fillStyle = `rgba(${GREEN}, ${.12 * alpha})`; ctx.beginPath(); ctx.arc(sx, sy, size * 2.6, 0, 6.283); ctx.fill(); }
        ctx.fillStyle = `rgba(${lit ? GREEN : WHITE}, ${alpha})`;
        ctx.beginPath(); ctx.arc(sx, sy, size, 0, 6.283); ctx.fill();
      } else {
        let alpha = (.1 + depth * .45) * (1 - conv * .5) * (back ? .55 : 1);
        if (p.land) alpha += glowAmt * .75 + .12; else alpha *= 1 - glowAmt * .5;
        if (alpha < .02) continue;
        const s = (.7 + depth * 1.1 + (p.land ? glowAmt * 1.6 : 0)) * (back ? 1.8 : 1);
        ctx.fillStyle = p.land && glowAmt > .05 ? `rgba(215, 200, 255, ${Math.min(1, alpha)})` : `rgba(${WHITE}, ${Math.min(1, alpha)})`;
        ctx.fillRect(sx - s / 2, sy - s / 2, s, s);
      }
    }
    if (intro > .02) {
      g = ctx.createLinearGradient(cx - bodyR, cy - bodyR, cx + bodyR * .6, cy + bodyR * .6);
      g.addColorStop(0, `rgba(225, 200, 255, ${.7 * intro})`); g.addColorStop(.55, `rgba(189, 108, 247, ${.18 * intro})`); g.addColorStop(1, 'rgba(189, 108, 247, 0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy, bodyR, 0, Math.PI * 2); ctx.stroke();
    }
    if (conv > 0) {
      g = ctx.createRadialGradient(cx, cy, 0, cx, cy, bodyR * .35);
      g.addColorStop(0, `rgba(${GREEN}, ${.5 * conv})`); g.addColorStop(1, `rgba(${GREEN}, 0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, bodyR * .35, 0, 6.283); ctx.fill();
    }
  };
  build();
  addEventListener('resize', build);
  requestAnimationFrame(draw);
})();
