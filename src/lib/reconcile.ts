import { loadBooks } from "./books";
import { addDays, daysBetween, extractInvoiceHint, tokenOverlap } from "./money";
import type { BankLine, Bill, Books, Exception, Invoice, Match, ReconcileResult, TruthLink } from "./types";

const DATE_WINDOW = 28;
const SHORT_PAY_MAX = 400;

export function runClose(books: Books = loadBooks()): ReconcileResult {
  const usedInvoices = new Set<string>();
  const usedBills = new Set<string>();
  const usedPayouts = new Set<string>();
  const usedTax = new Set<string>();
  const matches: Match[] = [];
  const exceptions: Exception[] = [];
  const matchedBankIds: string[] = [];
  let mid = 1;

  const pushMatch = (m: Omit<Match, "id">) => {
    matches.push({ id: `M-${String(mid++).padStart(3, "0")}`, ...m });
    matchedBankIds.push(m.bankId);
    m.invoiceIds.forEach((id) => usedInvoices.add(id));
    m.billIds.forEach((id) => usedBills.add(id));
    if (m.payoutId) usedPayouts.add(m.payoutId);
    if (m.taxId) usedTax.add(m.taxId);
  };

  const sorted = [...books.bank].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

  for (const line of sorted) {
    if (line.amount < 0) {
      const outflow = matchOutflow(books, line, usedBills, usedPayouts, usedTax);
      if (outflow) {
        pushMatch(outflow);
        if (outflow.method === "fee") {
          exceptions.push({
            id: `EX-${line.id}`,
            kind: "fee_adjusted",
            title: `Bank fee posted ${line.ref}`,
            detail: `${line.description} is a bank charge with no vendor bill. It is expected and does not hit AP.`,
            amount: line.amount,
            bankId: line.id,
            invoiceIds: [],
            billIds: [],
            suggestedAction: "Post to bank-fee expense. No AP match required."
          });
        }
        continue;
      }
      exceptions.push({
        id: `EX-${line.id}`,
        kind: line.amount > -10000 ? "unmatched_outflow" : "unmatched_outflow",
        title: `Unmatched outflow ${line.ref}`,
        detail: `${line.counterparty} ${moneyAbs(line.amount)} on ${line.date}. No open bill, tax remittance, or payout matched.`,
        amount: line.amount,
        bankId: line.id,
        invoiceIds: [],
        billIds: [],
        suggestedAction: "Ask AP for the source document or reclass to suspense."
      });
      continue;
    }

    const inflow = matchInflow(books, line, usedInvoices, usedPayouts);
    if (inflow) {
      pushMatch(inflow.match);
      exceptions.push(...inflow.notes);
      continue;
    }

    exceptions.push({
      id: `EX-${line.id}`,
      kind: "unmatched_inflow",
      title: `Unmatched deposit ${line.ref}`,
      detail: `${line.counterparty} deposited ${moneyAbs(line.amount)} on ${line.date}. No open invoice or payout of that amount in a ${DATE_WINDOW}-day window.`,
      amount: line.amount,
      bankId: line.id,
      invoiceIds: [],
      billIds: [],
      suggestedAction: "Request remittance advice from the lockbox or customer."
    });
  }

  for (const inv of books.invoices) {
    if (usedInvoices.has(inv.id)) continue;
    const overdue = inv.due < books.company.asOf;
    exceptions.push({
      id: `EX-${inv.id}`,
      kind: overdue ? "open_receivable" : "timing",
      title: `${inv.number} still open — ${inv.customerName}`,
      detail: `${moneyAbs(inv.amount)} issued ${inv.issued}, due ${inv.due}. No matching bank credit through ${books.company.asOf}.`,
      amount: inv.amount,
      invoiceIds: [inv.id],
      billIds: [],
      suggestedAction: overdue ? "Collections: send reminder with invoice PDF." : "Watch the cash forecast; due date has not passed."
    });
  }

  for (const bill of books.bills) {
    if (usedBills.has(bill.id)) continue;
    const overdue = bill.due < books.company.asOf;
    exceptions.push({
      id: `EX-${bill.id}`,
      kind: "open_payable",
      title: `${bill.number} unpaid — ${bill.vendorName}`,
      detail: `${moneyAbs(bill.amount)} due ${bill.due} (${bill.category}).`,
      amount: -bill.amount,
      invoiceIds: [],
      billIds: [bill.id],
      suggestedAction: overdue ? "Schedule payment from operating cash this week." : "Include in the 14-day cash forecast."
    });
  }

  for (const t of books.tax) {
    if (usedTax.has(t.id)) continue;
    exceptions.push({
      id: `EX-${t.id}`,
      kind: "tax_variance",
      title: `${t.agency} ${t.period} not on bank file`,
      detail: `${moneyAbs(t.amount)} due ${t.due}. No matching debit yet.`,
      amount: -t.amount,
      invoiceIds: [],
      billIds: [],
      suggestedAction: "Confirm funding date with payroll/tax before the due date."
    });
  }

  const unmatchedBankIds = books.bank.filter((b) => !matchedBankIds.includes(b.id)).map((b) => b.id);
  const operatingCash = books.opening.operating + books.bank.filter((b) => b.account === "operating").reduce((s, b) => s + b.amount, 0);
  const payrollCash = books.opening.payroll + books.bank.filter((b) => b.account === "payroll").reduce((s, b) => s + b.amount, 0);
  const openAr = books.invoices.filter((i) => !usedInvoices.has(i.id)).reduce((s, i) => s + i.amount, 0);
  const openAp = books.bills.filter((i) => !usedBills.has(i.id)).reduce((s, i) => s + i.amount, 0);

  const score = scoreAgainstTruth(books.truth, matches, books.bank);

  return {
    runAt: new Date().toISOString(),
    asOf: books.company.asOf,
    bankLines: books.bank.length,
    candidateDocs: books.invoices.length + books.bills.length + books.payouts.length + books.tax.length,
    matches,
    exceptions,
    matchedBankIds,
    unmatchedBankIds,
    metrics: {
      matchRate: books.bank.length ? matchedBankIds.length / books.bank.length : 0,
      matchedCount: matchedBankIds.length,
      unmatchedCount: unmatchedBankIds.length,
      truthAccuracy: score.accuracy,
      truthChecked: score.checked,
      truthCorrect: score.correct,
      openAr,
      openAp,
      operatingCash,
      payrollCash
    }
  };
}

