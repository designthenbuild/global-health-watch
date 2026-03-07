import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { question, context } = await request.json();

    const prompt = `You are a trusted global health intelligence assistant for Global Health Watch.

Context: ${context}

Task: ${question}

Be factual, calm, and clear. Do not be alarmist. Respond in plain English suitable for a general audience.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content ?? 'No summary available.';
    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Explain error:', error);
    return NextResponse.json({ answer: 'Unable to generate summary right now.' }, { status: 500 });
  }
}
