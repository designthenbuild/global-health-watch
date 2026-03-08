import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 4000,
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['enclosure', 'enclosure', { keepArray: false }],
    ],
  },
});

const FEEDS = [
  { url: 'https://tools.cdc.gov/api/v2/resources/media/316422.rss', source: 'CDC', region: 'North America' },
  { url: 'https://www.who.int/rss-feeds/news-releases.xml', source: 'WHO', region: 'Global' },
  { url: 'https://www.promedmail.org/feed/', source: 'ProMED', region: 'Global' },
  { url: 'https://www.ecdc.europa.eu/en/rss.xml', source: 'ECDC', region: 'Europe' },
  { url: 'https://www.foodsafetynews.com/feed/', source: 'Food Safety News', region: 'Global' },
  { url: 'https://www.fiercebiotech.com/rss/xml', source: 'FierceBiotech', region: 'Global' },
  { url: 'https://www.statnews.com/feed/', source: 'STAT News', region: 'Global' },
  { url: 'https://www.medcitynews.com/feed/', source: 'MedCity News', region: 'Global' },
  { url: 'https://www.nejm.org/rss/current.xml', source: 'NEJM', region: 'Global' },
  { url: 'https://www.nature.com/nm.rss', source: 'Nature Medicine', region: 'Global' },
  { url: 'https://www.sciencedaily.com/rss/health_medicine.xml', source: 'ScienceDaily', region: 'Global' },
  { url: 'https://endpts.com/feed/', source: 'Endpoints News', region: 'Global' },
  { url: 'https://www.genengnews.com/feed/', source: 'GEN', region: 'Global' },
  { url: 'https://www.fightaging.org/feed/', source: 'FightAging!', region: 'Global' },
  { url: 'https://longevity.technology/feed/', source: 'Longevity.Technology', region: 'Global' },
  { url: 'https://www.lifespan.io/feed/', source: 'Lifespan.io', region: 'Global' },
  { url: 'https://novoslabs.com/feed/', source: 'NOVOS Labs', region: 'Global' },
  { url: 'https://peterattiamd.com/feed/', source: 'Peter Attia', region: 'Global' },
  { url: 'https://www.buckinstitute.org/feed/', source: 'Buck Institute', region: 'North America' },
  { url: 'https://www.nimh.nih.gov/news/rss/nimh-all-news.xml', source: 'NIMH', region: 'Global' },
  { url: 'https://www.thelancet.com/rssfeed/lanpsy_current.xml', source: 'The Lancet Psychiatry', region: 'Global' },
  { url: 'https://www.mindful.org/feed/', source: 'Mindful.org', region: 'Global' },
  { url: 'https://bjsm.bmj.com/rss/current.xml', source: 'BJSM', region: 'Global' },
  { url: 'https://www.sciencedaily.com/rss/mind_brain/sports_science.xml', source: 'ScienceDaily Sports', region: 'Global' },
  { url: 'https://ouraring.com/blog/feed/', source: 'Oura Ring', region: 'Global' },
  { url: 'https://a16z.com/feed/', source: 'Andreessen Horowitz', region: 'Global' },
  { url: 'https://sifted.eu/feed/', source: 'Sifted', region: 'Europe' },
  { url: 'https://www.fiercehealthcare.com/feed', source: 'Fierce Healthcare', region: 'Global' },
  { url: 'https://www.biopharmadive.com/feeds/news/', source: 'BioPharma Dive', region: 'Global' },
  { url: 'https://www.mobihealthnews.com/feed', source: 'MobiHealthNews', region: 'Global' },
  { url: 'https://techcrunch.com/tag/health/feed/', source: 'TechCrunch Health', region: 'Global' },
  { url: 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/recalls/rss.xml', source: 'FDA Recalls', region: 'North America' },
  { url: 'https://www.health.harvard.edu/blog/feed', source: 'Harvard Health', region: 'Global' },
  { url: 'https://feeds.reuters.com/reuters/healthNews', source: 'Reuters Health', region: 'Global' },
  { url: 'https://www.bbc.co.uk/news/health/rss.xml', source: 'BBC Health', region: 'Global' },
  { url: 'https://www.thelancet.com/rssfeed/lancet_online.xml', source: 'The Lancet', region: 'Global' },
  { url: 'https://m42.ae/feed/', source: 'M42', region: 'GCC·MENA' },
];

const TAG_KEYWORDS: Record<string, string[]> = {
  RECALLS: ['recall', 'withdrawn', 'contamina', 'allergen', 'salmonella', 'listeria', 'mislabel', 'unsafe', 'undeclared', 'foreign material', 'e. coli', 'botulism', 'adulterat'],
  THREATS: ['outbreak', 'virus', 'disease', 'infection', 'epidemic', 'cholera', 'dengue', 'mpox', 'flu', 'measles', 'ebola', 'malaria', 'pathogen', 'surveillance', 'zoonotic', 'alert', 'avian', 'h5n1', 'pandemic'],
  DISCOVERIES: ['approved', 'approval', 'trial', 'study', 'research', 'vaccine', 'therapy', 'treatment', 'drug', 'clinical', 'phase', 'breakthrough', 'gene', 'cell therapy', 'biomarker', 'crispr', 'mrna', 'ai drug', 'insilico'],
  'MENTAL HEALTH': ['mental', 'depression', 'anxiety', 'suicide', 'psychiatric', 'behavioral', 'opioid', 'substance', 'psychedelic', 'ptsd', 'burnout', 'wellbeing', 'stress', 'mindful', 'ketamine', 'mdma'],
  LONGEVITY: ['longevity', 'aging', 'ageing', 'lifespan', 'healthspan', 'senolytic', 'rapamycin', 'nad+', 'telomere', 'rejuvenation', 'anti-aging', 'life extension', 'epigenetic', 'altos', 'calico', 'retro bio', 'reprogramming', 'senescence'],
  PERFORMANCE: ['performance', 'exercise', 'fitness', 'recovery', 'vo2', 'training', 'sport', 'muscle', 'sleep', 'cold therapy', 'heat therapy', 'biohack', 'nutrition', 'supplement', 'whoop', 'oura', 'wearable', 'altitude', 'hyperbaric', 'hbot'],
  INVESTMENTS: ['funding', 'investment', 'acquisition', 'merger', 'ipo', 'startup', 'venture', 'series a', 'series b', 'raises', 'billion', 'million', 'deal', 'market', 'a16z', 'flagship', 'mubadala', 'valuation'],
};

const SOURCE_TAGS: Record<string, string> = {
  'FightAging!': 'LONGEVITY', 'Longevity.Technology': 'LONGEVITY', 'Lifespan.io': 'LONGEVITY',
  'Peter Attia': 'LONGEVITY', 'NOVOS Labs': 'LONGEVITY', 'Buck Institute': 'LONGEVITY',
  'NIMH': 'MENTAL HEALTH', 'Mental Health Weekly': 'MENTAL HEALTH',
  'The Lancet Psychiatry': 'MENTAL HEALTH', 'Mindful.org': 'MENTAL HEALTH',
  'BJSM': 'PERFORMANCE', 'ScienceDaily Sports': 'PERFORMANCE', 'Oura Ring': 'PERFORMANCE',
  'FierceBiotech': 'DISCOVERIES', 'NEJM': 'DISCOVERIES', 'Nature Medicine': 'DISCOVERIES',
  'ScienceDaily': 'DISCOVERIES', 'Endpoints News': 'DISCOVERIES', 'GEN': 'DISCOVERIES',
  'M42': 'DISCOVERIES', 'The Lancet': 'DISCOVERIES',
  'ProMED': 'THREATS', 'ECDC': 'THREATS',
  'FDA Recalls': 'RECALLS', 'Food Safety News': 'RECALLS',
  'Andreessen Horowitz': 'INVESTMENTS', 'Sifted': 'INVESTMENTS',
  'BioPharma Dive': 'INVESTMENTS', 'Fierce Healthcare': 'INVESTMENTS',
  'MobiHealthNews': 'INVESTMENTS', 'TechCrunch Health': 'INVESTMENTS',
};

function formatDate(pubDate: string | undefined): string {
  if (!pubDate) return '';
  try {
    const d = new Date(pubDate);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${Math.floor(diffHrs)}h ago`;
    if (diffDays < 2) return 'Yesterday';
    if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
    // Older: show "Mar 6" or "Mar 6, 2025" if different year
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const sameYear = d.getFullYear() === now.getFullYear();
    return sameYear
      ? `${months[d.getMonth()]} ${d.getDate()}`
      : `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  } catch { return ''; }
}

function extractImage(item: any): string | undefined {
  try {
    if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) return item.mediaContent.$.url;
    if (item.mediaContent && item.mediaContent.url) return item.mediaContent.url;
    if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) return item.mediaThumbnail.$.url;
    if (item.mediaThumbnail && item.mediaThumbnail.url) return item.mediaThumbnail.url;
    if (item.enclosure && item.enclosure.url && item.enclosure.type && item.enclosure.type.startsWith('image')) return item.enclosure.url;
    const content: string = item['content:encoded'] || item.content || item.summary || '';
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) return imgMatch[1];
  } catch (e) { return undefined; }
  return undefined;
}

