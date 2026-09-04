import { loadBooks } from "./books";
import { money } from "./money";
import { runClose, upcomingCash } from "./reconcile";
import type { Books, ReconcileResult } from "./types";

export function answerQuestion(q: string, books: Books = loadBooks(), result: ReconcileResult = runClose(books)): string {
  const query = q.trim();
  if (!query) return "Ask about cash, a customer, a match, or an exception.";

  const lower = query.toLowerCase();
  const forecast = upcomingCash(books, result);

  if (/match rate|accuracy|how did (we|it) do/.test(lower)) {
    return [
      `Bank match rate is ${pct(result.metrics.matchRate)} (${result.metrics.matchedCount} of ${result.bankLines} lines).`,
      `Against the labeled close file the agent is ${pct(result.metrics.truthAccuracy)} accurate (${result.metrics.truthCorrect}/${result.metrics.truthChecked}).`,
      `${result.exceptions.filter((e) => e.kind === "unmatched_inflow" || e.kind === "unmatched_outflow").length} bank lines still need a human.`,
      `That gap is the point of the close: the engine publishes what it could not resolve instead of forcing a match.`
    ].join(" ");
  }

  if (/cash|position|liquidity|runway/.test(lower) && !/forecast|next|friday|week/.test(lower)) {
    return `Operating cash is ${money(result.metrics.operatingCash)} at ${books.company.bankName} ${books.company.accountMask}. Payroll account is ${money(result.metrics.payrollCash)}. Open AR ${money(result.metrics.openAr)}, open AP ${money(result.metrics.openAp)}.`;
  }

  if (/forecast|next week|friday|fourteen|14/.test(lower)) {
    const last = forecast[forecast.length - 1];
    const trough = forecast.reduce((a, b) => (b.closing < a.closing ? b : a));
    return `If open AR pays on due date and open AP is funded on due date, operating cash is ${money(last.closing)} on ${last.date}. The low point in the next 14 days is ${money(trough.closing)} on ${trough.date}. This is a due-date forecast, not a collections forecast.`;
  }

  if (/exception|unmatch|couldn.?t|unresolved/.test(lower)) {
    const hard = result.exceptions.filter((e) => e.kind === "unmatched_inflow" || e.kind === "unmatched_outflow" || e.kind === "short_pay");
    const lines = hard.slice(0, 6).map((e) => `${e.title}: ${e.detail}`);
    return lines.length ? `Items the agent would not force-clear:\n${lines.join("\n")}` : "No hard unmatched bank items. Remaining exceptions are open AR/AP still in terms.";
  }

  const party = books.parties.find((p) => lower.includes(p.name.toLowerCase().split(" ")[0]!) || p.aliases.some((a) => lower.includes(a)));
  if (party && party.kind === "customer") {
    const invs = books.invoices.filter((i) => i.customerId === party.id);
    const open = invs.filter((i) => !result.matches.some((m) => m.invoiceIds.includes(i.id)));
    const paid = invs.filter((i) => result.matches.some((m) => m.invoiceIds.includes(i.id)));
    return `${party.name}: ${paid.length} invoice(s) cleared this period, ${open.length} still open totaling ${money(open.reduce((s, i) => s + i.amount, 0))}. Open: ${open.map((i) => `${i.number} ${money(i.amount)} due ${i.due}`).join("; ") || "none"}.`;
  }

  if (party && (party.kind === "vendor" || party.kind === "tax" || party.kind === "payroll")) {
    const bills = books.bills.filter((b) => b.vendorId === party.id || tokenish(b.vendorName, party.name));
    const open = bills.filter((b) => !result.matches.some((m) => m.billIds.includes(b.id)));
    return `${party.name}: ${bills.length - open.length} bill(s) paid from the bank file, ${open.length} unpaid totaling ${money(open.reduce((s, b) => s + b.amount, 0))}.`;
  }

  const inv = books.invoices.find((i) => lower.includes(i.number.toLowerCase()) || lower.includes(i.id.toLowerCase()));
  if (inv) {
    const m = result.matches.find((x) => x.invoiceIds.includes(inv.id));
    if (m) {
      const bank = books.bank.find((b) => b.id === m.bankId);
      return `${inv.number} ${money(inv.amount)} to ${inv.customerName} is matched to ${bank?.ref} on ${bank?.date} (${m.method}, confidence ${m.confidence}). ${m.note}`;
    }
    return `${inv.number} ${money(inv.amount)} to ${inv.customerName} is still open. Issued ${inv.issued}, due ${inv.due}.`;
  }

  if (/stripe|payout|settlement/.test(lower)) {
    const rows = books.payouts.map((p) => {
      const m = result.matches.find((x) => x.payoutId === p.id);
      const bank = m ? books.bank.find((b) => b.id === m.bankId) : null;
      return `${p.id} ${p.date} net ${money(p.net)} ${bank ? `landed ${bank.date} ${bank.ref}` : "not in bank yet"}`;
    });
    return `Stripe settlements this file:\n${rows.join("\n")}`;
  }

  if (/tax/.test(lower)) {
    const rows = books.tax.map((t) => {
      const m = result.matches.find((x) => x.taxId === t.id);
      return `${t.agency} ${t.period} ${money(t.amount)} due ${t.due} — ${m ? "cleared on the bank file" : "not yet paid"}`;
    });
    return rows.join("\n");
  }

  return `I can answer from this close file: cash position, 14-day due-date forecast, match rate, Stripe payouts, tax remittances, a customer or vendor, or an invoice number. Try “Did Harbor Press pay?” or “What is still unmatched?”`;
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function tokenish(a: string, b: string): boolean {
  return a.toLowerCase().includes(b.toLowerCase().split(" ")[0] || "___");
}

export async function maybeNarrate(exceptions: ReconcileResult["exceptions"]): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const hard = exceptions.filter((e) => e.kind === "unmatched_inflow" || e.kind === "unmatched_outflow" || e.kind === "short_pay").slice(0, 8);
  if (!hard.length) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are the finance controller for Northline Paper Co. Write a short close memo (120 words max) covering only the unresolved exceptions. No fluff. Name the action for each."
          },
          { role: "user", content: JSON.stringify(hard) }
        ]
      })
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return json.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}
