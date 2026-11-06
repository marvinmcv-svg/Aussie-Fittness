'use client';

import { useEffect, useState } from 'react';
import { dict, type Locale } from '@/content/i18n';
import { whatsappUrl } from '@/content/site';

/**
 * Persistent WhatsApp entry point (bottom-right) on every marketing page.
 * Steps aside while the order builder is on screen, so it never covers the
 * total or the Send button.
 */
export function WhatsAppFloat({ locale }: { locale: Locale }) {
  const t = dict[locale].order;
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById('order');
    if (!target) return;
    const io = new IntersectionObserver(([e]) => setHidden(e.isIntersecting), { rootMargin: '0px 0px -10% 0px' });
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <a
      href={whatsappUrl(t.floatingText)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.floating}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className={`wa-pulse fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-[#062b17] shadow-[0_12px_30px_rgb(0_0_0/0.4)] transition-[transform,opacity] duration-300 hover:scale-105 ${
        hidden ? 'pointer-events-none translate-y-4 opacity-0' : ''
      }`}
    >
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" fill="currentColor">
        <path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.5.7 4.9 2 7L3 29l6.6-2.2c2 1.1 4.2 1.7 6.4 1.7 7 0 12.7-5.6 12.7-12.6S23 3 16 3Zm0 23.1c-2 0-4-.5-5.7-1.6l-.4-.2-3.9 1.3 1.3-3.8-.3-.4a10.4 10.4 0 0 1-1.6-5.7C5.4 9.8 10.2 5 16 5s10.6 4.8 10.6 10.6S21.8 26.1 16 26.1Zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.7c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.7 3.7 0 0 0-1.1 2.7 6.4 6.4 0 0 0 1.4 3.4 14.6 14.6 0 0 0 5.6 4.9c2.1.9 2.9 1 3.9.8a3.3 3.3 0 0 0 2.2-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.2-.3-.3-.7-.5Z" />
      </svg>
    </a>
  );
}
