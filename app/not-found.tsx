import Link from "next/link";
import { Shield } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-xl bg-amber-400 text-navy-950">
        <Shield className="h-7 w-7" />
      </span>
      <p className="font-display text-5xl font-extrabold tracking-tight text-slate-50">
        4th &amp; Long
      </p>
      <p className="mt-2 max-w-sm text-slate-400">
        That page isn&apos;t on the depth chart. It may have been traded,
        released, or never existed.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-white"
      >
        Back to the Hub
      </Link>
    </div>
  );
}
