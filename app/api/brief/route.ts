import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

let cachedBrief: { data: BriefItem[]; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000;

interface Article {
  title: string;
  url: string;
  source: string;
}

interface BriefItem {
  title: string;
  content: string;
  color: string;
  variant: string;
  sources: { label: string; url: string; type: string }[];
  critical?: boolean;
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

const FEED_CONFIG: Array<{ url: string; variant: string; source: string }> = [
  { url: 'https://www.who.int/rss-feeds/news-releases.xml', variant: 'THREATS', source: 'WHO' },
  { url: 'https://www.ecdc.europa.eu/en/rss.xml', variant: 'THREATS', source: 'ECDC' },
  { url: 'https://www.nejm.org/rss/current.xml', variant: 'DISCOVERIES', source: 'NEJM' },
  { url: 'https://endpts.com/feed/', variant: 'DISCOVERIES', source: 'Endpoints News' },
  { url: 'https://www.nature.com/nm.rss', variant: 'DISCOVERIES', source: 'Nature Medicine' },
  { url: 'https://longevity.technology/feed/', variant: 'LONGEVITY', source: 'Longevity.Technology' },
  { url: 'https://www.fightaging.org/feed/', variant: 'LONGEVITY', source: 'FightAging!' },
  { url: 'https://www.lifespan.io/feed/', variant: 'LONGEVITY', source: 'Lifespan.io' },
  { url: 'https://www.nimh.nih.gov/news/rss/nimh-all-news.xml', variant: 'MENTAL HEALTH', source: 'NIMH' },
  { url: 'https://www.thelancet.com/rssfeed/lanpsy_current.xml', variant: 'MENTAL HEALTH', source: 'Lancet Psychiatry' },
  { url: 'https://bjsm.bmj.com/rss/current.xml', variant: 'PERFORMANCE', source: 'BJSM' },
  { url: 'https://www.sciencedaily.com/rss/mind_brain/sports_science.xml', variant: 'PERFORMANCE', source: 'ScienceDaily Sports' },
  { url: 'https://www.biopharmadive.com/feeds/news/', variant: 'INVESTMENTS', source: 'BioPharma Dive' },
  { url: 'https://www.mobihealthnews.com/feed', variant: 'INVESTMENTS', source: 'MobiHealthNews' },
  { url: 'https://techcrunch.com/tag/health/feed/', variant: 'INVESTMENTS', source: 'TechCrunch Health' },
];

async function fetchArticles(): Promise<Record<string, Article[]>> {
  const byVariant: Record<string, Article[]> = {
    THREATS: [], DISCOVERIES: [], LONGEVITY: [], 'MENTAL HEALTH': [], PERFORMANCE: [], INVESTMENTS: [],
  };

  await Promise.allSettled(
    FEED_CONFIG.map(async ({ url, variant, source }) => {
      try {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(4000),
          headers: { 'User-Agent': 'GlobalHealthWatch/1.0' },
        });
        const text = await res.text();

        // Extract title+link pairs
        const items = text.match(/<item>([\s\S]*?)<\/item>/g) || [];
        for (const item of items.slice(0, 3)) {
          const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
          const linkMatch = item.match(/<link>(.*?)<\/link>/) || item.match(/<link[^>]*href="([^"]+)"/);
          const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : '';
          const link = linkMatch ? linkMatch[1].trim() : url;
          if (title.length > 10 && title.length < 200) {
            byVariant[variant].push({ title, url: link, source });
          }
        }
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

    const articles = await fetchArticles();

    // Format for prompt — include URLs so model knows what's available
    const headlineBlock = Object.entries(articles)
      .map(([variant, items]) => {
        if (items.length === 0) return `${variant} HEADLINES:\n- No headlines available, use your knowledge`;
        return `${variant} HEADLINES:\n${items.map((a, i) => `[${i + 1}] "${a.title}" — ${a.source}`).join('\n')}`;
      })
      .join('\n\n');

    const prompt = `You are the AI editor of Global Health Watch. Write exactly 7 health briefs, one per category.

LIVE ARTICLES BY CATEGORY (with source names):
${headlineBlock}

RULES:
- Each brief must ONLY cover its own category topic
- THREATS = infectious disease outbreaks, pandemics, biosecurity only
- DISCOVERIES = medical research, drug approvals, clinical trials only
- LONGEVITY = aging science, senolytics, NAD+, longevity biotech only
- MENTAL HEALTH = psychiatry, depression, anxiety, psychedelics only
- PERFORMANCE = exercise science, wearables, sports medicine only
- INVESTMENTS = biotech funding, VC deals, health M&A only
- PULSE = overall global health status summary
- Be globally minded, mention GCC/MENA, Europe, Asia where relevant
- Each content: exactly 2-3 sentences
- For "usedSources": list only the source names you actually referenced (e.g. ["NEJM", "Nature Medicine"])

Return ONLY this JSON array, no markdown:
[
{"variant":"THREATS","title":"THREAT OF THE DAY","content":"...","usedSources":["source1","source2"]},
{"variant":"DISCOVERIES","title":"DISCOVERY OF THE DAY","content":"...","usedSources":["source1"]},
{"variant":"LONGEVITY","title":"LONGEVITY SIGNAL","content":"...","usedSources":["source1"]},
{"variant":"MENTAL HEALTH","title":"MENTAL HEALTH SIGNAL","content":"...","usedSources":["source1"]},
{"variant":"PERFORMANCE","title":"PERFORMANCE SIGNAL","content":"...","usedSources":["source1"]},
{"variant":"INVESTMENTS","title":"INVESTMENTS SIGNAL","content":"...","usedSources":["source1"]},
{"variant":"PULSE","title":"HEALTH PULSE","content":"...","usedSources":[]}
]`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const raw = completion.choices[0]?.message?.content || '[]';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed: Array<BriefItem & { usedSources?: string[] }> = JSON.parse(clean);

    // Match usedSources back to real article URLs
    const brief: BriefItem[] = parsed.map(item => {
      const variantArticles = articles[item.variant] || [];
      const usedSources = item.usedSources || [];

      const sources = usedSources.length > 0
        ? usedSources
            .map(sourceName => {
              const article = variantArticles.find(a =>
                a.source.toLowerCase().includes(sourceName.toLowerCase()) ||
                sourceName.toLowerCase().includes(a.source.toLowerCase())
              );
              return article
                ? { label: article.title.length > 50 ? article.title.slice(0, 50) + '…' : article.title, url: article.url, type: 'Article' }
                : null;
            })
            .filter(Boolean) as { label: string; url: string; type: string }[]
        : variantArticles.slice(0, 3).map(a => ({
            label: a.title.length > 50 ? a.title.slice(0, 50) + '…' : a.title,
            url: a.url,
            type: 'Article',
          }));

      const isCritical = item.variant === 'THREATS' && (articles['THREATS'] || []).length >= 2;
      return {
        variant: item.variant,
        title: item.title,
        content: item.content,
        color: VARIANT_COLORS[item.variant] || '#00C9A7',
        sources,
        critical: isCritical,
      };
    });

    cachedBrief = { data: brief, timestamp: Date.now() };
    return NextResponse.json({ brief, cached: false });

  } catch (error) {
    console.error('Brief generation error:', String(error));
    return NextResponse.json({ brief: [], error: 'Failed to generate brief' }, { status: 500 });
  }
}
