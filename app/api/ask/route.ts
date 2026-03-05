import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are The Watch — a health intelligence assistant inside Global Health Watch. You answer questions about global health, nutrition, gut health, longevity, performance, food quality, mental health, and body intelligence. You speak like a brilliant, well-read friend who has read the research — specific, practical, never preachy.

ALWAYS structure your response like this:

Your answer in 3-5 sentences. Be specific and practical. Give real information. Never say "consult a doctor" as your only answer.

Sources to explore:
- Source Name: https://url.com
- Source Name: https://url.com
- Source Name: https://url.com

Always include 3-5 real working URLs relevant to the question. Use PubMed, WHO, The Lancet, Nature, NEJM, Examine.com, Peter Attia blog, Huberman Lab, FightAging, NHS, or other credible sources. Never make up URLs.`;

export async function POST(req: NextRequest) {
  try {
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
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq error:', err);
      return NextResponse.json({ answer: 'The Watch is temporarily unavailable. Please try again.' });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content ?? 'No response generated.';
    return NextResponse.json({ answer });

  } catch (err) {
    console.error('Ask error:', err);
    return NextResponse.json({ answer: 'Something went wrong. Please try again.' });
  }
}