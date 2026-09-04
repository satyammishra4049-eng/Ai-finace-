import { GoogleGenerativeAI } from '@google/generative-ai';
import { answerQuestion } from '@/lib/ask';
import { loadBooks } from '@/lib/books';
import { runClose } from '@/lib/reconcile';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const safeMessages = messages
      .filter((message: unknown): message is { role: string; content: string } => {
        if (!message || typeof message !== 'object') return false;
        const candidate = message as { role?: unknown; content?: unknown };
        return (candidate.role === 'user' || candidate.role === 'assistant') && typeof candidate.content === 'string';
      })
      .slice(-20)
      .map((message: { role: string; content: string }) => ({ role: message.role, content: message.content.slice(0, 2000) }));
    const latestMessage = safeMessages.at(-1);

    if (!latestMessage || latestMessage.role !== 'user' || !latestMessage.content.trim()) {
      return NextResponse.json({ error: 'Enter a finance question to continue.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const books = loadBooks();
    const close = runClose(books);

    if (!apiKey) {
      return NextResponse.json({ 
        message: { 
          role: 'assistant', 
          content: answerQuestion(latestMessage.content, books, close)
        }
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
      systemInstruction: `You are Era, an expert AI Finance Controller and Advisor. 
      You must answer any questions related to finance, accounting, and business operations. 
      You can communicate fluently in both English and Hindi. 
      Keep your answers concise, professional, and helpful. 
      If a user asks about non-finance topics, politely steer the conversation back to finance.
      Use only the following current close-file snapshot for company-specific facts:
      ${JSON.stringify({ company: books.company, metrics: close.metrics, exceptions: close.exceptions.slice(0, 8) })}`
    });

    const chatHistory = safeMessages.slice(0, -1).map((message: { role: string; content: string }) => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: message.content }]
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(latestMessage.content);
    const responseText = result.response.text();

    return NextResponse.json({ 
      message: { role: 'assistant', content: responseText } 
    });
  } catch (error) {
    console.error('Era Chat Error:', error);
    return NextResponse.json({ error: 'Era is temporarily unavailable. Please try again.' }, { status: 502 });
  }
}
