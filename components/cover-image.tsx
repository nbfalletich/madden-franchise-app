"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Responsive image with a graceful gradient fallback. Set the aspect ratio and
 * rounding on the wrapper via `className` (e.g. "aspect-[16/9] rounded-xl").
 */
export function CoverImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 640px",
  priority = false,
  gradientFrom = "#1a2344",
  gradientTo = "#0a0f1e",
  overlay = false,
}: {
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  overlay?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div className={cn("relative overflow-hidden bg-navy-800", className)}>
      {showImage ? (
        <Image
          src={src as string}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onError={() => setFailed(true)}
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
