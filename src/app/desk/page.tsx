"use client";

import { Shell } from "@/components/Shell";
import { FormEvent, useState } from "react";

const prompts = [
  "What is the cash position?",
  "What is the match rate?",
  "What is still unmatched?",
  "Did Harbor Press pay?",
  "Show Stripe settlements",
  "What tax is still due?"
];

export default function DeskPage() {
  const [question, setQuestion] = useState("What is still unmatched?");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setAnswer("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });
      const json = (await res.json()) as { answer: string };
      setAnswer(json.answer);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <div className="kicker">Settlement Q&A</div>
      <h1>Ask the close file.</h1>
      <p className="lede">
        Answers come from the same ledger the matcher used — cash, payouts, tax, customers, invoice numbers. If an
        OpenAI key is present on the server, exception memos on the close API can be rewritten in prose; the numbers
        never come from the model.
      </p>
      <form onSubmit={onSubmit}>
        <div className="ask">
          <input value={question} onChange={(e) => setQuestion(e.target.value)} aria-label="Question" />
          <button className="primary" disabled={busy} type="submit">
            {busy ? "Working…" : "Ask"}
          </button>
        </div>
      </form>
      <div className="toolbar">
        {prompts.map((p) => (
          <button key={p} type="button" className="ghost" onClick={() => setQuestion(p)}>
            {p}
          </button>
        ))}
      </div>
      {answer ? <div className="answer">{answer}</div> : null}
    </Shell>
  );
}
