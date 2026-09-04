import { Shell } from "@/components/Shell";
import { Dollars, Rate } from "@/components/Figures";
import { loadBooks } from "@/lib/books";
import { runClose } from "@/lib/reconcile";
import Link from "next/link";

export default function Page() {
  const books = loadBooks();
  const result = runClose(books);
  const hard = result.exceptions.filter((e) =>
    ["unmatched_inflow", "unmatched_outflow", "short_pay", "split_unresolved"].includes(e.kind)
  );
  const docs = books.invoices.length + books.bills.length + books.bank.length + books.payouts.length + books.tax.length;

  return (
    <Shell>
      <div className="kicker">{books.company.legal} · {books.company.ein}</div>
      <h1>Run the books and the cash position.</h1>
      <p className="lede">
        One close loop across {docs} records for {books.company.period}. The agent matches the bank file to invoices,
        bills, Stripe payouts and tax remittances, then reports a measured match rate and the items it would not invent
        a home for.
      </p>

      <div className="row four">
        <div className="stat">
          <i>Operating cash</i>
          <b>
            <Dollars cents={result.metrics.operatingCash} />
          </b>
        </div>
        <div className="stat">
          <i>Bank match rate</i>
          <b>
            <Rate n={result.metrics.matchRate} />
          </b>
        </div>
        <div className="stat">
          <i>Labeled accuracy</i>
          <b>
            <Rate n={result.metrics.truthAccuracy} />
          </b>
        </div>
        <div className="stat">
          <i>Hard exceptions</i>
          <b>{hard.length}</b>
        </div>
      </div>

      <div className="bar" aria-hidden>
        <i style={{ width: `${Math.round(result.metrics.matchRate * 100)}%` }} />
      </div>
      <p className="note" style={{ marginTop: 10 }}>
        {result.metrics.matchedCount} of {result.bankLines} bank lines cleared. Accuracy is scored against a held-out
        close file the matcher never sees — {result.metrics.truthCorrect} of {result.metrics.truthChecked} labels
        agree. Open AR {moneyPlain(result.metrics.openAr)} · open AP {moneyPlain(result.metrics.openAp)} · payroll cash{" "}
        {moneyPlain(result.metrics.payrollCash)}.
      </p>

      <div className="row two" style={{ marginTop: 36 }}>
        <div className="panel" style={{ marginTop: 0 }}>
          <h2>What closed</h2>
          <p className="note">
            Inflows matched by invoice number, amount + name + date window, or a two-invoice split from the same
            customer. Outflows matched to AP, ADP, IRS/IL DOR, and Stripe nets.
          </p>
          <table style={{ marginTop: 14 }}>
            <thead>
              <tr>
                <th>Method</th>
                <th className="num">Matches</th>
              </tr>
            </thead>
            <tbody>
              {tally(result.matches.map((m) => m.method)).map(([method, n]) => (
                <tr key={method}>
                  <td>{labelMethod(method)}</td>
                  <td className="num">{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel" style={{ marginTop: 0 }}>
          <h2>Still on the desk</h2>
          {hard.slice(0, 5).map((e) => (
            <div className="ex" key={e.id}>
              <h3>{e.title}</h3>
              <p>{e.detail}</p>
            </div>
          ))}
          <p style={{ marginTop: 14 }}>
            <Link href="/exceptions">All exceptions →</Link>
          </p>
        </div>
      </div>
    </Shell>
  );
}

function tally(methods: string[]): [string, number][] {
  const m = new Map<string, number>();
  for (const x of methods) m.set(x, (m.get(x) || 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function labelMethod(m: string): string {
  const map: Record<string, string> = {
    amount_name_date: "Amount, name, date",
    invoice_ref: "Invoice number in memo",
    invoice_ref_short: "Invoice number, short pay",
    split_two_invoices: "Two invoices, one deposit",
    short_pay: "Short pay within $4",
    payout_net: "Stripe payout net",
    bill_amount_name: "Bill amount and vendor",
    bill_amount_date: "Bill amount near due",
    tax_remit: "Tax remittance",
    fee: "Bank fee (expected)"
  };
  return map[m] || m;
}

function moneyPlain(cents: number): string {
  const sign = cents < 0 ? "−" : "";
  const abs = Math.abs(cents);
  return `${sign}₹${Math.floor(abs / 100).toLocaleString("en-IN")}.${String(abs % 100).padStart(2, "0")}`;
}
