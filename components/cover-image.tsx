"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Responsive image with a fallback cascade: `src` → `fallbackSrc` → gradient.
 * Set the aspect ratio and rounding on the wrapper via `className`.
 */
export function CoverImage({
  src,
  fallbackSrc,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 640px",
  priority = false,
  gradientFrom = "#1a2344",
  gradientTo = "#0a0f1e",
  overlay = false,
}: {
  src?: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  overlay?: boolean;
}) {
  const candidates = useMemo(
    () => [src, fallbackSrc].filter((s): s is string => Boolean(s)),
    [src, fallbackSrc],
  );
  const [idx, setIdx] = useState(0);
  const current = candidates[idx];

  return (
    <div className={cn("relative overflow-hidden bg-navy-800", className)}>
      {current ? (
        <Image
          key={current}
          src={current}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onError={() => setIdx((i) => i + 1)}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(120% 120% at 0% 0%, ${gradientFrom} 0%, ${gradientTo} 70%)`,
          }}
        />
      )}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
      )}
    </div>
  );
}
