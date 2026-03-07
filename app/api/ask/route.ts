import { NextRequest, NextResponse } from 'next/server';

async function getTodaysHeadlines(): Promise<string> {
  const feeds = [
    { url: 'https://tools.cdc.gov/api/v2/resources/media/316422.rss', variant: 'THREATS' },
    { url: 'https://www.fiercebiotech.com/rss/xml', variant: 'DISCOVERIES' },
    { url: 'https://www.fightaging.org/feed/', variant: 'LONGEVITY' },
    { url: 'https://longevity.technology/feed/', variant: 'LONGEVITY' },
    { url: 'https://www.nimh.nih.gov/rss/news', variant: 'MENTAL HEALTH' },
    { url: 'https://statnews.com/feed/', variant: 'DISCOVERIES' },
    { url: 'https://www.fiercehealthcare.com/rss/xml', variant: 'INVESTMENTS' },
    { url: 'https://medcitynews.com/feed/', variant: 'INVESTMENTS' },
    { url: 'https://www.sciencedaily.com/rss/health_medicine.xml', variant: 'PERFORMANCE' },
    { url: 'https://www.biopharmadive.com/feeds/news/', variant: 'INVESTMENTS' },
    { url: 'https://a16z.com/feed/', variant: 'INVESTMENTS' },
    { url: 'https://lifespan.io/feed/', variant: 'LONGEVITY' },
  ];

  const headlines: string[] = [];

  await Promise.allSettled(
    feeds.map(async ({ url, variant }) => {
      try {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(4000),
          headers: { 'User-Agent': 'GlobalHealthWatch/1.0' },
        });
        const text = await res.text();
        const matches = text.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/g) || [];
        const titles = matches
          .slice(1, 3)
          .map(t => t.replace(/<\/?title>|<!\[CDATA\[|\]\]>/g, '').trim())
          .filter(t => t.length > 10 && t.length < 200);
        titles.forEach(t => headlines.push(`[${variant}] ${t}`));
      } catch {
        // skip failed feeds
      }
    })
  );

  return headlines.slice(0, 15).join('\n');
}

const BASE_SYSTEM = `You are The Watch, a health intelligence assistant inside Global Health Watch. Answer questions about health, nutrition, gut health, longevity, performance, food, mental health, and health tech investment.

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

Only cite from these trusted sources when relevant: Harvard Health (health.harvard.edu), WHO (who.int), CDC (cdc.gov), NIMH (nimh.nih.gov), The Lancet (thelancet.com), NEJM (nejm.org), Nature Medicine (nature.com/nm), FightAging (fightaging.org), Longevity.Technology (longevity.technology), Lifespan.io (lifespan.io), Examine.com (examine.com), BJSM (bjsm.bmj.com), FierceBiotech (fiercebiotech.com), STAT News (statnews.com), Reuters Health (reuters.com), BBC Health (bbc.com/news/health), Stanford Medicine (med.stanford.edu), PubMed (pubmed.ncbi.nlm.nih.gov), Mayo Clinic (mayoclinic.org), Healthline (healthline.com), MedCity News (medcitynews.com), Andreessen Horowitz (a16z.com), BioPharma Dive (biopharmadive.com), Altos Labs (altoslabs.com), Calico (calicolabs.com), Insilico Medicine (insilico.com), M42 (m42.ae), Longevity.Technology (longevity.technology). Always use real URLs. Never invent URLs.`;

export async function POST(req: NextRequest) {
  try {
    const { question, history } = await req.json();

    // Fetch today's headlines in parallel with request processing
    const headlines = await getTodaysHeadlines();

    const systemWithContext = headlines.length > 0
      ? `${BASE_SYSTEM}

TODAY'S LIVE HEADLINES (use these as context when relevant to the question):
${headlines}

If the question relates to any of these headlines or companies mentioned, reference them in your answer.`
      : BASE_SYSTEM;

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
          { role: 'system', content: systemWithContext },
          ...msgs,
        ],
        max_tokens: 600,
        temperature: 0.6,
      }),
    });

    if (!res.ok) return NextResponse.json({ answer: 'Unavailable. Try again.' });

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content ?? 'No answer.';
    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ answer: 'Something went wrong.' });
  }
}