import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { question, history } = await req.json();

  const messages = [
    ...history.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    })),
    { role: 'user', content: question },
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are The Watch — a health intelligence assistant inside Global Health Watch. You answer questions about global health, nutrition, gut health, longevity, performance, food quality, mental health, and body intelligence. You speak like a brilliant, well-read friend who has read the research — specific, practical, never preachy.

ALWAYS structure your response in this exact format:

[Your answer in 3-5 sentences. Be specific and practical. Give real information.]

**Sources to explore:**
- [Source name] — [url]
- [Source name] — [url]
- [Source name] — [url]
- [Source name] — [url]

Always include 3-5 real, working source URLs relevant to the specific question. Use sources like PubMed, WHO, The Lancet, Nature, NEJM, Examine.com, Peter Attia's blog, Huberman Lab, FightAging, NHS, WebMD, or other credible health sources. Never make up URLs.`,
        },
        ...messages,
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Groq error:', err);
    return NextResponse.json({ answer: 'The Watch is temporarily un