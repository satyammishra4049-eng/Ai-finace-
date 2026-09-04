import type { Cents } from "./types";

export function money(cents: Cents): string {
  const sign = cents < 0 ? "−" : "";
  const abs = Math.abs(cents);
  const rupees = Math.floor(abs / 100);
  const rem = abs % 100;
  return `${sign}₹${rupees.toLocaleString("en-IN")}.${String(rem).padStart(2, "0")}`;
}

export function signedMoney(cents: Cents): string {
  if (cents > 0) return `+${money(cents)}`;
  if (cents < 0) return money(cents);
  return money(0);
}

export function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseIso(s: string): Date {
  return new Date(`${s}T12:00:00`);
}

export function addDays(s: string, days: number): string {
  const d = parseIso(s);
  d.setDate(d.getDate() + days);
  return iso(d);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseIso(b).getTime() - parseIso(a).getTime()) / 86400000);
}

export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(llc|inc|co|corp|ltd|company|the|of)\b/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenOverlap(a: string, b: string): number {
  const aa = new Set(normalizeName(a).split(" ").filter((t) => t.length > 2));
  const bb = new Set(normalizeName(b).split(" ").filter((t) => t.length > 2));
  if (!aa.size || !bb.size) return 0;
  let hit = 0;
  for (const t of aa) if (bb.has(t)) hit += 1;
  return hit / Math.min(aa.size, bb.size);
}

export function extractInvoiceHint(text: string): string | null {
  const m = text.toUpperCase().match(/INV[\s-]?(\d{4})/);
  return m ? `INV-${m[1]}` : null;
}
