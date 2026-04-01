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
  // ── HEALTH AUTHORITIES ──────────────────────────────────────────────────
  { url: 'https://tools.cdc.gov/api/v2/resources/media/316422.rss', source: 'CDC', region: 'North America' },
  { url: 'https://www.who.int/rss-feeds/news-releases.xml', source: 'WHO', region: 'Global' },
  { url: 'https://www.promedmail.org/feed/', source: 'ProMED', region: 'Global' },
  { url: 'https://www.ecdc.europa.eu/en/rss.xml', source: 'ECDC', region: 'Europe' },
  { url: 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/recalls/rss.xml', source: 'FDA Recalls', region: 'North America' },
  { url: 'https://www.foodsafetynews.com/feed/', source: 'Food Safety News', region: 'Global' },

  // ── MAJOR HEALTH NEWS ───────────────────────────────────────────────────
  { url: 'https://www.statnews.com/feed/', source: 'STAT News', region: 'Global' },
  { url: 'https://www.medcitynews.com/feed/', source: 'MedCity News', region: 'Global' },
  { url: 'https://endpts.com/feed/', source: 'Endpoints News', region: 'Global' },
  { url: 'https://www.biopharmadive.com/feeds/news/', source: 'BioPharma Dive', region: 'Global' },
  { url: 'https://www.mobihealthnews.com/feed', source: 'MobiHealthNews', region: 'Global' },
  { url: 'https://www.fiercebiotech.com/rss/xml', source: 'FierceBiotech', region: 'Global' },
  { url: 'https://www.fiercehealthcare.com/feed', source: 'Fierce Healthcare', region: 'Global' },
  { url: 'https://www.fiercepharma.com/rss/xml', source: 'FiercePharma', region: 'Global' },
  { url: 'https://www.drugdiscoverytrends.com/feed/', source: 'Drug Discovery Trends', region: 'Global' },
  { url: 'https://www.healthcarefinancenews.com/feed', source: 'Healthcare Finance News', region: 'Global' },
  { url: 'https://www.healthcaredive.com/feeds/news/', source: 'Healthcare Dive', region: 'Global' },
  { url: 'https://www.beckershospitalreview.com/rss/news-feed.xml', source: 'Becker\'s Hospital Review', region: 'North America' },

  // ── JOURNALS & RESEARCH ─────────────────────────────────────────────────
  { url: 'https://www.nejm.org/rss/current.xml', source: 'NEJM', region: 'Global' },
  { url: 'https://www.nature.com/nm.rss', source: 'Nature Medicine', region: 'Global' },
  { url: 'https://www.thelancet.com/rssfeed/lancet_online.xml', source: 'The Lancet', region: 'Global' },
  { url: 'https://www.thelancet.com/rssfeed/lanpsy_current.xml', source: 'The Lancet Psychiatry', region: 'Global' },
  { url: 'https://www.sciencedaily.com/rss/health_medicine.xml', source: 'ScienceDaily', region: 'Global' },
  { url: 'https://www.sciencedaily.com/rss/mind_brain/sports_science.xml', source: 'ScienceDaily Sports', region: 'Global' },
  { url: 'https://www.genengnews.com/feed/', source: 'GEN', region: 'Global' },
  { url: 'https://www.health.harvard.edu/blog/feed', source: 'Harvard Health', region: 'Global' },
  { url: 'https://bjsm.bmj.com/rss/current.xml', source: 'BJSM', region: 'Global' },
  { url: 'https://www.bmj.com/rss/current.xml', source: 'BMJ', region: 'Global' },
  { url: 'https://jamanetwork.com/rss/site_3/67.xml', source: 'JAMA', region: 'Global' },
  { url: 'https://www.cell.com/cell/current.rss', source: 'Cell', region: 'Global' },

  // ── GENERAL HEALTH & WELLNESS ───────────────────────────────────────────
  { url: 'https://www.menshealth.com/rss/all.xml', source: 'Men\'s Health', region: 'Global' },
  { url: 'https://www.womenshealthmag.com/rss/all.xml', source: 'Women\'s Health', region: 'Global' },
  { url: 'https://www.prevention.com/rss/all.xml', source: 'Prevention', region: 'Global' },
  { url: 'https://www.health.com/rss', source: 'Health.com', region: 'Global' },
  { url: 'https://www.verywellhealth.com/rss', source: 'Verywell Health', region: 'Global' },
  { url: 'https://examine.com/feed/', source: 'Examine.com', region: 'Global' },
  { url: 'https://www.healthline.com/rss/health-news', source: 'Healthline', region: 'Global' },

  // ── TECH & SCIENCE ──────────────────────────────────────────────────────
  { url: 'https://techcrunch.com/tag/health/feed/', source: 'TechCrunch Health', region: 'Global' },
  { url: 'https://www.wired.com/feed/category/science/latest/rss', source: 'Wired Science', region: 'Global' },
  { url: 'https://www.theverge.com/rss/health/index.xml', source: 'The Verge Health', region: 'Global' },
  { url: 'https://www.inverse.com/rss', source: 'Inverse', region: 'Global' },
  { url: 'https://www.newscientist.com/feed/home/', source: 'New Scientist', region: 'Europe' },
  { url: 'https://arstechnica.com/science/feed/', source: 'Ars Technica Science', region: 'Global' },
  { url: 'https://www.technologyreview.com/feed/', source: 'MIT Tech Review', region: 'Global' },

  // ── SPORT & PERFORMANCE ─────────────────────────────────────────────────
  { url: 'https://www.outsideonline.com/feed/', source: 'Outside Online', region: 'Global' },
  { url: 'https://www.runnersworld.com/rss/all.xml', source: 'Runner\'s World', region: 'Global' },
  { url: 'https://www.bicycling.com/rss/all.xml', source: 'Bicycling', region: 'Global' },
  { url: 'https://www.mensjournal.com/rss', source: 'Men\'s Journal', region: 'Global' },
  { url: 'https://www.shape.com/rss/all.xml', source: 'Shape', region: 'Global' },
  { url: 'https://www.frontofficesports.com/feed/', source: 'Front Office Sports', region: 'Global' },
  { url: 'https://www.sportsbusinessjournal.com/feed/', source: 'Sports Business Journal', region: 'Global' },

  // ── LONGEVITY ───────────────────────────────────────────────────────────
  { url: 'https://www.fightaging.org/feed/', source: 'FightAging!', region: 'Global' },
  { url: 'https://longevity.technology/feed/', source: 'Longevity.Technology', region: 'Global' },
  { url: 'https://www.lifespan.io/feed/', source: 'Lifespan.io', region: 'Global' },
  { url: 'https://novoslabs.com/feed/', source: 'NOVOS Labs', region: 'Global' },
  { url: 'https://peterattiamd.com/feed/', source: 'Peter Attia', region: 'Global' },
  { url: 'https://www.buckinstitute.org/feed/', source: 'Buck Institute', region: 'North America' },
  { url: 'https://www.altoslabs.com/feed/', source: 'Altos Labs', region: 'Global' },
  { url: 'https://insilico.com/blog/feed/', source: 'Insilico Medicine', region: 'Global' },
  { url: 'https://juvlabs.com/feed/', source: 'Juvenescence', region: 'Europe' },
  { url: 'https://www.maximon.com/feed/', source: 'Maximon', region: 'Europe' },
  { url: 'https://shiftbioscience.com/feed/', source: 'Shift Bioscience', region: 'Europe' },
  { url: 'https://www.cambrianbio.com/feed/', source: 'Cambrian Bio', region: 'North America' },
  { url: 'https://www.fountainlife.com/blog/feed/', source: 'Fountain Life', region: 'North America' },
  { url: 'https://longevity.stanford.edu/feed/', source: 'Stanford Longevity', region: 'North America' },

  // ── PERFORMANCE & WEARABLES ─────────────────────────────────────────────
  { url: 'https://ouraring.com/blog/feed/', source: 'Oura Ring', region: 'Global' },
  { url: 'https://www.whoop.com/feed/', source: 'WHOOP', region: 'North America' },
  { url: 'https://www.teamexos.com/feed/', source: 'EXOS', region: 'North America' },
  { url: 'https://hypoxico.com/feed/', source: 'Hypoxico', region: 'North America' },
  { url: 'https://www.altitudecentre.com/feed/', source: 'Altitude Centre', region: 'Europe' },
  { url: 'https://tim.blog/feed/', source: 'Tim Ferriss', region: 'Global' },

  // ── MENTAL HEALTH ───────────────────────────────────────────────────────
  { url: 'https://www.nimh.nih.gov/news/rss/nimh-all-news.xml', source: 'NIMH', region: 'Global' },
  { url: 'https://www.mindful.org/feed/', source: 'Mindful.org', region: 'Global' },
  { url: 'https://www.psychiatrictimes.com/rss', source: 'Psychiatric Times', region: 'Global' },
  { url: 'https://www.mentalhealthweekly.org/feed/', source: 'Mental Health Weekly', region: 'Global' },
  { url: 'https://psychcentral.com/feed/', source: 'PsychCentral', region: 'Global' },

  // ── INVESTMENTS & HEALTH TECH ───────────────────────────────────────────
  { url: 'https://a16z.com/feed/', source: 'Andreessen Horowitz', region: 'Global' },
  { url: 'https://sifted.eu/feed/', source: 'Sifted', region: 'Europe' },
  { url: 'https://www.flagshippioneering.com/feed/', source: 'Flagship Pioneering', region: 'Global' },
  { url: 'https://www.apollo.vc/feed/', source: 'Apollo Health Ventures', region: 'Europe' },
  { url: 'https://fprimecapital.com/feed/', source: 'F-Prime Capital', region: 'Global' },
  { url: 'https://www.healthspancapital.vc/feed/', source: 'Healthspan Capital', region: 'Global' },
  { url: 'https://www.sapphiresport.com/feed/', source: 'Sapphire Sport', region: 'Global' },
  { url: 'https://rockhealth.com/feed/', source: 'Rock Health', region: 'North America' },
  { url: 'https://lifescivc.com/feed/', source: 'LifeSciVC', region: 'Global' },
  { url: 'https://www.digitalhealth.net/feed/', source: 'Digital Health', region: 'Europe' },
  { url: 'https://healthtechdigital.com/feed/', source: 'Health Tech Digital', region: 'Europe' },

  // ── GCC & MENA ──────────────────────────────────────────────────────────
  { url: 'https://m42.ae/feed/', source: 'M42', region: 'GCC·MENA' },
  { url: 'https://www.mubadala.com/en/rss', source: 'Mubadala', region: 'GCC·MENA' },
  { url: 'https://gulfnews.com/rss/health', source: 'Gulf News Health', region: 'GCC·MENA' },
  { url: 'https://www.khaleejtimes.com/rss/health', source: 'Khaleej Times Health', region: 'GCC·MENA' },
  { url: 'https://www.arabnews.com/rss.xml?pid=740', source: 'Arab News Health', region: 'GCC·MENA' },
  { url: 'https://www.thenationalnews.com/rss/health', source: 'The National Health', region: 'GCC·MENA' },

  // ── GLOBAL MEDIA ────────────────────────────────────────────────────────
  { url: 'https://feeds.reuters.com/reuters/healthNews', source: 'Reuters Health', region: 'Global' },
  { url: 'https://www.bbc.co.uk/news/health/rss.xml', source: 'BBC Health', region: 'Global' },
  { url: 'https://www.theguardian.com/society/health/rss', source: 'The Guardian Health', region: 'Europe' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml', source: 'NYT Health', region: 'Global' },
  { url: 'https://www.wsj.com/xml/rss/3_7014.xml', source: 'WSJ Health', region: 'Global' },
  { url: 'https://www.ft.com/rss/home/health', source: 'FT Health', region: 'Global' },
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
  'Altos Labs': 'LONGEVITY', 'Insilico Medicine': 'LONGEVITY', 'Juvenescence': 'LONGEVITY',
  'Maximon': 'LONGEVITY', 'Shift Bioscience': 'LONGEVITY', 'Cambrian Bio': 'LONGEVITY',
  'Fountain Life': 'LONGEVITY', 'Stanford Longevity': 'LONGEVITY',
  'NIMH': 'MENTAL HEALTH', 'Mental Health Weekly': 'MENTAL HEALTH',
  'The Lancet Psychiatry': 'MENTAL HEALTH', 'Mindful.org': 'MENTAL HEALTH',
  'Psychiatric Times': 'MENTAL HEALTH', 'PsychCentral': 'MENTAL HEALTH',
  'BJSM': 'PERFORMANCE', 'ScienceDaily Sports': 'PERFORMANCE', 'Oura Ring': 'PERFORMANCE',
  'WHOOP': 'PERFORMANCE', 'EXOS': 'PERFORMANCE', 'Hypoxico': 'PERFORMANCE',
  'Altitude Centre': 'PERFORMANCE', 'Tim Ferriss': 'PERFORMANCE',
  'Outside Online': 'PERFORMANCE', 'Runner\'s World': 'PERFORMANCE',
  'Bicycling': 'PERFORMANCE', 'Men\'s Journal': 'PERFORMANCE', 'Shape': 'PERFORMANCE',
  'Front Office Sports': 'INVESTMENTS', 'Sports Business Journal': 'INVESTMENTS',
  'FierceBiotech': 'DISCOVERIES', 'NEJM': 'DISCOVERIES', 'Nature Medicine': 'DISCOVERIES',
  'ScienceDaily': 'DISCOVERIES', 'Endpoints News': 'DISCOVERIES', 'GEN': 'DISCOVERIES',
  'M42': 'DISCOVERIES', 'The Lancet': 'DISCOVERIES', 'BMJ': 'DISCOVERIES',
  'JAMA': 'DISCOVERIES', 'Cell': 'DISCOVERIES', 'Drug Discovery Trends': 'DISCOVERIES',
  'ProMED': 'THREATS', 'ECDC': 'THREATS',
  'FDA Recalls': 'RECALLS', 'Food Safety News': 'RECALLS',
  'Andreessen Horowitz': 'INVESTMENTS', 'Sifted': 'INVESTMENTS',
  'BioPharma Dive': 'INVESTMENTS', 'Fierce Healthcare': 'INVESTMENTS',
  'MobiHealthNews': 'INVESTMENTS', 'TechCrunch Health': 'INVESTMENTS',
  'Flagship Pioneering': 'INVESTMENTS', 'Apollo Health Ventures': 'INVESTMENTS',
  'F-Prime Capital': 'INVESTMENTS', 'Healthspan Capital': 'INVESTMENTS',
  'Sapphire Sport': 'INVESTMENTS', 'Rock Health': 'INVESTMENTS',
  'LifeSciVC': 'INVESTMENTS', 'Digital Health': 'INVESTMENTS',
  'Health Tech Digital': 'INVESTMENTS', 'Mubadala': 'INVESTMENTS',
  'Gulf News Health': 'GCC·MENA', 'Khaleej Times Health': 'GCC·MENA',
  'Arab News Health': 'GCC·MENA', 'The National Health': 'GCC·MENA',
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

  allItems.sort((a: any, b: any) => {
    const order = ['Just now', 'h ago', 'Yesterday', 'd ago'];
    const aRecent = order.some(o => a.time?.includes(o));
    const bRecent = order.some(o => b.time?.includes(o));
    if (aRecent && !bRecent) return -1;
    if (!aRecent && bRecent) return 1;
    return 0;
  });

  const sorted = allItems.slice(0, 100);
  cache.set(tab, { items: sorted, ts: Date.now() });

  return NextResponse.json({ items: sorted });
}