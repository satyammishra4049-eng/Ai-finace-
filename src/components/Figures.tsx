import { money, pct } from "@/lib/money";
import type { Cents } from "@/lib/types";

export function Dollars({ cents, signed = false }: { cents: Cents; signed?: boolean }) {
  const cls = cents < 0 ? "neg" : cents > 0 && signed ? "pos" : "";
  const text = signed && cents > 0 ? `+${money(cents)}` : money(cents);
  return <span className={cls}>{text}</span>;
}

export function Rate({ n }: { n: number }) {
  return <>{pct(n)}</>;
}