function matchInflow(
  books: Books,
  line: BankLine,
  usedInvoices: Set<string>,
  usedPayouts: Set<string>
): { match: Omit<Match, "id">; notes: Exception[] } | null {
  const notes: Exception[] = [];
  const text = `${line.description} ${line.counterparty}`;

  const payout = books.payouts.find((p) => !usedPayouts.has(p.id) && p.net === line.amount && Math.abs(daysBetween(p.date, line.date)) <= 3);
  if (payout && /stripe/i.test(text)) {
    return {
      match: {
        bankId: line.id,
        invoiceIds: [],
        billIds: [],
        payoutId: payout.id,
        confidence: 0.99,
        method: "payout_net",
        amount: line.amount,
        note: `Stripe payout ${payout.id}: gross ${moneyAbs(payout.gross)} less fees ${moneyAbs(payout.fees)}.`
      },
      notes
    };
  }

  const hint = extractInvoiceHint(text);
  if (hint) {
    const inv = books.invoices.find((i) => i.id === hint && !usedInvoices.has(i.id));
    if (inv && (inv.amount === line.amount || Math.abs(inv.amount - line.amount) <= SHORT_PAY_MAX) && daysBetween(inv.issued, line.date) >= 0) {
      if (inv.amount !== line.amount) {
        notes.push(shortPayNote(line, inv));
      }
      return {
        match: {
          bankId: line.id,
          invoiceIds: [inv.id],
          billIds: [],
          confidence: inv.amount === line.amount ? 0.98 : 0.86,
          method: inv.amount === line.amount ? "invoice_ref" : "invoice_ref_short",
          amount: line.amount,
          note: `Memo cited ${inv.id}.`
        },
        notes
      };
    }
  }

  const open = books.invoices.filter((i) => !usedInvoices.has(i.id) && daysBetween(i.issued, line.date) >= 0 && daysBetween(i.issued, line.date) <= DATE_WINDOW);

  const named = open.filter((i) => tokenOverlap(`${i.customerName} ${i.customerId}`, text) >= 0.5);

  const exactNamed = named.filter((i) => i.amount === line.amount);
  if (exactNamed.length === 1) {
    return {
      match: {
        bankId: line.id,
        invoiceIds: [exactNamed[0].id],
        billIds: [],
        confidence: 0.95,
        method: "amount_name_date",
        amount: line.amount,
        note: `Exact amount and name window against ${exactNamed[0].id}.`
      },
      notes
    };
  }

  const exactAny = open.filter((i) => i.amount === line.amount && tokenOverlap(i.customerName, text) >= 0.34);
  if (exactAny.length === 1) {
    return {
      match: {
        bankId: line.id,
        invoiceIds: [exactAny[0].id],
        billIds: [],
        confidence: 0.9,
        method: "amount_name_date",
        amount: line.amount,
        note: `Exact amount against ${exactAny[0].id}.`
      },
      notes
    };
  }

  const pair = findPair(named.length ? named : open.filter((i) => tokenOverlap(i.customerName, text) >= 0.5), line.amount);
  if (pair) {
    return {
      match: {
        bankId: line.id,
        invoiceIds: pair.map((i) => i.id),
        billIds: [],
        confidence: 0.92,
        method: "split_two_invoices",
        amount: line.amount,
        note: `One deposit cleared ${pair[0].id} and ${pair[1].id}.`
      },
      notes
    };
  }

  const short = named.filter((i) => i.amount > line.amount && i.amount - line.amount <= SHORT_PAY_MAX);
  if (short.length === 1) {
    notes.push(shortPayNote(line, short[0]));
    return {
      match: {
        bankId: line.id,
        invoiceIds: [short[0].id],
        billIds: [],
        confidence: 0.8,
        method: "short_pay",
        amount: line.amount,
        note: `Short pay of ${moneyAbs(short[0].amount - line.amount)} on ${short[0].id}.`
      },
      notes
    };
  }

  return null;
}

