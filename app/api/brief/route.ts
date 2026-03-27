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
    // THREATS — disease outbreaks only, no recalls
    { url: 'https://www.who.int/rss-feeds/news-releases.xml', variant: 'THREATS' },
    { url: 'https://promedmail.org/feed/', variant: 'THREATS' },
    { url: 'https://www.ecdc.europa.eu/en/rss.xml', variant: 'THREATS' },

    // DISCOVERIES — research breakthroughs
    { url: 'https://www.nejm.org/rss/current.xml', variant: 'DISCOVERIES' },
    { url: 'https://www.nature.com/nm.rss', variant: 'DISCOVERIES' },
    { url: 'https://www.fiercebiotech.com/rss/xml', variant: 'DISCOVERIES' },
    { url: 'https://endpts.com/feed/', variant: 'DISCOVERIES' },

    // LONGEVITY
    { url: 'https://www.fightaging.org/feed/', variant: 'LONGEVITY' },
    { url: 'https://longevity.technology/feed/', variant: 'LONGEVITY' },
    { url: 'https://www.lifespan.io/feed/', variant: 'LONGEVITY' },
    { url: 'https://www.buckinstitute.org/feed/', variant: 'LONGEVITY' },

    // MENTAL HEALTH
    { url: 'https://www.nimh.nih.gov/news/rss/nimh-all-news.xml', variant: 'MENTAL HEALTH' },
    { url: 'https://www.thelancet.com/rssfeed/lanpsy_current.xml', variant: 'MENTAL HEALTH' },
    { url: 'https://www.mindful.org/feed/', variant: 'MENTAL HEALTH' },

    // PERFORMANCE
    { url: 'https://bjsm.bmj.com/rss/current.xml', variant: 'PERFORMANCE' },
    { url: 'https://www.sciencedaily.com/rss/mind_brain/sports_science.xml', variant: 'PERFORMANCE' },
    { url: 'https://ouraring.com/blog/feed/', variant: 'PERFORMANCE' },

    // INVESTMENTS
    { url: 'https://www.biopharmadive.com/feeds/news/', variant: 'INVESTMENTS' },
    { url: 'https://www.mobihealthnews.com/feed', variant: 'INVESTMENTS' },
    { url: 'https://techcrunch.com/tag/health/feed/', variant: 'INVESTMENTS' },
    { url: 'https://sifted.eu/feed/', variant: 'INVESTMENTS' },
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

Write a health brief with exactly 7 sections. STRICT RULE: each section must ONLY use headlines tagged with its own variant label. If no relevant headlines exist for a section, use your own knowledge of current trends for that category — do NOT use headlines from other categories. Be globally minded, include GCC/MENA, Europe and Asia where relevant.

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