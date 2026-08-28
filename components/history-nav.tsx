"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "champions", label: "Champions" },
  { id: "awards", label: "Awards" },
  { id: "hall-of-fame", label: "Hall of Fame" },
  { id: "records", label: "Record Book" },
  { id: "lore", label: "Lore" },
  { id: "careers", label: "Careers" },
];

/**
 * Sticky in-page section switcher for the History page.
 */
export function HistoryNav() {
  const [active, setActive] = useState<string>("champions");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="sticky top-14 z-30 -mx-4 mb-6 border-b border-white/10 bg-navy-900/90 px-4 py-2 backdrop-blur md:top-16">
      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
              active === s.id
                ? "bg-amber-400 text-navy-950"
                : "text-slate-400 hover:bg-white/10 hover:text-slate-100",
            )}
          >
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}
