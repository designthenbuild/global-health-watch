import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 90 minute cache
let cachedBrief: { data: BriefItem[]; timestamp: number } | null = null;
const CACHE_DURATION = 90 * 60 * 1000;

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

async function fetchRSSHeadlines(): Promise<string> {
  const feeds = [
    // THREATS
    { url: 'https://tools.cdc.gov/api/v2/resources/media/316422.rss', variant: 'THREATS' },
    { url: 'https://www.who.int/rss-feeds/news-english.xml', variant: 'THREATS' },
    { url: 'https://promedmail.org/feed/', variant: 'THREATS' },

    // DISCOVERIES
    { url: 'https://www.fiercebiotech.com/rss/xml', variant: 'DISCOVERIES' },
    { url: 'https://statnews.com/feed/', variant: 'DISCOVERIES' },
    { url: 'https://medcitynews.com/feed/', variant: 'DISCOVERIES' },
    { url: 'https://www.sciencedaily.com/rss/health_medicine.xml', variant: 'DISCOVERIES' },

    // LONGEVITY — including biotech companies
    { url: 'https://www.fightaging.org/feed/', variant: 'LONGEVITY' },
    { url: 'https://longevity.technology/feed/', variant: 'LONGEVITY' },
    { url: 'https://www.lifespan.io/feed/', variant: 'LONGEVITY' },
    { url: 'https://www.altoslabs.com/feed/', variant: 'LONGEVITY' },
    { url: 'https://www.buckinstitute.org/feed/', variant: 'LONGEVITY' },

    // MENTAL HEALTH
    { url: 'https://www.nimh.nih.gov/rss/news', variant: 'MENTAL HEALTH' },
    { url: 'https://www.thelancet.com/rssfeed/lanpsy_current.xml', variant: 'MENTAL HEALTH' },

    // PERFORMANCE
    { url: 'https://bjsm.bmj.com/rss/current.xml', variant: 'PERFORMANCE' },
    { url: 'https://www.sciencedaily.com/rss/mind_brain/sports_science.xml', variant: 'PERFORMANCE' },

    // INVESTMENTS — investors + industry
    { url: 'https://www.fiercehealthcare.com/rss/xml', variant: 'INVESTMENTS' },
    { url: 'https://www.biopharmadive.com/feeds/news/', variant: 'INVESTMENTS' },
    { url: 'https://a16z.com/feed/', variant: 'INVESTMENTS' },
    { url: 'https://www.fiercepharma.com/rss/xml', variant: 'INVESTMENTS' },
  ];

  const headlines: string[] = [];

  await Promise.allSettled(
    feeds.map(async ({ url, variant }) => {
      try {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(5000),
          headers: { 'User-Agent': 'GlobalHealthWatch/1.0' },
        });
        const text = await res.text();
        const matches = text.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/g) || [];
        const titles = matches
          .slice(1, 4)
          .map(t => t.replace(/<\/?title>|<!\[CDATA\[|\]\]>/g, '').trim())
          .filter(t => t.length > 10 && t.length < 200);
        titles.forEach(t => headlines.push(`[${variant}] ${t}`));
      } catch {
        // skip failed feeds
      }
    })
  );

  return headlines.slice(0, 25).join('\n');
}

export async function GET() {
  try {
    if (cachedBrief && Date.now() - cachedBrief.timestamp < CACHE_DURATION) {
      return NextResponse.json({ brief: cachedBrief.data, cached: true });
    }

    const headlines = await fetchRSSHeadlines();

    const prompt = `You are the AI editor of Global Health Watch, a real-time global health intelligence platform covering threats, discoveries, longevity, mental health, performance, and health investments.

Based on these live headlines from today:
${headlines || 'No live headlines available — use your knowledge of current global health trends as of early 2026.'}

Write a health brief with exactly 7 sections. Be globally minded — include GCC/MENA, Europe, and Asia where relevant, not just USA. Be specific and reference real companies, studies, or events where possible.

Return ONLY valid JSON, no markdown, no explanation:
[
  {"variant": "THREATS", "title": "THREAT OF THE DAY", "content": "2-3 sentence brief on the most significant current health threat globally."},
  {"variant": "DISCOVERIES", "title": "DISCOVERY OF THE DAY", "content": "2-3 sentence brief on the most exciting medical or biotech breakthrough right now. Can reference companies like Altos Labs, Insilico Medicine, or clinical trial results."},
  {"variant": "MENTAL HEALTH", "title": "MENTAL HEALTH SIGNAL", "content": "2-3 sentence brief on a key mental health development, research finding, or treatment advance."},
  {"variant": "LONGEVITY", "title": "LONGEVITY SIGNAL", "content": "2-3 sentence brief on longevity science, senolytics, NAD+, reprogramming, or anti-aging biotech. Can reference Altos Labs, Calico, Retro Bio, or clinical findings."},
  {"variant": "PERFORMANCE", "title": "PERFORMANCE SIGNAL", "content": "2-3 sentence brief on human performance, sports science, wearables, or optimization protocols."},
  {"variant": "INVESTMENTS", "title": "INVESTMENTS SIGNAL", "content": "2-3 sentence brief on health investments — biotech funding, drug pricing, VC activity, or health policy. Can reference a16z, Flagship Pioneering, Apollo Health Ventures, Mubadala, or deal news."},
  {"variant": "PULSE", "title": "HEALTH PULSE EXPLAINED", "content": "2-3 sentence summary of overall global health status right now — calm, watch, or elevated and why."}
]`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content || '[]';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed: BriefItem[] = JSON.parse(clean);

    const brief = parsed.map(item => ({
      ...item,
      color: VARIANT_COLORS[item.variant] || '#00C9A7',
    }));

    cachedBrief = { data: brief, timestamp: Date.now() };

    return NextResponse.json({ brief, cached: false });
  } catch (error) {
    console.error('Brief generation error:', error);
    return NextResponse.json({ brief: [], error: 'Failed to generate brief' }, { status: 500 });
  }
}