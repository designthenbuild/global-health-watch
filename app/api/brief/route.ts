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

const CATEGORY_FEEDS: Record<string, string[]> = {
  THREATS: [
    'https://www.who.int/rss-feeds/news-releases.xml',
    'https://promedmail.org/feed/',
    'https://www.ecdc.europa.eu/en/rss.xml',
  ],
  DISCOVERIES: [
    'https://www.nejm.org/rss/current.xml',
    'https://www.nature.com/nm.rss',
    'https://endpts.com/feed/',
  ],
  LONGEVITY: [
    'https://www.fightaging.org/feed/',
    'https://longevity.technology/feed/',
    'https://www.lifespan.io/feed/',
  ],
  'MENTAL HEALTH': [
    'https://www.nimh.nih.gov/news/rss/nimh-all-news.xml',
    'https://www.thelancet.com/rssfeed/lanpsy_current.xml',
  ],
  PERFORMANCE: [
    'https://bjsm.bmj.com/rss/current.xml',
    'https://www.sciencedaily.com/rss/mind_brain/sports_science.xml',
  ],
  INVESTMENTS: [
    'https://www.biopharmadive.com/feeds/news/',
    'https://www.mobihealthnews.com/feed',
    'https://techcrunch.com/tag/health/feed/',
  ],
};

const CATEGORY_PROMPTS: Record<string, string> = {
  THREATS: 'Write 2-3 sentences about the most significant current infectious disease outbreak, pandemic risk, or biosecurity threat globally. Focus only on disease/pathogen threats.',
  DISCOVERIES: 'Write 2-3 sentences about the most exciting recent medical or biotech research breakthrough — clinical trials, drug approvals, or scientific discoveries.',
  LONGEVITY: 'Write 2-3 sentences about the latest longevity science — senolytics, NAD+, epigenetic reprogramming, or anti-aging biotech companies like Altos Labs, Calico, or Retro Bio.',
  'MENTAL HEALTH': 'Write 2-3 sentences about a key mental health research finding, treatment advance, or policy development — depression, anxiety, psychedelics, or burnout.',
  PERFORMANCE: 'Write 2-3 sentences about human performance optimization — exercise science, wearables, recovery, VO2 max, sleep, or sports medicine.',
  INVESTMENTS: 'Write 2-3 sentences about recent health investment news — biotech funding rounds, VC activity, M&A deals, or health tech valuations. Reference specific companies or deals where possible.',
};

const CATEGORY_TITLES: Record<string, string> = {
  THREATS: 'THREAT OF THE DAY',
  DISCOVERIES: 'DISCOVERY OF THE DAY',
  LONGEVITY: 'LONGEVITY SIGNAL',
  'MENTAL HEALTH': 'MENTAL HEALTH SIGNAL',
  PERFORMANCE: 'PERFORMANCE SIGNAL',
  INVESTMENTS: 'INVESTMENTS SIGNAL',
};

async function fetchHeadlinesForCategory(category: string): Promise<string> {
  const urls = CATEGORY_FEEDS[category] || [];
  const headlines: string[] = [];

  await Promise.allSettled(
    urls.map(async (url) => {
      try {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(4000),
          headers: { 'User-Agent': 'GlobalHealthWatch/1.0' },
        });
        const text = await res.text();
        const matches = text.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/g) || [];
        const titles = matches
          .slice(1, 4)
          .map(t => t.replace(/<\/?title>|<!\[CDATA\[|\]\]>/g, '').trim())
          .filter(t => t.length > 10 && t.length < 200);
        headlines.push(...titles);
      } catch { /* skip */ }
    })
  );

  return headlines.slice(0, 6).join('\n');
}

async function generateCategoryBrief(category: string): Promise<BriefItem> {
  const headlines = await fetchHeadlinesForCategory(category);

  const headlineContext = headlines
    ? `Here are today's headlines for this category:\n${headlines}\n\nUse these as context if relevant.`
    : `No live headlines available — use your knowledge of current ${category.toLowerCase()} trends as of early 2026.`;

  const prompt = `You are the AI editor of Global Health Watch. Your task is to write a brief for ONE specific category only: ${category}.

${headlineContext}

${CATEGORY_PROMPTS[category]}

Be globally minded — mention GCC/MENA, Europe, or Asia where relevant, not just USA.
Return ONLY a JSON object with this exact structure, no markdown, no explanation:
{"variant": "${category}", "title": "${CATEGORY_TITLES[category] || category}", "content": "your 2-3 sentence brief here"}`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    max_tokens: 300,
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  const clean = raw.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);

  return {
    ...parsed,
    variant: category, // force correct variant regardless of model output
    color: VARIANT_COLORS[category] || '#00C9A7',
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bust = searchParams.get('bust');

    if (!bust && cachedBrief && Date.now() - cachedBrief.timestamp < CACHE_DURATION) {
      return NextResponse.json({ brief: cachedBrief.data, cached: true });
    }

    const categories = ['THREATS', 'DISCOVERIES', 'LONGEVITY', 'MENTAL HEALTH', 'PERFORMANCE', 'INVESTMENTS'];

    // Generate each category independently — no cross-contamination possible
    const results = await Promise.allSettled(
      categories.map(cat => generateCategoryBrief(cat))
    );

    const brief: BriefItem[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        brief.push(result.value);
      }
    }

    // Add PULSE summary based on what was generated
    const pulsePrompt = `Based on these global health category summaries, write 2-3 sentences summarizing the overall global health status right now — is it calm, watch level, or elevated, and why?

${brief.map(b => `${b.variant}: ${b.content}`).join('\n\n')}

Return ONLY a JSON object:
{"variant": "PULSE", "title": "HEALTH PULSE", "content": "your 2-3 sentence summary"}`;

    try {
      const pulseCompletion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: pulsePrompt }],
        temperature: 0.3,
        max_tokens: 200,
      });
      const pulseRaw = pulseCompletion.choices[0]?.message?.content || '{}';
      const pulseClean = pulseRaw.replace(/```json|```/g, '').trim();
      const pulseParsed = JSON.parse(pulseClean);
      brief.push({ ...pulseParsed, variant: 'PULSE', color: '#00C9A7' });
    } catch {
      brief.push({ variant: 'PULSE', title: 'HEALTH PULSE', content: 'Global health signals at watch level. Multiple developments across biotech, mental health, and infectious disease monitoring.', color: '#00C9A7' });
    }

    cachedBrief = { data: brief, timestamp: Date.now() };
    return NextResponse.json({ brief, cached: false });

  } catch (error) {
    console.error('Brief generation error:', error);
    return NextResponse.json({ brief: [], error: 'Failed to generate brief' }, { status: 500 });
  }
}
