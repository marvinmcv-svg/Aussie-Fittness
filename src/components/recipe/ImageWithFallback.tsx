'use client';

import { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
  fallbackClassName?: string;
}

/**
 * Renders an <img> that falls back to `fallback` (e.g. an emoji) if the
 * image fails to load. The component is keyed by `src` so that navigating
 * to a different recipe creates a fresh instance with a clean error state
 * (no setState-in-effect needed).
 *
 * Usage tip: if you render this inside a list where `src` changes, also pass
 * `key={src}` on the parent or on this component to force a remount.
 */
export function ImageWithFallback({
  src,
  alt,
  className,
  fallback,
  fallbackClassName,
}: ImageWithFallbackProps) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return <div className={fallbackClassName ?? className}>{fallback}</div>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}