function matchOutflow(
  books: Books,
  line: BankLine,
  usedBills: Set<string>,
  usedPayouts: Set<string>,
  usedTax: Set<string>
): Omit<Match, "id"> | null {
  const amt = -line.amount;
  const text = `${line.description} ${line.counterparty}`;

  if (/(service charge|wire fee|monthly service)/i.test(text) && amt <= 5000) {
    return {
      bankId: line.id,
      invoiceIds: [],
      billIds: [],
      confidence: 1,
      method: "fee",
      amount: line.amount,
      note: "Bank fee — no AP document."
    };
  }

  const tax = books.tax.find((t) => !usedTax.has(t.id) && t.amount === amt && Math.abs(daysBetween(t.due, line.date)) <= 10);
  if (tax && /(irs|usatax|il dor|department of revenue|treasury)/i.test(text)) {
    const bill = books.bills.find((b) => !usedBills.has(b.id) && b.amount === amt && (b.category === "tax" || tokenOverlap(b.vendorName, text) > 0.4));
    return {
      bankId: line.id,
      invoiceIds: [],
      billIds: bill ? [bill.id] : [],
      taxId: tax.id,
      confidence: 0.97,
      method: "tax_remit",
      amount: line.amount,
      note: `${tax.agency} ${tax.period}.`
    };
  }

  const openBills = books.bills.filter((b) => !usedBills.has(b.id));
  const named = openBills.filter((b) => tokenOverlap(b.vendorName, text) >= 0.5 && b.amount === amt);
  if (named.length >= 1) {
    const bill = pickClosest(named, line.date);
    return {
      bankId: line.id,
      invoiceIds: [],
      billIds: [bill.id],
      confidence: 0.96,
      method: "bill_amount_name",
      amount: line.amount,
      note: `Paid ${bill.id}.`
    };
  }

  const amountOnly = openBills.filter((b) => b.amount === amt && Math.abs(daysBetween(b.due, line.date)) <= 16);
  if (amountOnly.length === 1) {
    return {
      bankId: line.id,
      invoiceIds: [],
      billIds: [amountOnly[0].id],
      confidence: 0.84,
      method: "bill_amount_date",
      amount: line.amount,
      note: `Unique amount near due date for ${amountOnly[0].id}.`
    };
  }

  return null;
}

