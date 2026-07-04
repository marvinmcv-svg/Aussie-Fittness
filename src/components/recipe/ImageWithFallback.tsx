'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
  fallbackClassName?: string;
  /** Whether to fill the parent container (for aspect-ratio boxes) */
  fill?: boolean;
  /** Width in pixels (required if not fill) */
  width?: number;
  /** Height in pixels (required if not fill) */
  height?: number;
  /** Sizes attribute for responsive loading */
  sizes?: string;
}

/**
 * Renders a next/image that falls back to `fallback` (e.g. an emoji) if the
 * image fails to load. Uses next/image for automatic WebP/AVIF conversion,
 * responsive sizing, and lazy loading.
 *
 * For card grids (aspect-ratio containers), use `fill` + `sizes`.
 * For fixed-size images, use `width` + `height`.
 */
export function ImageWithFallback({
  src,
  alt,
  className,
  fallback,
  fallbackClassName,
  fill = true,
  width,
  height,
  sizes,
}: ImageWithFallbackProps) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return <div className={fallbackClassName ?? className}>{fallback}</div>;
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'}
        className={className}
        loading="lazy"
        onError={() => setErrored(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 400}
      height={height ?? 300}
      className={className}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}
