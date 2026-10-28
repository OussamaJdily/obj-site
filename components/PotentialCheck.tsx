'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import type { Dict } from '@/content/types';
import { href, type Locale } from '@/lib/i18n';
import { ArrowIcon } from './ui';

type Key = 'before' | 'after' | 'both';

function score(a: Record<string, string>): Key {
  let before = 0, after = 0;
  if (a.problem === 'found') before += 3;
  if (a.problem === 'convert') after += 3;
  if (a.problem === 'both') { before += 2; after += 2; }
  if (a.searchable === 'no') before += 2;
  if (a.searchable === 'partly') before += 1;
  if (a.source === 'ads' || a.source === 'social') after += 1;
  if (a.clear === 'few' || a.clear === 'unknown') after += 2;
  if (a.ads === 'google' || a.ads === 'social') after += 1;
  return Math.abs(before - after) <= 1 ? 'both' : before > after ? 'before' : 'after';
}

export default function PotentialCheck({ lang, t }: { lang: Locale; t: Dict['check'] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Key | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const total = t.questions.length;
  const [name, question, options] = t.questions[step];

  const scrollIn = () => box.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const next = () => {
    if (step < total - 1) { setStep(step + 1); return; }
    setResult(score(answers)); scrollIn();
  };
  const restart = () => { setAnswers({}); setStep(0); setResult(null); };

  if (result) {
    const r = t.results[result];
    const topicIndex = result === 'before' ? 0 : result === 'after' ? 3 : 5; // Visibility / Conversion / Not sure yet
    const note = `${t.title}: ${r.hl} — ${Object.entries(answers).map(([k, v]) => `${k}=${v}`).join(', ')}`;
    return (
      <div className="pc form" ref={box} id="check" aria-live="polite">
        <p className="t-label t-muted">{t.result}</p>
        <p className="pc__q">{r.lead} <span style={{ color: 'var(--c-green-400)' }}>{r.hl}</span></p>
        <p className="lead lead--wide">{r.text}</p>
        <div className="btn-row" style={{ marginTop: 30 }}>
          <Link href={href(lang, r.link[0])} className="btn btn--ghost btn--sm">{r.link[1]} <ArrowIcon /></Link>
        </div>
        <div className="btn-row" style={{ marginTop: 40 }}>
          <Link className="btn btn--primary" href={`${href(lang, '/contact')}?topic=${topicIndex}&note=${encodeURIComponent(note)}`}>{t.discuss} <ArrowIcon /></Link>
          <button type="button" className="btn btn--secondary" onClick={restart}>{t.restart}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pc form" ref={box} id="check">
      <div className="pc__progress"><i style={{ '--p': step / total } as React.CSSProperties} /></div>
      <form onSubmit={e => { e.preventDefault(); if (answers[name]) next(); }}>
        <fieldset className="pc__step is-active" key={name}>
          <legend className="sr-only">{question}</legend>
          <p className="t-label t-muted">{t.question} {step + 1}</p>
          <p className="pc__q">{question}</p>
          <div className="pc__opts">
            {options.map(([v, label]) => (
              <label className="opt" key={v}>
                <input type="radio" name={name} value={v} checked={answers[name] === v} onChange={() => setAnswers({ ...answers, [name]: v })} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="pc__nav">
          <button type="button" className="btn btn--ghost btn--sm" disabled={step === 0} onClick={() => setStep(step - 1)}>{t.back}</button>
          <span className="t-label t-muted">{step + 1} / {total}</span>
          <button type="submit" className="btn btn--primary" disabled={!answers[name]}>{step === total - 1 ? t.seeResult : t.next} <ArrowIcon /></button>
        </div>
      </form>
    </div>
  );
}
