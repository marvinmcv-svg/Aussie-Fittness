'use client';

import { useMemo, useRef, useState } from 'react';
import { dict, type Locale } from '@/content/i18n';
import { products, whatsappUrl, type Product } from '@/content/site';
import { track } from '@/lib/track';

type Goal = 'cut' | 'build' | 'balance';
type PackId = Product['id'];
const GOALS: Goal[] = ['cut', 'build', 'balance'];
const CRAVINGS = ['burgers', 'pizza', 'mexican', 'asian', 'sweet', 'prep'] as const;
const FAKEAWAY = new Set(['burgers', 'pizza', 'mexican', 'asian']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const money = (n: number) => `A$${n.toFixed(2)}`;
const byId = (id: PackId) => products.find((p) => p.id === id)!;

/** Simple, explainable recommendation from the visitor's own answers. */
function recommend(goal: Goal | null, cravings: Set<string>): PackId {
  if (cravings.has('prep')) return 'mealprep';
  if (cravings.size >= 3) return 'bundle';
  if ([...cravings].some((c) => FAKEAWAY.has(c))) return 'fakeaway';
  if (goal === 'build') return 'elite';
  return 'elite';
}

/**
 * Four-step order builder that ends in WhatsApp. The message is composed as the
 * visitor answers and previewed live in the phone; "Send" opens wa.me with it
 * pre-filled. Nothing is sent or stored by the site itself.
 */
export function OrderBuilder({ locale }: { locale: Locale }) {
  const t = dict[locale].order;
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [cravings, setCravings] = useState<Set<string>>(new Set());
  const [pack, setPack] = useState<PackId | null>(null);
  const [extras, setExtras] = useState<Set<PackId>>(new Set());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState(locale === 'en' ? 'Australia' : '');
  const [note, setNote] = useState('');
  const [tried, setTried] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);

  const rec = recommend(goal, cravings);
  const chosen = pack ?? rec;

  const lines = useMemo(() => [chosen, ...[...extras].filter((e) => e !== chosen)].map(byId), [chosen, extras]);
  const knownTotal = lines.reduce((s, p) => s + (p.price ?? 0), 0);
  const hasTbc = lines.some((p) => p.price === null);

  const nameError = tried && !name.trim() ? t.nameError : '';
  const emailError = tried && email.trim() && !EMAIL_RE.test(email.trim()) ? t.emailError : '';

  const message = useMemo(() => {
    const m = t.msg;
    const out: string[] = [m.hello];
    if (step >= 1 || pack) {
      out.push(`*${m.intro}*`, '');
      lines.forEach((p, i) => {
        const label = i === 0 ? m.pack : m.extra;
        const price = p.price === null ? t.priceTbc : money(p.price);
        out.push(`${i === 0 ? '📦' : '➕'} *${label}:* ${t.products[p.id].name} (${price})`);
      });
    }
    if (goal || cravings.size) out.push('');
    if (goal) out.push(`🎯 *${m.goal}:* ${t.goals[goal]}`);
    if (cravings.size) out.push(`🍔 *${m.cravings}:* ${[...cravings].map((c) => t.cravings[c]).join(', ')}`);
    if (name.trim() || email.trim() || country.trim()) out.push('');
    if (name.trim()) out.push(`👤 *${m.name}:* ${name.trim()}`);
    if (email.trim()) out.push(`📧 *${m.email}:* ${email.trim()}`);
    if (country.trim() && step >= 2) out.push(`🌏 *${m.country}:* ${country.trim()}`);
    if (note.trim()) out.push(`📝 *${m.note}:* ${note.trim()}`);
    if (step >= 1 || pack) {
      out.push('', `💰 *${m.total}: ${money(knownTotal)}${hasTbc ? ` + ${m.tbc}` : ''}*`);
    }
    out.push('', m.thanks);
    return out.join('\n');
  }, [t, step, pack, lines, goal, cravings, name, email, country, note, knownTotal, hasTbc]);

  const go = (next: number) => {
    if (next > step && step === 2) {
      setTried(true);
      if (!name.trim() || (email.trim() && !EMAIL_RE.test(email.trim()))) return;
    }
    if (next === 1 && !pack) setPack(rec);
    setStep(next);
    track('order_step', { step: next + 1, locale });
    requestAnimationFrame(() => {
      // Keep the step bar in view on phones, where the step content is long.
      const top = stepsRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 64) stepsRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      headingRef.current?.focus({ preventScroll: true });
    });
  };

  const toggle = <T,>(set: Set<T>, v: T, fn: (s: Set<T>) => void) => {
    const n = new Set(set);
    if (n.has(v)) n.delete(v);
    else n.add(v);
    fn(n);
  };

  const canNext = step === 0 ? goal !== null : true;

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
      <div>
        {/* Step indicator */}
        <ol ref={stepsRef} className="grid scroll-mt-24 grid-cols-4 gap-3" aria-label="Steps">
          {t.steps.map((label, i) => (
            <li key={label} aria-current={i === step ? 'step' : undefined}>
              <span className={`block h-[2px] transition-colors duration-500 ${i <= step ? 'bg-[var(--s-ink)]' : 'bg-[var(--s-line)]'}`} />
              <span className={`mt-3 block text-[10px] font-semibold uppercase tracking-[0.24em] sm:text-[11px] ${i <= step ? 'text-[var(--s-ink)]' : 'text-[var(--s-muted)]/60'}`}>
                {String(i + 1).padStart(2, '0')} <span className="hidden sm:inline">· {label}</span>
              </span>
            </li>
          ))}
        </ol>

        <div key={step} className="s-fade mt-12 min-h-[420px]">
          {step === 0 && (
            <fieldset>
              <legend>
                <h3 ref={headingRef} tabIndex={-1} className="t-kicker text-[var(--s-ink)] outline-none">{t.goalTitle}</h3>
              </legend>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {GOALS.map((g) => (
                  <button key={g} type="button" className="opt" aria-pressed={goal === g} onClick={() => setGoal(g)}>
                    <span className="display text-[24px] leading-tight">{t.goals[g]}</span>
                  </button>
                ))}
              </div>
              <h3 className="t-kicker mt-12 text-[var(--s-ink)]">{t.cravingsTitle}</h3>
              <p className="mt-1 text-[14px] text-[var(--s-muted)]">{t.cravingsHint}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {CRAVINGS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={cravings.has(c)}
                    onClick={() => toggle(cravings, c, setCravings)}
                    className={`h-11 border px-5 text-[15px] transition-colors ${
                      cravings.has(c) ? 'border-[var(--s-ink)] bg-[var(--s-ink)] text-[var(--s-paper)]' : 'border-[var(--s-line)] hover:border-[var(--s-line-strong)]'
                    }`}
                  >
                    {t.cravings[c]}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {step === 1 && (
            <div>
              <h3 ref={headingRef} tabIndex={-1} className="t-kicker text-[var(--s-ink)] outline-none">{t.packTitle}</h3>
              <div role="radiogroup" aria-label={t.packTitle} className="mt-5 grid gap-3 sm:grid-cols-2">
                {products.map((p) => {
                  const selected = chosen === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className="opt relative"
                      onClick={() => {
                        setPack(p.id);
                        setExtras((x) => {
                          const n = new Set(x);
                          n.delete(p.id);
                          return n;
                        });
                      }}
                    >
                      {p.id === rec && (
                        <span className="absolute -top-2.5 left-4 bg-[var(--s-ember)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                          {t.recommended}
                        </span>
                      )}
                      <span className="display block text-[22px] leading-tight">{t.products[p.id].name}</span>
                      <span className="mt-1 block text-[14px] text-[var(--s-muted)]">{t.products[p.id].blurb}</span>
                      <span className="mt-4 flex items-baseline justify-between text-[14px]">
                        <span className="text-[var(--s-green)]">{p.recipes} {t.recipes}</span>
                        <span className="font-semibold">{p.price === null ? t.priceTbc : money(p.price)}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <h3 className="t-kicker mt-12 text-[var(--s-ink)]">{t.extrasTitle}</h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {products
                  .filter((p) => p.id !== chosen)
                  .map((p) => {
                    const on = extras.has(p.id);
                    return (
                      <li key={p.id} className="flex items-center justify-between gap-4 border border-[var(--s-line)] px-5 py-4">
                        <span className="text-[16px]">
                          {t.products[p.id].name}{' '}
                          <span className="text-[14px] text-[var(--s-muted)]">· {p.price === null ? t.priceTbc : money(p.price)}</span>
                        </span>
                        <button
                          type="button"
                          aria-pressed={on}
                          aria-label={`${on ? t.added : t.add}: ${t.products[p.id].name}`}
                          onClick={() => toggle(extras, p.id, setExtras)}
                          className={`flex h-9 min-w-9 items-center justify-center border px-3 text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                            on ? 'border-[var(--s-ink)] bg-[var(--s-ink)] text-[var(--s-paper)]' : 'border-[var(--s-line-strong)] hover:border-[var(--s-ink)]'
                          }`}
                        >
                          {on ? '✓' : '+'}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-5">
              <h3 ref={headingRef} tabIndex={-1} className="t-kicker text-[var(--s-ink)] outline-none">{t.detailsTitle}</h3>
              <label className="grid gap-2">
                <span className="text-[14px] text-[var(--s-muted)]">{t.name} *</span>
                <input
                  className="field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                  maxLength={80}
                  aria-invalid={!!nameError}
                  aria-describedby={nameError ? 'name-err' : undefined}
                />
                {nameError && <span id="name-err" className="text-[14px] text-[var(--s-ember-text)]">{nameError}</span>}
              </label>
              <label className="grid gap-2">
                <span className="text-[14px] text-[var(--s-muted)]">{t.email}</span>
                <input
                  className="field"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  maxLength={120}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'email-err' : 'email-hint'}
                />
                {emailError ? (
                  <span id="email-err" className="text-[14px] text-[var(--s-ember-text)]">{emailError}</span>
                ) : (
                  <span id="email-hint" className="text-[13px] text-[var(--s-muted)]">{t.emailHint}</span>
                )}
              </label>
              <label className="grid gap-2">
                <span className="text-[14px] text-[var(--s-muted)]">{t.country}</span>
                <input className="field" value={country} onChange={(e) => setCountry(e.target.value)} autoComplete="country-name" maxLength={60} />
              </label>
              <label className="grid gap-2">
                <span className="text-[14px] text-[var(--s-muted)]">{t.note}</span>
                <textarea className="field" rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={400} />
              </label>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 ref={headingRef} tabIndex={-1} className="t-kicker text-[var(--s-ink)] outline-none">{t.reviewTitle}</h3>
              <p className="mt-2 text-[var(--s-muted)]">{t.reviewSub}</p>
              <ul className="mt-8 divide-y divide-[var(--s-line)] border-y border-[var(--s-line)]">
                {lines.map((p) => (
                  <li key={p.id} className="flex items-baseline justify-between gap-6 py-4">
                    <span className="display text-[22px] leading-tight">{t.products[p.id].name}</span>
                    <span className="shrink-0">{p.price === null ? t.priceTbc : money(p.price)}</span>
                  </li>
                ))}
                <li className="flex items-baseline justify-between gap-6 py-5">
                  <span className="t-kicker text-[var(--s-muted)]">{t.total}</span>
                  <span className="display text-[34px]">{money(knownTotal)}</span>
                </li>
              </ul>
              {hasTbc && <p className="mt-2 text-[13px] text-[var(--s-muted)]">{t.plusTbc}</p>}
              <div className="mt-8 lg:hidden">
                <Phone t={t} message={message} />
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="mt-10 flex items-center justify-between gap-4 border-t border-[var(--s-line)] pt-8">
          <button
            type="button"
            onClick={() => go(step - 1)}
            className={`s-link text-[var(--s-muted)] hover:text-[var(--s-ink)] ${step === 0 ? 'invisible' : ''}`}
          >
            ← {t.back}
          </button>
          {step < 3 ? (
            <button type="button" disabled={!canNext} onClick={() => go(step + 1)} className="s-btn s-btn-ember disabled:cursor-not-allowed disabled:opacity-40">
              {t.next} <span className="s-arrow" aria-hidden="true">→</span>
            </button>
          ) : (
            <a
              href={whatsappUrl(message)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('order_send', { pack: chosen, total: knownTotal, locale })}
              className="s-btn wa-pulse bg-[#25d366] text-[#062b17] hover:bg-[#2fe476]"
            >
              {t.send} <span className="s-arrow" aria-hidden="true">→</span>
            </a>
          )}
        </div>
        <p className="mt-4 text-[13px] text-[var(--s-muted)]">{step === 3 ? t.openNote : t.pricesNote}</p>
      </div>

      {/* Live preview (desktop) */}
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <Phone t={t} message={message} />
          <p className="mt-5 text-center text-[13px] text-[var(--s-muted)]">{t.openNote}</p>
        </div>
      </div>
    </div>
  );
}

/** WhatsApp-style phone mock showing the exact message that will be sent. */
function Phone({ t, message }: { t: (typeof dict)['en']['order']; message: string }) {
  return (
    <div className="mx-auto w-full max-w-[380px] rounded-[48px] border border-white/10 bg-[#0b0b0c] p-3 shadow-[0_40px_120px_-40px_rgb(232_88_46/0.35)]">
      <div className="overflow-hidden rounded-[38px] bg-[#0b141a]">
        <div className="flex justify-center pt-3">
          <span className="h-7 w-28 rounded-full bg-black" aria-hidden="true" />
        </div>
        <div className="flex items-center gap-3 bg-[#1f2c33] px-4 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--s-ember)] text-[13px] font-bold text-white">AF</span>
          <div className="leading-tight">
            <div className="text-[16px] font-semibold text-[#e9edef]">{t.phoneName}</div>
            <div className="text-[12px] text-[#8696a0]">{t.phoneStatus}</div>
          </div>
        </div>
        <div className="flex h-[440px] flex-col gap-3 overflow-y-auto px-3 py-4" aria-live="polite" aria-label="WhatsApp preview">
          <div className="max-w-[85%] rounded-lg rounded-tl-none bg-[#202c33] px-3 py-2 text-[14px] leading-snug text-[#e9edef]">
            {t.phoneGreeting}
            <div className="mt-1 text-right text-[11px] text-[#8696a0]">09:41</div>
          </div>
          <div key={message.length} className="wa-bubble-in ml-auto max-w-[88%] whitespace-pre-wrap rounded-lg rounded-tr-none bg-[#005c4b] px-3 py-2 text-[14px] leading-snug text-[#e9edef]">
            {renderWhatsApp(message)}
            <div className="mt-1 text-right text-[11px] text-[#9fd4c8]">09:42 ✓✓</div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#0b141a] px-3 pb-5 pt-2">
          <div className="h-11 flex-1 rounded-full bg-[#2a3942] px-4 text-[14px] leading-[44px] text-[#aebac1]">{t.phoneInput}</div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25d366] text-[#062b17]" aria-hidden="true">➤</span>
        </div>
      </div>
    </div>
  );
}

/** WhatsApp formatting: *bold*. */
function renderWhatsApp(text: string) {
  return text.split(/(\*[^*\n]+\*)/g).map((part, i) =>
    part.startsWith('*') && part.endsWith('*') ? <strong key={i}>{part.slice(1, -1)}</strong> : <span key={i}>{part}</span>
  );
}