function findPair(invoices: Invoice[], amount: number): Invoice[] | null {
  for (let i = 0; i < invoices.length; i++) {
    for (let j = i + 1; j < invoices.length; j++) {
      if (invoices[i].customerId === invoices[j].customerId && invoices[i].amount + invoices[j].amount === amount) {
        return [invoices[i], invoices[j]];
      }
    }
  }
  return null;
}

function pickClosest(bills: Bill[], date: string): Bill {
  return [...bills].sort((a, b) => Math.abs(daysBetween(a.due, date)) - Math.abs(daysBetween(b.due, date)))[0];
}

function shortPayNote(line: BankLine, inv: Invoice): Exception {
  return {
    id: `EX-SHORT-${inv.id}`,
    kind: "short_pay",
    title: `Short pay on ${inv.id}`,
    detail: `${inv.customerName} remitted ${moneyAbs(line.amount)} against ${moneyAbs(inv.amount)}. Variance ${moneyAbs(inv.amount - line.amount)}.`,
    amount: inv.amount - line.amount,
    bankId: line.id,
    invoiceIds: [inv.id],
    billIds: [],
    suggestedAction: "Write off if under $5 and terms allow; otherwise invoice the balance."
  };
}

function scoreAgainstTruth(truth: TruthLink[], matches: Match[], bank: BankLine[]): { accuracy: number; checked: number; correct: number } {
  const byBank = new Map(matches.map((m) => [m.bankId, m]));
  let correct = 0;
  let checked = 0;
  for (const t of truth) {
    if (t.kind === "unmatchable") {
      checked += 1;
      if (!byBank.has(t.bankId)) correct += 1;
      continue;
    }
    if (t.kind === "fee") {
      checked += 1;
      const m = byBank.get(t.bankId);
      if (m && m.method === "fee") correct += 1;
      continue;
    }
    const m = byBank.get(t.bankId);
    if (!m) {
      checked += 1;
      continue;
    }
    checked += 1;
    const invoicesOk = sameSet(m.invoiceIds, t.invoiceIds);
    const billsOk = sameSet(m.billIds, t.billIds);
    const payoutOk = (m.payoutId || "") === (t.payoutId || "");
    const taxOk = !t.taxId || m.taxId === t.taxId;
    if (invoicesOk && billsOk && payoutOk && taxOk) correct += 1;
  }
  void bank;
  return { accuracy: checked ? correct / checked : 0, checked, correct };
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}

function moneyAbs(cents: number): string {
  const abs = Math.abs(cents);
  return `$${Math.floor(abs / 100).toLocaleString("en-US")}.${String(abs % 100).padStart(2, "0")}`;
}

export function upcomingCash(books: Books, result: ReconcileResult): { date: string; inflows: number; outflows: number; closing: number; label: string }[] {
  const start = books.company.asOf;
  let closing = result.metrics.operatingCash;
  const days = [];
  for (let i = 0; i <= 14; i++) {
    const date = addDays(start, i);
    let inflows = 0;
    let outflows = 0;
    let label = i === 0 ? "Today" : "";
    for (const inv of books.invoices) {
      if (result.matches.some((m) => m.invoiceIds.includes(inv.id))) continue;
      if (inv.due === date) {
        inflows += inv.amount;
        label = label || "AR due";
      }
    }
    for (const bill of books.bills) {
      if (result.matches.some((m) => m.billIds.includes(bill.id))) continue;
      if (bill.due === date) {
        outflows += bill.amount;
        label = label || "AP due";
      }
    }
    for (const t of books.tax) {
      if (result.matches.some((m) => m.taxId === t.id)) continue;
      if (t.due === date) {
        outflows += t.amount;
        label = label || "Tax";
      }
    }
    closing += inflows - outflows;
    days.push({ date, inflows, outflows, closing, label });
  }
  return days;
}
