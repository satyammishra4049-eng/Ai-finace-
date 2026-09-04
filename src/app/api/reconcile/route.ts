import { maybeNarrate } from "@/lib/ask";
import { loadBooks } from "@/lib/books";
import { runClose, upcomingCash } from "@/lib/reconcile";
import { NextResponse } from "next/server";

export async function POST() {
  const books = loadBooks();
  const result = runClose(books);
  const forecast = upcomingCash(books, result);
  const memo = await maybeNarrate(result.exceptions);
  return NextResponse.json({ result, forecast, memo });
}

export async function GET() {
  const books = loadBooks();
  const result = runClose(books);
  const forecast = upcomingCash(books, result);
  return NextResponse.json({ result, forecast, memo: null });
}
