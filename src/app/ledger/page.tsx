import { Shell } from "@/components/Shell";
import { Dollars } from "@/components/Figures";
import { loadBooks } from "@/lib/books";
import { runClose } from "@/lib/reconcile";

export default function LedgerPage() {
  const books = loadBooks();
  const result = runClose(books);
  const matched = new Set(result.matchedBankIds);

  return (
    <Shell>
      <div className="kicker">{books.company.bankName} · {books.company.accountMask}</div>
      <h1>Bank file</h1>
      <p className="lede">
        {books.bank.length} posted lines on operating and payroll. Opening operating cash was{" "}
        <Dollars cents={books.opening.operating} /> on 1 August. Each row is marked after the close: cleared, or still
        sitting unmatched.
      </p>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Ref</th>
            <th>Description</th>
            <th>Account</th>
            <th>Status</th>
            <th className="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {[...books.bank]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((l) => (
              <tr key={l.id}>
                <td>{l.date}</td>
                <td>{l.ref}</td>
                <td>
                  {l.description}
                  <div className="note">{l.counterparty}</div>
                </td>
                <td>{l.account}</td>
                <td>
                  <span className={`chip ${matched.has(l.id) ? "good" : "warn"}`}>
                    {matched.has(l.id) ? "Cleared" : "Open"}
                  </span>
                </td>
                <td className="num">
                  <Dollars cents={l.amount} signed />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </Shell>
  );
}
