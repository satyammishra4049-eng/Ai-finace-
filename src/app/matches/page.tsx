import { Shell } from "@/components/Shell";
import { Dollars, Rate } from "@/components/Figures";
import { loadBooks } from "@/lib/books";
import { runClose } from "@/lib/reconcile";

export default function MatchesPage() {
  const books = loadBooks();
  const result = runClose(books);
  const bank = new Map(books.bank.map((b) => [b.id, b]));

  return (
    <Shell>
      <div className="kicker">
        Match rate <Rate n={result.metrics.matchRate} /> · labeled accuracy{" "}
        <Rate n={result.metrics.truthAccuracy} />
      </div>
      <h1>How each line cleared</h1>
      <p className="lede">
        {result.matches.length} matches. Confidence is the matcher&apos;s own score. Labeled accuracy is whether that
        link agrees with the close file.
      </p>
      <table>
        <thead>
          <tr>
            <th>Bank</th>
            <th>Date</th>
            <th>Method</th>
            <th>Documents</th>
            <th className="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {result.matches.map((m) => {
            const line = bank.get(m.bankId);
            const docs = [...m.invoiceIds, ...m.billIds, m.payoutId, m.taxId].filter(Boolean).join(", ");
            return (
              <tr key={m.id}>
                <td>{line?.ref}</td>
                <td>{line?.date}</td>
                <td>
                  {m.method}
                  <div className="note">{m.note}</div>
                </td>
                <td>{docs || "—"}</td>
                <td className="num">
                  <Dollars cents={m.amount} signed />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Shell>
  );
}
