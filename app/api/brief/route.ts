import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 6 hour cache
let cachedBrief: { data: BriefItem[]; timestamp: number } | null = null;
const CACHE_DURATION = 6 * 60 * 60 * 1000;

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
  ECONOMY: '#D97706',
  PULSE: '#00C9A7',
};

async function fetchRSSHeadlines(): Promise<string> {
  const feeds = [
    { url: 'https://tools.cdc.gov/api/v2/resources/media/316422.rss', variant: 'THREATS' },
    { url: 'https://www.fiercebiotech.com/rss/xml', variant: 'DISCOVERIES' },
    { url: 'https://medcitynews.com/feed/', variant: 'DISCOVERIES' },
    { url: 'https://www.fightaging.org/feed/', variant: 'LONGEVITY' },
    { url: 'https://longevity.technology/feed/', variant: 'LONGEVITY' },
    { url: 'https://www.nimh.nih.gov/rss/news', variant: 'MENTAL HEALTH' },
    { url: 'https://www.fiercehealthcare.com/rss/xml', variant: 'ECONOMY' },
    { url: 'https://www.sciencedaily.com/rss/health_medicine.xml', variant: 'PERFORMANCE' },
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
          .filter(t => t.length > 10);
        titles.forEach(t => headlines.push(`[${variant}] ${t}`));
      } catch {
        // skip failed feeds
      }
    })
  );

  return headlines.slice(0, 20).join('\n');
}

export async function GET() {
  try {
    // Return cached brief if fresh
    if (cachedBrief && Date.now() - cachedBrief.timestamp < CACHE_DURATION) {
      return NextResponse.json({ brief: cachedBrief.data, cached: true });
    }

    // Fetch live headlines
    const headlines = await fetchRSSHeadlines();

    const prompt = `You are the AI editor of Global Health Watch, a real-time global health intelligence platform.

Based on these live headlines from today:
${headlines || 'No live headlines available — use your knowledge of current global health trends.'}

Write a health brief with exactly 7 sections. Return ONLY valid JSON, no markdown, no explanation:
[
  {"variant": "THREATS", "title": "THREAT OF THE DAY", "content": "2-3 sentence brief on the most significant current health threat globally."},
  {"variant": "DISCOVERIES", "title": "DISCOVERY OF THE DAY", "content": "2-3 sentence brief on the most exciting medical breakthrough right now."},
  {"variant": "MENTAL HEALTH", "title": "MENTAL HEALTH SIGNAL", "content": "2-3 sentence brief on a key mental health development or research finding."},
  {"variant": "LONGEVITY", "title": "LONGEVITY SIGNAL", "content": "2-3 sentence brief on longevity science, biohacking, or anti-aging research."},
  {"variant": "PERFORMANCE", "title": "PERFORMANCE SIGNAL", "content": "2-3 sentence brief on human performance, sports science, or optimization."},
  {"variant": "ECONOMY", "title": "ECONOMY SIGNAL", "content": "2-3 sentence brief on health economy — drug pricing, biotech funding, or health policy."},
  {"variant": "PULSE", "title": "HEALTH PULSE EXPLAINED", "content": "2-3 sentence summary of overall global health status right now — calm, watch, or elevated?"}
]

Be specific, cite real events where possible, be globally minded not just USA-focused. Include GCC/MENA when relevant.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content || '[]';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed: BriefItem[] = JSON.parse(clean);

    // Add colors
    const brief = parsed.map(item => ({
      ...item,
      color: VARIANT_COLORS[item.variant] || '#00C9A7',
    }));

    // Cache it
    cachedBrief = { data: brief, timestamp: Date.now() };

    return NextResponse.json({ brief, cached: false });
  } catch (error) {
    console.error('Brief generation error:', error);
    return NextResponse.json({ brief: [], error: 'Failed to generate brief' }, { status: 500 });
  }
}