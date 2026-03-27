import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

let cachedBrief: { data: BriefItem[]; timestamp: number } | null = null;
const CACHE_DURATION = 30 * 60 * 1000;

interface BriefItem {
  title: string;
  content: string;
  color: string;
  variant: string;
}

const VARIANT_COLORS: Record<string, string> = {
  THREATS: '#E63946',
  DISCOVERIES: '#00B4D8',
  'MENTAL HEALTH': '#7C3AED',
  LONGEVITY: '#059669',
  PERFORMANCE: '#2563EB',
  INVESTMENTS: '#D97706',
  PULSE: '#00C9A7',
};

async function fetchHeadlines(): Promise<Record<string, string[]>> {
  const feeds: Array<{ url: string; variant: string }> = [
    { url: 'https://www.who.int/rss-feeds/news-releases.xml', variant: 'THREATS' },
    { url: 'https://www.ecdc.europa.eu/en/rss.xml', variant: 'THREATS' },
    { url: 'https://www.nejm.org/rss/current.xml', variant: 'DISCOVERIES' },
    { url: 'https://endpts.com/feed/', variant: 'DISCOVERIES' },
    { url: 'https://longevity.technology/feed/', variant: 'LONGEVITY' },
    { url: 'https://www.fightaging.org/feed/', variant: 'LONGEVITY' },
    { url: 'https://www.nimh.nih.gov/news/rss/nimh-all-news.xml', variant: 'MENTAL HEALTH' },
    { url: 'https://bjsm.bmj.com/rss/current.xml', variant: 'PERFORMANCE' },
    { url: 'https://www.biopharmadive.com/feeds/news/', variant: 'INVESTMENTS' },
    { url: 'https://www.mobihealthnews.com/feed', variant: 'INVESTMENTS' },
  ];

  const byVariant: Record<string, string[]> = {
    THREATS: [], DISCOVERIES: [], LONGEVITY: [], 'MENTAL HEALTH': [], PERFORMANCE: [], INVESTMENTS: [],
  };

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
          .slice(1, 4)
          .map((t: string) => t.replace(/<\/?title>|<!\[CDATA\[|\]\]>/g, '').trim())
          .filter((t: string) => t.length > 10 && t.length < 200);
        byVariant[variant].push(...titles);
      } catch { /* skip */ }
    })
  );

  return byVariant;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bust = searchParams.get('bust');

    if (!bust && cachedBrief && Date.now() - cachedBrief.timestamp < CACHE_DURATION) {
      return NextResponse.json({ brief: cachedBrief.data, cached: true });
    }

    const headlines = await fetchHeadlines();

    // Format headlines by category for the prompt
    const headlineBlock = Object.entries(headlines)
      .map(([variant, titles]) => `${variant} HEADLINES:\n${titles.length > 0 ? titles.map(t => `- ${t}`).join('\n') : '- No headlines available, use your knowledge'}`)
      .join('\n\n');

    const prompt = `You are the AI editor of Global Health Watch. Write exactly 7 health briefs, one per category.

LIVE HEADLINES BY CATEGORY:
${headlineBlock}

RULES:
- Each brief must ONLY cover its own category topic
- THREATS = infectious disease outbreaks, pandemics, biosecurity only
- DISCOVERIES = medical research, drug approvals, clinical trials only  
- LONGEVITY = aging science, senolytics, NAD+, longevity biotech only
- MENTAL HEALTH = psychiatry, depression, anxiety, psychedelics only
- PERFORMANCE = exercise science, wearables, sports medicine only
- INVESTMENTS = biotech funding, VC deals, health M&A only
- PULSE = 2-3 sentence overall global health status summary
- Be globally minded, mention GCC/MENA, Europe, Asia where relevant
- Each content field: exactly 2-3 sentences

Return ONLY this JSON array, no markdown:
[
{"variant":"THREATS","title":"THREAT OF THE DAY","content":"..."},
{"variant":"DISCOVERIES","title":"DISCOVERY OF THE DAY","content":"..."},
{"variant":"LONGEVITY","title":"LONGEVITY SIGNAL","content":"..."},
{"variant":"MENTAL HEALTH","title":"MENTAL HEALTH SIGNAL","content":"..."},
{"variant":"PERFORMANCE","title":"PERFORMANCE SIGNAL","content":"..."},
{"variant":"INVESTMENTS","title":"INVESTMENTS SIGNAL","content":"..."},
{"variant":"PULSE","title":"HEALTH PULSE","content":"..."}
]`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1800,
    });

    const raw = completion.choices[0]?.message?.content || '[]';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed: BriefItem[] = JSON.parse(clean);

    // Force correct colors regardless of model output
    const brief = parsed.map(item => ({
      ...item,
      color: VARIANT_COLORS[item.variant] || '#00C9A7',
    }));

    cachedBrief = { data: brief, timestamp: Date.now() };
    return NextResponse.json({ brief, cached: false });

  } catch (error) {
    console.error('Brief generation error:', String(error)); console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json({ brief: [], error: 'Failed to generate brief' }, { status: 500 });
  }
}
