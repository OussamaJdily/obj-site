'use client';
// Hero globe on Canvas 2D: ~2,400 Fibonacci-distributed dots with noise "continents".
// Drag to rotate, dots react to the cursor, and scroll morphs it from a glowing horizon
// into a sphere whose green "found" dots finally fly into the core (conversion).
import { useEffect, useRef } from 'react';
import { sectionProgress, smooth } from '@/lib/effects';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const GREEN = '205, 251, 80', WHITE = '245, 245, 242';

const hash = (x: number, y: number, z: number) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
const noise = (x: number, y: number, z: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = smooth(x - xi), yf = smooth(y - yi), zf = smooth(z - zi);
  const L = (a: number, b: number, t: number) => a + (b - a) * t;
  return L(L(L(hash(xi, yi, zi), hash(xi + 1, yi, zi), xf), L(hash(xi, yi + 1, zi), hash(xi + 1, yi + 1, zi), xf), yf),
    L(L(hash(xi, yi, zi + 1), hash(xi + 1, yi, zi + 1), xf), L(hash(xi, yi + 1, zi + 1), hash(xi + 1, yi + 1, zi + 1), xf), yf), zf);
};
const isLand = (x: number, y: number, z: number) => noise(x * 2.2 + 5, y * 2.2, z * 2.2) * 0.65 + noise(x * 5 + 1, y * 5, z * 5) * 0.35 > 0.55;

type Pt = { x: number; y: number; z: number; land: boolean; found: boolean; litAt: number };

