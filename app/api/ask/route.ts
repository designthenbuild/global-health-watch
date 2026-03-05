import { NextRequest, NextResponse } from 'next/server';

const SYSTEM = "You are The Watch, a health intelligence assistant. Answer questions about health, nutrition, gut health, longevity, performance, food, and mental health. Be specific and practical. Always end with: Sources to explore: then 3-5 real URLs in format - Name: https://url";

export async function POST(req: NextRequest) {
  try {
    const { question, history } = await req.json();
    const msgs = [
      ...history.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
      { role: 'user', content: question },
    ];
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: SYSTEM }, ...msgs], max_tokens: 500 }),
    });
    if (!res.ok) return NextResponse.json({ answer: 'Unavailable. Try again.' });
    const data = await res.json();
    return NextResponse.json({ answer: data.choices?.[0]?.message?.content ?? 'No answer.' });
  } catch {
    return NextResponse.json({ answer: 'Something went wrong.' });
  }
}
