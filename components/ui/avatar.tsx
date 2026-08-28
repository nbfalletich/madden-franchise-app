import Image from "next/image";
import { cn, initials, readableTextColor } from "@/lib/utils";

/**
 * Lightweight avatar: shows an image when `src` is provided, otherwise a
 * colored circle with the person's / account's initials.
 */
export function Avatar({
  name,
  color,
  src,
  size = 44,
  className,
}: {
  name: string;
  color: string;
  src?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full font-display font-bold",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        color: readableTextColor(color),
        fontSize: size * 0.4,
      }}
      aria-hidden={src ? undefined : true}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}
