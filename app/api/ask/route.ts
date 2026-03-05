import { NextRequest, NextResponse } from 'next/server';

const SYSTEM = `You are The Watch, a health intelligence assistant inside Global Health Watch. Answer questions about health, nutrition, gut health, longevity, performance, food, mental health, and health tech investment.

Always structure your response in this exact format:

[2-3 sentence direct answer. Be specific and practical. No fluff.]

Key points:
- Point one
- Point two
- Point three

Sources:
- Source Name: https://real-url.com
- Source Name: https://real-url.com
- Source Name: https://real-url.com

Only cite from these trusted sources when relevant: Harvard Health (health.harvard.edu), WHO (who.int), CDC (cdc.gov), NIMH (nimh.nih.gov), The Lancet (thelancet.com), NEJM (nejm.org), Nature Medicine (nature.com/nm), Peter Attia MD (peterattiamd.com), FightAging (fightaging.org), Longevity.Technology (longevity.technology), Lifespan.io (lifespan.io), Examine.com (examine.com), BJSM (bjsm.bmj.com), FierceBiotech (fiercebiotech.com), STAT News (statnews.com), Reuters Health (reuters.com), BBC Health (bbc.com/news/health), Stanford Medicine (med.stanford.edu), PubMed (pubmed.ncbi.nlm.nih.gov), Mayo Clinic (mayoclinic.org), Healthline (healthline.com), MedCity News (medcitynews.com), Andreessen Horowitz (a16z.com), Sifted (sifted.eu), BioPharma Dive (biopharmadive.com). Always use real URLs. Never invent URLs.`;

export async function POST(req: NextRequest) {
  try {
    const { question, history } = await req.json();
    const msgs = [
      ...history.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: question },
    ];
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM },
          ...msgs,
        ],
        max_tokens: 500,
        temperature: 0.6,
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ answer: 'Unavailable. Try again.' });
    }
    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content ?? 'No answer.';
    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ answer: 'Something went wrong.' });
  }
}