export default function Globe() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const hero = canvas.closest('[data-hero]')!;
    const ctx = canvas.getContext('2d')!;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, pts: Pt[] = [], stars: number[] = [];
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

    const build = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, r.width * r.height > 1600 * 900 ? 1.25 : 1.5);
      W = r.width; H = r.height; canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const N = W < 700 ? 1100 : 2400, golden = Math.PI * (3 - Math.sqrt(5));
      seed = 7; pts = [];
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2, rad = Math.sqrt(1 - y * y), th = golden * i;
        const x = Math.cos(th) * rad, z = Math.sin(th) * rad;
        pts.push({ x, y, z, land: isLand(x, y, z), found: rnd() < 0.08, litAt: rnd() });
      }
      stars = []; for (let i = 0; i < 240; i++) stars.push(rnd(), rnd(), rnd());
    };

    let rotY = 0, rotX = -0.35, spin = 0, vel = 0, dragging = false, lastX = 0, lastY = 0, lastActive = 0;
    let mouse: { x: number; y: number } | null = null;
    const down = (e: PointerEvent) => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; lastActive = performance.now();
      if (!dragging) return;
      vel = (e.clientX - lastX) * 0.006; spin += vel;
      if (e.pointerType === 'mouse') rotX = clamp(rotX + (e.clientY - lastY) * 0.004, -1.05, 0.35);
      lastX = e.clientX; lastY = e.clientY;
    };
    const up = () => { dragging = false; };
    const leave = () => { mouse = null; };
    const scrolled = () => { lastActive = performance.now(); };
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('pointerleave', leave);
    addEventListener('scroll', scrolled, { passive: true }); addEventListener('resize', build);

    let raf = 0, lastT = 0, frame = 0;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (hero.getBoundingClientRect().bottom < 0) return;                      // off screen
      if (!dragging && t - lastActive > 500 && ++frame % 2) return;             // half rate when idle
      const dt = lastT ? Math.min(64, t - lastT) : 16; lastT = t;
      const heroP = sectionProgress(hero);
      const intro = smooth(clamp(heroP / 0.35));
      const conv = smooth(clamp((heroP - 0.55) / 0.4));
      if (!reduce) rotY += dt * 1.2e-4 * (1 - conv * 0.8);
      if (!dragging) { spin += vel; vel *= 0.94; }

      const mobile = W < 900;
      const endX = mobile ? W * 0.5 : W * 0.7, endY = mobile ? H * 0.3 : H * 0.46;
      const endR = Math.min(W * (mobile ? 0.44 : 0.3), H * (mobile ? 0.26 : 0.42));
      const startR = mobile ? W * 1.25 : Math.max(W * 0.82, H * 1.25);
      const startY = H * (mobile ? 1.05 : 1.18);
      const cx = W * 0.5 + (endX - W * 0.5) * intro, cy = startY + (endY - startY) * intro;
      const R = startR + (endR - startR) * intro, arc = 1 - intro;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(225, 215, 255, .28)';
      ctx.beginPath();
      for (let i = 0; i < stars.length; i += 3) {
        const near = stars[i + 2] > 0.7, sx = stars[i] * W, sy = (((stars[i + 1] * H - heroP * H * (near ? 0.5 : 0.18)) % H) + H) % H, s = near ? 1.3 : 0.75;
        ctx.rect(sx - s / 2, sy - s / 2, s, s);
      }
      ctx.fill();

      let g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.6);
      g.addColorStop(0, 'rgba(60, 28, 126, .45)'); g.addColorStop(1, 'rgba(60, 28, 126, 0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (arc > 0.02) {
        const rr = R * 0.71;
        g = ctx.createRadialGradient(cx, cy, rr * 0.9, cx, cy, rr * 1.12);
        g.addColorStop(0, 'rgba(120, 70, 230, 0)'); g.addColorStop(0.62, `rgba(150, 100, 255, ${0.32 * arc})`);
        g.addColorStop(0.7, `rgba(200, 170, 255, ${0.5 * arc})`); g.addColorStop(0.8, `rgba(120, 70, 230, ${0.18 * arc})`); g.addColorStop(1, 'rgba(60, 28, 126, 0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
      const bodyR = R * 0.74;
      if (intro > 0.03) {
        g = ctx.createRadialGradient(cx - bodyR * 0.42, cy - bodyR * 0.5, 0, cx, cy, bodyR);
        g.addColorStop(0, `rgba(74, 42, 160, ${0.32 * intro})`); g.addColorStop(0.55, `rgba(22, 13, 46, ${0.78 * intro})`); g.addColorStop(1, `rgba(9, 8, 14, ${0.92 * intro})`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, bodyR, 0, Math.PI * 2); ctx.fill();
      }

      const a = rotY + spin, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(rotX), sb = Math.sin(rotX);
      const hoverR = 190 + arc * 130;
      for (const p of pts) {
        const x1 = p.x * ca - p.z * sa, z1 = p.x * sa + p.z * ca;
        const y2 = p.y * cb - z1 * sb, z2 = p.y * sb + z1 * cb;
        const persp = 1 / (1.9 - z2 * 0.55);
        let sx = cx + x1 * R * persp * 1.35, sy = cy + y2 * R * persp * 1.35;
        if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
        const depth = (z2 + 1) / 2, back = z2 < -0.15;
        let glow = 0;
        if (mouse) {
          const dx = sx - mouse.x, dy = sy - mouse.y, d = Math.hypot(dx, dy);
          if (z2 > -0.1 && d < hoverR) glow = Math.pow(1 - d / hoverR, 1.4);
          if (d < 90 && d > 0.01) { const push = Math.pow(1 - d / 90, 2) * 26 * (0.4 + depth * 0.6); sx += (dx / d) * push; sy += (dy / d) * push; }
        }
        if (p.found) {
          const lit = intro >= p.litAt * 0.9 + 0.05;
          const k = smooth(clamp((conv - p.litAt * 0.45) / 0.55));
          sx += (cx - sx) * k; sy += (cy - sy) * k;
          if (k > 0.999) continue;
          const size = 1.2 + depth * 1.6 + (lit ? 0.8 : 0), alpha = lit ? 0.55 + depth * 0.45 : 0.1 + depth * 0.4;
          if (lit) { ctx.fillStyle = `rgba(${GREEN}, ${0.12 * alpha})`; ctx.beginPath(); ctx.arc(sx, sy, size * 2.6, 0, 6.283); ctx.fill(); }
          ctx.fillStyle = `rgba(${lit ? GREEN : WHITE}, ${alpha})`;
          ctx.beginPath(); ctx.arc(sx, sy, size, 0, 6.283); ctx.fill();
        } else {
          let alpha = (0.1 + depth * 0.45) * (1 - conv * 0.5) * (back ? 0.55 : 1);
          if (p.land) alpha += glow * 0.75 + 0.12; else alpha *= 1 - glow * 0.5;
          if (alpha < 0.02) continue;
          const s = (0.7 + depth * 1.1 + (p.land ? glow * 1.6 : 0)) * (back ? 1.8 : 1);
          ctx.fillStyle = p.land && glow > 0.05 ? `rgba(215, 200, 255, ${Math.min(1, alpha)})` : `rgba(${WHITE}, ${Math.min(1, alpha)})`;
          ctx.fillRect(sx - s / 2, sy - s / 2, s, s);
        }
      }
      if (intro > 0.02) {
        g = ctx.createLinearGradient(cx - bodyR, cy - bodyR, cx + bodyR * 0.6, cy + bodyR * 0.6);
        g.addColorStop(0, `rgba(225, 200, 255, ${0.7 * intro})`); g.addColorStop(0.55, `rgba(189, 108, 247, ${0.18 * intro})`); g.addColorStop(1, 'rgba(189, 108, 247, 0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy, bodyR, 0, Math.PI * 2); ctx.stroke();
      }
      if (conv > 0) {
        g = ctx.createRadialGradient(cx, cy, 0, cx, cy, bodyR * 0.35);
        g.addColorStop(0, `rgba(${GREEN}, ${0.5 * conv})`); g.addColorStop(1, `rgba(${GREEN}, 0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, bodyR * 0.35, 0, 6.283); ctx.fill();
      }
    };
    build();
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up); canvas.removeEventListener('pointerleave', leave);
      removeEventListener('scroll', scrolled); removeEventListener('resize', build);
    };
  }, []);

  return <canvas ref={ref} className="hero__canvas" aria-hidden="true" />;
}
