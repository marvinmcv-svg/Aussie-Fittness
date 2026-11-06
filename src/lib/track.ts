/** Analytics hook. No-op until an analytics script (Plausible / GTM) is added. */
type W = Window & {
  plausible?: (event: string, opts?: { props?: Record<string, string | number> }) => void;
  dataLayer?: Record<string, unknown>[];
};

export function track(event: string, props: Record<string, string | number> = {}) {
  if (typeof window === 'undefined') return;
  const w = window as W;
  w.plausible?.(event, { props });
  w.dataLayer?.push({ event, ...props });
}
