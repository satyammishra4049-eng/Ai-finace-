import { Shell } from "@/components/Shell";
import { Dollars } from "@/components/Figures";
import { loadBooks } from "@/lib/books";

export default async function BooksPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const tab = sp.tab === "ap" ? "ap" : "ar";
  const q = (sp.q || "").toLowerCase();
  const books = loadBooks();
  const invoices = books.invoices.filter(
    (i) => !q || i.number.toLowerCase().includes(q) || i.customerName.toLowerCase().includes(q)
  );
  const bills = books.bills.filter(
    (b) => !q || b.number.toLowerCase().includes(q) || b.vendorName.toLowerCase().includes(q) || b.category.includes(q)
  );

  return (
    <Shell>
      <div className="kicker">Source documents</div>
      <h1>The books</h1>
      <p className="lede">
        {books.invoices.length} customer invoices and {books.bills.length} vendor bills. Tax is on the invoice only
        when the customer is not on resale. Mill invoices, freight, utilities, insurance, ADP and the state/federal
        tax bills sit in AP with due dates that drive the cash forecast.
      </p>
      <div className="toolbar">
        <a className={tab === "ar" ? "primary" : "ghost"} href="/books?tab=ar">
          Receivables ({books.invoices.length})
        </a>
        <a className={tab === "ap" ? "primary" : "ghost"} href="/books?tab=ap">
          Payables ({books.bills.length})
        </a>
        <form>
          <input type="hidden" name="tab" value={tab} />
          <input name="q" defaultValue={sp.q || ""} placeholder="Filter name or number" style={{ border: "1px solid var(--line-strong)", padding: "8px 12px", minWidth: 220 }} />
        </form>
      </div>
      {tab === "ar" ? (
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Issued</th>
              <th>Due</th>
              <th>Terms</th>
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((i) => (
              <tr key={i.id}>
                <td>{i.number}</td>
                <td>{i.customerName}</td>
                <td>{i.issued}</td>
                <td>{i.due}</td>
                <td>
                  {i.terms}
                  {i.resale ? " · resale" : ""}
                </td>
                <td className="num">
                  <Dollars cents={i.amount} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Bill</th>
              <th>Vendor</th>
              <th>Issued</th>
              <th>Due</th>
              <th>Category</th>
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((b) => (
              <tr key={b.id}>
                <td>{b.number}</td>
                <td>{b.vendorName}</td>
                <td>{b.issued}</td>
                <td>{b.due}</td>
                <td>{b.category}</td>
                <td className="num">
                  <Dollars cents={b.amount} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Shell>
  );
}
