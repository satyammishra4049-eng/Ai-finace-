import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        message: { 
          role: 'assistant', 
          content: 'Hi! I am Era. Please set your GEMINI_API_KEY in the .env file.'
        }
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: `You are Era, an expert AI Finance Controller and Advisor. 
      You must answer any questions related to finance, accounting, and business operations. 
      You can communicate fluently in both English and Hindi. 
      Keep your answers concise, professional, and helpful. 
      If a user asks about non-finance topics, politely steer the conversation back to finance.`
    });

    // We need to format the messages correctly for Gemini
    // Ignore the initial system message if it was passed from frontend
    const chatHistory = messages.filter((m: any) => m.role !== 'system').slice(0, -1).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const latestMessage = messages[messages.length - 1].content;

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(latestMessage);
    const responseText = result.response.text();

    return NextResponse.json({ 
      message: { role: 'assistant', content: responseText } 
    });
  } catch (error: any) {
    console.error("Era Chat Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