function getTag(title: string, snippet: string, source: string): string {
  if (SOURCE_TAGS[source]) return SOURCE_TAGS[source];
  const text = (title + ' ' + snippet).toLowerCase();
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some((k: string) => text.includes(k))) return tag;
  }
  return 'UPDATE';
}

function getRegionFromTitle(title: string, defaultRegion: string): string {
  const t = title.toLowerCase();
  if (t.includes('uae') || t.includes('dubai') || t.includes('saudi') || t.includes('gcc') || t.includes('gulf') || t.includes('mena') || t.includes('qatar') || t.includes('kuwait') || t.includes('abu dhabi') || t.includes('riyadh')) return 'GCC·MENA';
  if (t.includes('europe') || t.includes('eu ') || t.includes('uk ') || t.includes('britain') || t.includes('france') || t.includes('germany') || t.includes('italy') || t.includes('switzerland')) return 'Europe';
  if (t.includes('us ') || t.includes('usa') || t.includes('america') || t.includes('fda') || t.includes('cdc') || t.includes('nih')) return 'North America';
  if (t.includes('china') || t.includes('asia') || t.includes('india') || t.includes('japan') || t.includes('korea') || t.includes('singapore')) return 'SE Asia';
  if (t.includes('africa') || t.includes('nigeria') || t.includes('kenya') || t.includes('ethiopia') || t.includes('south africa')) return 'Africa';
  if (t.includes('brazil') || t.includes('latam') || t.includes('latin america') || t.includes('colombia')) return 'LATAM';
  return defaultRegion;
}

