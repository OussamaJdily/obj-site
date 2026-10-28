'use client';
import { useLayoutEffect, useRef, useState } from 'react';

/** Home-page loader: the wordmark draws itself, a green dot lands, then a circle opens onto the page.
 *  Plays on a direct visit to the home page, not when arriving via an in-site link. */
export default function Intro({ word }: { word: string }) {
  const [show, setShow] = useState(true);
  const text = useRef<SVGTextElement>(null);
  const dot = useRef<SVGCircleElement>(null);

  useLayoutEffect(() => {
    const w = window as unknown as { __objNav?: boolean };
    if (w.__objNav || matchMedia('(prefers-reduced-motion: reduce)').matches) { setShow(false); return; }
    const place = () => { if (text.current && dot.current) { const bb = text.current.getBBox(); dot.current.setAttribute('cx', String(bb.x + bb.width + 22)); } };
    place(); document.fonts?.ready.then(place);
    const t = setTimeout(() => setShow(false), 3400);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;
  return (
    <div className="intro" aria-hidden="true">
      <svg viewBox="0 0 520 160"><text ref={text} x="260" y="120" textAnchor="middle">{word}</text><circle ref={dot} cx="400" cy="112" r="14" /></svg>
    </div>
  );
}
