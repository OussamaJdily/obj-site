'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import type { Dict } from '@/content/types';
import { BRAND } from '@/lib/brand';
import { href, type Locale } from '@/lib/i18n';
import { ArrowIcon } from './ui';

type State = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm({ lang, t }: { lang: Locale; t: Dict['contact'] }) {
  const params = useSearchParams();
  const preTopic = params.get('topic');
  const preNote = params.get('note') || '';
  const [state, setState] = useState<State>('idle');
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const wrap = useRef<HTMLDivElement>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = Object.fromEntries(fd) as Record<string, string>;
    data.topic = fd.getAll('topic').join(', ');
    const errs = {
      message: !data.message?.trim(),
      name: !data.name?.trim(),
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || ''),
      privacy: !data.privacy,
    };
    setErrors(errs);
    const first = Object.keys(errs).find(k => errs[k as keyof typeof errs]);
    if (first) { (form.elements.namedItem(first) as HTMLElement | null)?.focus(); return; }

    setState('sending');
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, locale: lang }) });
      if (res.status === 503) {
        // e-mail service not configured yet: hand the message to the visitor's mail app instead
        const body = ['name', 'company', 'email', 'phone', 'site', 'topic', 'message'].filter(k => data[k]).map(k => `${k}: ${data[k]}`).join('\n');
        location.href = `mailto:${BRAND.email}?subject=${encodeURIComponent('Project inquiry')}&body=${encodeURIComponent(body)}`;
      } else if (!res.ok) throw new Error(String(res.status));
      setState('sent');
      wrap.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch {
      setState('error');
    }
  };

  const invalid = (k: string) => (errors[k] ? 'input is-invalid' : 'input');

  return (
    <div className={`form reveal${state === 'sent' ? ' is-sent' : ''}`} ref={wrap}>
      <form className="form__body" onSubmit={onSubmit} noValidate>
        <p className="t-label t-muted" style={{ marginBottom: 26 }}>{t.inquiry}</p>
        <fieldset>
          <legend>{t.about}</legend>
          <div className="opts">
            {t.topics.map((topic, i) => (
              <label className="opt" key={topic}>
                <input type="checkbox" name="topic" value={topic} defaultChecked={preTopic === String(i)} /><span>{topic}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="field"><label htmlFor="f-site">{t.website} <small>{t.optional}</small></label><input className="input" id="f-site" name="site" type="text" inputMode="url" placeholder={t.websitePh} autoComplete="url" maxLength={200} /></div>
        <div className="field">
          <label htmlFor="f-msg">{t.message}</label>
          <textarea className={invalid('message')} id="f-msg" name="message" required maxLength={5000} defaultValue={preNote} aria-invalid={errors.message || undefined} aria-describedby="e-msg" />
          <p className="field__error" id="e-msg">{t.messageErr}</p>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="f-name">{t.name}</label>
            <input className={invalid('name')} id="f-name" name="name" required autoComplete="name" maxLength={120} aria-invalid={errors.name || undefined} aria-describedby="e-name" />
            <p className="field__error" id="e-name">{t.nameErr}</p>
          </div>
          <div className="field"><label htmlFor="f-company">{t.company} <small>{t.optional}</small></label><input className="input" id="f-company" name="company" autoComplete="organization" maxLength={160} /></div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="f-mail">E-mail</label>
            <input className={invalid('email')} id="f-mail" name="email" type="email" required autoComplete="email" maxLength={200} aria-invalid={errors.email || undefined} aria-describedby="e-mail" />
            <p className="field__error" id="e-mail">{t.emailErr}</p>
          </div>
          <div className="field"><label htmlFor="f-phone">{t.phone} <small>{t.optional}</small></label><input className="input" id="f-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} /></div>
        </div>
        <label className="hp" aria-hidden="true">Leave empty<input name="website_hp" tabIndex={-1} autoComplete="off" /></label>
        <label className="check">
          <input type="checkbox" name="privacy" required aria-invalid={errors.privacy || undefined} />
          <span>{t.consentA} <Link href={href(lang, '/privacy')}>{t.consentLink}</Link> {t.consentB}</span>
        </label>
        <button className="btn btn--primary magnetic" type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? t.sending : t.send} <ArrowIcon />
        </button>
        {state === 'error' && <p className="field__error" role="alert" style={{ display: 'block', marginTop: 16 }}>{t.failed}</p>}
        <p className="t-small t-muted" style={{ margin: '16px 0 0' }}>{t.reply}</p>
      </form>
      <div className="form__success" role="status">
        <span className="dot" /><h2 className="t-h3">{t.thanks}</h2>
        <p className="lead" style={{ margin: '16px auto 0' }}>{t.thanksText}</p>
      </div>
    </div>
  );
}