// ── 30-minute in-memory cache ─────────────────────────────────────────────
const cache: Map<string, { items: object[]; ts: number }> = new Map();
const CACHE_TTL = 30 * 60 * 1000;

async function fetchFeedSafe(feed: { url: string; source: string; region: string }, tab: string): Promise<object[]> {
  try {
    const parsed = await Promise.race([
      parser.parseURL(feed.url),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 4500)),
    ]);
    const items = [];
    const seen = new Set<string>();
    for (const item of (parsed as any).items.slice(0, 8)) {
      const title = item.title || '';
      if (seen.has(title)) continue;
      seen.add(title);
      const snippet = item.contentSnippet || '';
      const tag = getTag(title, snippet, feed.source);
      if (tab !== 'ALL' && tag !== tab) continue;
      const region = getRegionFromTitle(title, feed.region);
      const image = extractImage(item);
      const time = formatDate(item.pubDate || item.isoDate);
      items.push({
        source: feed.source,
        headline: title,
        time,
        tag,
        region,
        link: item.link || '#',
        image,
        summary: item.contentSnippet ? item.contentSnippet.slice(0, 200) : undefined,
      });
    }
    return items;
  } catch { return []; }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get('tab') || 'ALL';

  const cached = cache.get(tab);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({ items: cached.items, cached: true });
  }

  const results = await Promise.allSettled(FEEDS.map(feed => fetchFeedSafe(feed, tab)));

  const allItems: object[] = [];
  const seenHeadlines = new Set<string>();
  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const item of result.value) {
        const h = (item as any).headline;
        if (!seenHeadlines.has(h)) {
          seenHeadlines.add(h);
          allItems.push(item);
        }
      }
    }
  }

  // Sort by recency — items with real dates first
  allItems.sort((a: any, b: any) => {
    const order = ['Just now', 'h ago', 'Yesterday', 'd ago'];
    const aRecent = order.some(o => a.time?.includes(o));
    const bRecent = order.some(o => b.time?.includes(o));
    if (aRecent && !bRecent) return -1;
    if (!aRecent && bRecent) return 1;
    return 0;
  });

  const sorted = allItems.slice(0, 60);
  cache.set(tab, { items: sorted, ts: Date.now() });

  return NextResponse.json({ items: sorted });
}