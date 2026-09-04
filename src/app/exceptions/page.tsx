import { Shell } from "@/components/Shell";
import { Dollars } from "@/components/Figures";
import { loadBooks } from "@/lib/books";
import { runClose } from "@/lib/reconcile";

export default function ExceptionsPage() {
  const books = loadBooks();
  const result = runClose(books);
  const order = [
    "unmatched_inflow",
    "unmatched_outflow",
    "short_pay",
    "tax_variance",
    "open_payable",
    "open_receivable",
    "timing",
    "fee_adjusted"
  ];
  const list = [...result.exceptions].sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));

  return (
    <Shell>
      <div className="kicker">Honest remainder</div>
      <h1>Exceptions the agent would not force.</h1>
      <p className="lede">
        {list.length} items after the close. Unmatched bank lines and short pays are the ones that need a person.
        Open AR/AP that is still inside terms is listed so the forecast is complete — it is not a matching failure.
      </p>
      {list.map((e) => (
        <div className="ex" key={e.id}>
          <div className="kicker">{e.kind.replaceAll("_", " ")}</div>
          <h3>
            {e.title}{" "}
            <span style={{ fontWeight: 400 }}>
              · <Dollars cents={e.amount} signed />
            </span>
          </h3>
          <p>{e.detail}</p>
          <p style={{ marginTop: 6 }}>{e.suggestedAction}</p>
        </div>
      ))}
    </Shell>
  );
}
