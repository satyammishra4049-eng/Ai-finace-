import { Shell } from "@/components/Shell";
import { Dollars } from "@/components/Figures";
import { loadBooks } from "@/lib/books";
import { runClose, upcomingCash } from "@/lib/reconcile";

export default function CashPage() {
  const books = loadBooks();
  const result = runClose(books);
  const days = upcomingCash(books, result);
  const trough = days.reduce((a, b) => (b.closing < a.closing ? b : a));

  return (
    <Shell>
      <div className="kicker">Fourteen-day due-date forecast</div>
      <h1>Cash, if invoices pay when they are due.</h1>
      <p className="lede">
        Starting from posted operating cash of <Dollars cents={result.metrics.operatingCash} />. This is not a
        collections model. It drops open AR in on the invoice due date and funds open AP and tax on theirs. The trough
        is {trough.date} at <Dollars cents={trough.closing} />.
      </p>
      <div className="row three">
        <div className="stat">
          <i>Operating now</i>
          <b>
            <Dollars cents={result.metrics.operatingCash} />
          </b>
        </div>
        <div className="stat">
          <i>Day-14 close</i>
          <b>
            <Dollars cents={days[days.length - 1].closing} />
          </b>
        </div>
        <div className="stat">
          <i>Low point</i>
          <b>
            <Dollars cents={trough.closing} />
          </b>
        </div>
      </div>
      <div className="cash-row head" style={{ marginTop: 28 }}>
        <span>Date</span>
        <span>Notes</span>
        <span className="num">In</span>
        <span className="num">Out</span>
        <span className="num">Close</span>
      </div>
      {days.map((d) => (
        <div className="cash-row" key={d.date}>
          <span>{d.date}</span>
          <span>{d.label}</span>
          <span className="num">
            {d.inflows ? <Dollars cents={d.inflows} signed /> : "—"}
          </span>
          <span className="num">
            {d.outflows ? <Dollars cents={-d.outflows} signed /> : "—"}
          </span>
          <span className="num">
            <Dollars cents={d.closing} />
          </span>
        </div>
      ))}
      <div className="panel">
        <h2>Stripe still in flight</h2>
        <table>
          <thead>
            <tr>
              <th>Payout</th>
              <th>Date</th>
              <th className="num">Gross</th>
              <th className="num">Fees</th>
              <th className="num">Net to bank</th>
            </tr>
          </thead>
          <tbody>
            {books.payouts.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.date}</td>
                <td className="num">
                  <Dollars cents={p.gross} />
                </td>
                <td className="num">
                  <Dollars cents={p.fees} />
                </td>
                <td className="num">
                  <Dollars cents={p.net} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
