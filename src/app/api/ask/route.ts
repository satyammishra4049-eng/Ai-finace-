import { answerQuestion } from "@/lib/ask";
import { loadBooks } from "@/lib/books";
import { runClose } from "@/lib/reconcile";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = (await req.json()) as { question?: string };
  const question = (body.question || "").slice(0, 500);
  const books = loadBooks();
  const result = runClose(books);
  const answer = answerQuestion(question, books, result);
  return NextResponse.json({ answer });
}
