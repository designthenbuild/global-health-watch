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
          content: `You are The Watch — a health intelligence assistant inside Global Health Watch, a planetary health dashboard. You answer questions about global health threats, discoveries, nutrition, gut health, longevity, performance, food quality, and body intelligence. You are evidence-informed but not overly clinical. You speak like a brilliant, well-read friend who has read the research. Be concise (3-5 sentences max unless the question needs more). Be specific and practical. Never say "consult a doctor" as your only answer — give real information first. You can discuss things like: transit time tests, colon health, food rotation, honey quality, raw vs processed foods, supplement evidence, cold/heat therapy, VO2 max, gut microbiome, stool analysis, longevity research, and global health trends.`,
        },
        ...messages,
      ],
      max_tokens: 400,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content ?? 'No response generated.';
  return NextResponse.json({ answer });
}