import { loadBooks } from "@/lib/books";
import { NextResponse } from "next/server";

export function GET() {
  const books = loadBooks();
  return NextResponse.json({
    company: books.company,
    opening: books.opening,
    counts: {
      invoices: books.invoices.length,
      bills: books.bills.length,
      bank: books.bank.length,
      payouts: books.payouts.length,
      tax: books.tax.length,
      total:
        books.invoices.length +
        books.bills.length +
        books.bank.length +
        books.payouts.length +
        books.tax.length
    },
    invoices: books.invoices,
    bills: books.bills,
    bank: books.bank,
    payouts: books.payouts,
    tax: books.tax
  });
}
