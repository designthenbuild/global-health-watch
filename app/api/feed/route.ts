import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
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
  { url: 'https://www.ihme.uw.edu/rss', source: 'IHME', region: 'Global' },
  { url: 'https://www.foodsafetynews.com/feed/', source: 'Food Safety News', region: 'Global' },
  { url: 'https://www.fiercebiotech.com/rss/xml', source: 'FierceBiotech', region: 'Global' },
  { url: 'https://www.fiercepharma.com/rss/xml', source: 'FiercePharma', region: 'Global' },
  { url: 'https://www.statnews.com/feed/', source: 'STAT News', region: 'Global' },
  { url: 'https://www.medcitynews.com/feed/', source: 'MedCity News', region: 'Global' },
  { url: 'https://www.drugdiscoverytrends.com/feed/', source: 'Drug Discovery Trends', region: 'Global' },
  { url: 'https://www.aacr.org/feed/', source: 'AACR', region: 'Global' },
  { url: 'https://www.nejm.org/rss/current.xml', source: 'NEJM', region: 'Global' },
  { url: 'https://www.nature.com/nm.rss', source: 'Nature Medicine', region: 'Global' },
  { url: 'https://www.sciencedaily.com/rss/health_medicine.xml', source: 'ScienceDaily', region: 'Global' },
  { url: 'https://endpts.com/feed/', source: 'Endpoints News', region: 'Global' },
  { url: 'https://www.labiotech.eu/feed/', source: 'Labiotech', region: 'Europe' },
  { url: 'https://www.genengnews.com/feed/', source: 'GEN', region: 'Global' },
  { url: 'https://www.fightaging.org/feed/', source: 'FightAging!', region: 'Global' },
  { url: 'https://longevity.technology/feed/', source: 'Longevity.Technology', region: 'Global' },
  { url: 'https://www.lifespan.io/feed/', source: 'Lifespan.io', region: 'Global' },
  { url: 'https://novoslabs.com/feed/', source: 'NOVOS Labs', region: 'Global' },
  { url: 'https://longevity.stanford.edu/feed/', source: 'Stanford Longevity', region: 'Global' },
  { url: 'https://www.buckinstitute.org/feed/', source: 'Buck Institute', region: 'North America' },
  { url: 'https://peterattiamd.com/feed/', source: 'Peter Attia', region: 'Global' },
  { url: 'https://www.altoslabs.com/feed/', source: 'Altos Labs', region: 'Global' },
  { url: 'https://www.calicolabs.com/feed/', source: 'Calico', region: 'North America' },
  { url: 'https://insilico.com/blog/feed/', source: 'Insilico Medicine', region: 'Global' },
  { url: 'https://www.retro.bio/feed/', source: 'Retro Bio', region: 'North America' },
  { url: 'https://www.cambrianbio.com/feed/', source: 'Cambrian Bio', region: 'North America' },
  { url: 'https://juvlabs.com/feed/', source: 'Juvenescence', region: 'Europe' },
  { url: 'https://www.maximon.com/feed/', source: 'Maximon', region: 'Europe' },
  { url: 'https://shiftbioscience.com/feed/', source: 'Shift Bioscience', region: 'Europe' },
  { url: 'https://www.fountainlife.com/blog/feed/', source: 'Fountain Life', region: 'North America' },
  { url: 'https://upgradelabs.com/blog/feed/', source: 'Upgrade Labs', region: 'North America' },
  { url: 'https://www.next-health.com/blog/feed/', source: 'Next Health', region: 'North America' },
  { url: 'https://www.cliniquelaprairie.com/feed/', source: 'Clinique La Prairie', region: 'Europe' },
  { url: 'https://www.restore.com/feed/', source: 'Restore Hyper Wellness', region: 'North America' },
  { url: 'https://www.nimh.nih.gov/news/rss/nimh-all-news.xml', source: 'NIMH', region: 'Global' },
  { url: 'https://www.thelancet.com/rssfeed/lanpsy_current.xml', source: 'The Lancet Psychiatry', region: 'Global' },
  { url: 'https://www.mentalhealthweekly.org/feed/', source: 'Mental Health Weekly', region: 'Global' },
  { url: 'https://www.mindful.org/feed/', source: 'Mindful.org', region: 'Global' },
  { url: 'https://bjsm.bmj.com/rss/current.xml', source: 'BJSM', region: 'Global' },
  { url: 'https://sportstechnologyblog.com/feed/', source: 'Sports Technology Blog', region: 'Global' },
  { url: 'https://www.sciencedaily.com/rss/mind_brain/sports_science.xml', source: 'ScienceDaily Sports', region: 'Global' },
  { url: 'https://www.whoop.com/feed/', source: 'WHOOP', region: 'North America' },
  { url: 'https://ouraring.com/blog/feed/', source: 'Oura Ring', region: 'Global' },
  { url: 'https://hypoxico.com/feed/', source: 'Hypoxico', region: 'North America' },
  { url: 'https://www.altitudecentre.com/feed/', source: 'Altitude Centre', region: 'Europe' },
  { url: 'https://www.teamexos.com/feed/', source: 'EXOS', region: 'North America' },
  { url: 'https://a16z.com/feed/', source: 'Andreessen Horowitz', region: 'Global' },
  { url: 'https://sifted.eu/feed/', source: 'Sifted', region: 'Europe' },
  { url: 'https://www.fiercehealthcare.com/feed', source: 'Fierce Healthcare', region: 'Global' },
  { url: 'https://lifescivc.com/feed/', source: 'LifeSciVC', region: 'Global' },
  { url: 'https://www.biopharmadive.com/feeds/news/', source: 'BioPharma Dive', region: 'Global' },
  { url: 'https://www.digitalhealth.net/feed/', source: 'Digital Health', region: 'Global' },
  { url: 'https://healthtechdigital.com/feed/', source: 'Health Tech Digital', region: 'Europe' },
  { url: 'https://www.mobihealthnews.com/feed', source: 'MobiHealthNews', region: 'Global' },
  { url: 'https://techcrunch.com/tag/health/feed/', source: 'TechCrunch Health', region: 'Global' },
  { url: 'https://www.frontofficesports.com/feed/', source: 'Front Office Sports', region: 'Global' },
  { url: 'https://www.sportsbusinessjournal.com/feed/', source: 'Sports Business Journal', region: 'Global' },
  { url: 'https://www.flagshippioneering.com/feed/', source: 'Flagship Pioneering', region: 'Global' },
  { url: 'https://www.apollo.vc/feed/', source: 'Apollo Health Ventures', region: 'Europe' },
  { url: 'https://fprimecapital.com/feed/', source: 'F-Prime Capital', region: 'Global' },
  { url: 'https://www.healthspancapital.vc/feed/', source: 'Healthspan Capital', region: 'Global' },
  { url: 'https://www.sapphiresport.com/feed/', source: 'Sapphire Sport', region: 'Global' },
  { url: 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/recalls/rss.xml', source: 'FDA Recalls', region: 'North America' },
  { url: 'https://www.efsa.europa.eu/en/rss/rss-all-news.xml', source: 'EFSA', region: 'Europe' },
  { url: 'https://www.health.harvard.edu/blog/feed', source: 'Harvard Health', region: 'Global' },
  { url: 'https://feeds.reuters.com/reuters/healthNews', source: 'Reuters Health', region: 'Global' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml', source: 'NYT Health', region: 'Global' },
  { url: 'https://www.bbc.co.uk/news/health/rss.xml', source: 'BBC Health', region: 'Global' },
  { url: 'https://www.thelancet.com/rssfeed/lancet_online.xml', source: 'The Lancet', region: 'Global' },
  { url: 'https://m42.ae/feed/', source: 'M42', region: 'GCC·MENA' },
  { url: 'https://www.mubadala.com/en/rss', source: 'Mubadala', region: 'GCC·MENA' },
];

const TAG_KEYWORDS: Record<string, string[]> = {
  RECALLS: ['recall', 'withdrawn', 'contamina', 'allergen', 'salmonella', 'listeria', 'mislabel', 'unsafe', 'undeclared', 'foreign material', 'e. coli', 'botulism', 'adulterat'],
  THREATS: ['outbreak', 'virus', 'disease', 'infection', 'epidemic', 'cholera', 'dengue', 'mpox', 'flu', 'measles', 'ebola', 'malaria', 'pathogen', 'surveillance', 'zoonotic', 'alert', 'avian', 'h5n1', 'pandemic'],
  DISCOVERIES: ['approved', 'approval', 'trial', 'study', 'research', 'vaccine', 'therapy', 'treatment', 'drug', 'clinical', 'phase', 'breakthrough', 'gene', 'cell therapy', 'biomarker', 'crispr', 'mrna', 'ai drug', 'insilico'],
  'MENTAL HEALTH': ['mental', 'depression', 'anxiety', 'suicide', 'psychiatric', 'behavioral', 'opioid', 'substance', 'psychedelic', 'ptsd', 'burnout', 'wellbeing', 'stress', 'mindful', 'ketamine', 'mdma'],
  LONGEVITY: ['longevity', 'aging', 'ageing', 'lifespan', 'healthspan', 'senolytic', 'rapamycin', 'nad+', 'telomere', 'rejuvenation', 'anti-aging', 'life extension', 'epigenetic', 'altos', 'calico', 'retro bio', 'reprogramming', 'senescence'],
  PERFORMANCE: ['performance', 'exercise', 'fitness', 'recovery', 'vo2', 'training', 'sport', 'muscle', 'sleep', 'cold therapy', 'heat therapy', 'biohack', 'nutrition', 'supplement', 'whoop', 'oura', 'wearable', 'altitude', 'hyperbaric', 'hbot', 'hypoxico'],
  INVESTMENTS: ['funding', 'investment', 'acquisition', 'merger', 'ipo', 'startup', 'venture', 'series a', 'series b', 'raises', 'billion', 'million', 'deal', 'market', 'a16z', 'flagship', 'mubadala', 'valuation'],
};

const SOURCE_TAGS: Record<string, string> = {
  'FightAging!': 'LONGEVITY',
  'Longevity.Technology': 'LONGEVITY',
  'Lifespan.io': 'LONGEVITY',
  'Peter Attia': 'LONGEVITY',
  'Stanford Longevity': 'LONGEVITY',
  'NOVOS Labs': 'LONGEVITY',
  'Buck Institute': 'LONGEVITY',
  'Altos Labs': 'LONGEVITY',
  'Calico': 'LONGEVITY',
  'Insilico Medicine': 'LONGEVITY',
  'Retro Bio': 'LONGEVITY',
  'Cambrian Bio': 'LONGEVITY',
  'Juvenescence': 'LONGEVITY',
  'Maximon': 'LONGEVITY',
  'Shift Bioscience': 'LONGEVITY',
  'Fountain Life': 'LONGEVITY',
  'Upgrade Labs': 'LONGEVITY',
  'Next Health': 'LONGEVITY',
  'Clinique La Prairie': 'LONGEVITY',
  'Restore Hyper Wellness': 'LONGEVITY',
  'NIMH': 'MENTAL HEALTH',
  'Mental Health Weekly': 'MENTAL HEALTH',
  'The Lancet Psychiatry': 'MENTAL HEALTH',
  'Mindful.org': 'MENTAL HEALTH',
  'BJSM': 'PERFORMANCE',
  'Sports Technology Blog': 'PERFORMANCE',
  'ScienceDaily Sports': 'PERFORMANCE',
  'WHOOP': 'PERFORMANCE',
  'Oura Ring': 'PERFORMANCE',
  'Hypoxico': 'PERFORMANCE',
  'Altitude Centre': 'PERFORMANCE',
  'EXOS': 'PERFORMANCE',
  'FierceBiotech': 'DISCOVERIES',
  'FiercePharma': 'DISCOVERIES',
  'NEJM': 'DISCOVERIES',
  'Drug Discovery Trends': 'DISCOVERIES',
  'AACR': 'DISCOVERIES',
  'Nature Medicine': 'DISCOVERIES',
  'ScienceDaily': 'DISCOVERIES',
  'Endpoints News': 'DISCOVERIES',
  'Labiotech': 'DISCOVERIES',
  'GEN': 'DISCOVERIES',
  'M42': 'DISCOVERIES',
  'ProMED': 'THREATS',
  'ECDC': 'THREATS',
  'IHME': 'THREATS',
  'FDA Recalls': 'RECALLS',
  'EFSA': 'RECALLS',
  'Food Safety News': 'RECALLS',
  'Andreessen Horowitz': 'INVESTMENTS',
  'Sifted': 'INVESTMENTS',
  'LifeSciVC': 'INVESTMENTS',
  'BioPharma Dive': 'INVESTMENTS',
  'Fierce Healthcare': 'INVESTMENTS',
  'Digital Health': 'INVESTMENTS',
  'Health Tech Digital': 'INVESTMENTS',
  'MobiHealthNews': 'INVESTMENTS',
  'TechCrunch Health': 'INVESTMENTS',
  'Front Office Sports': 'INVESTMENTS',
  'Sports Business Journal': 'INVESTMENTS',
  'Flagship Pioneering': 'INVESTMENTS',
  'Apollo Health Ventures': 'INVESTMENTS',
  'F-Prime Capital': 'INVESTMENTS',
  'Healthspan Capital': 'INVESTMENTS',
  'Sapphire Sport': 'INVESTMENTS',
  'Mubadala': 'INVESTMENTS',
};

function extractImage(item: any): string | undefined {
  try {
    if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
      return item.mediaContent.$.url;
    }
    if (item.mediaContent && item.mediaContent.url) {
      return item.mediaContent.url;
    }
    if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
      return item.mediaThumbnail.$.url;
    }
    if (item.mediaThumbnail && item.mediaThumbnail.url) {
      return item.mediaThumbnail.url;
    }
    if (item.enclosure && item.enclosure.url && item.enclosure.type && item.enclosure.type.startsWith('image')) {
      return item.enclosure.url;
    }
    const content: string = item['content:encoded'] || item.content || item.summary || '';
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) return imgMatch[1];
  } catch (e) {
    return undefined;
  }
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get('tab') || 'ALL';

  const allItems: object[] = [];
  const seen = new Set<string>();

  const feedPromises = FEEDS.map(async (feed) => {
    try {
      const parsed = await parser.parseURL(feed.url);
      const items = [];
      for (const item of parsed.items.slice(0, 8)) {
        const title = item.title || '';
        if (seen.has(title)) continue;
        seen.add(title);

        const snippet = item.contentSnippet || '';
        const tag = getTag(title, snippet, feed.source);

        if (tab !== 'ALL' && tag !== tab) continue;

        const region = getRegionFromTitle(title, feed.region);
        const image = extractImage(item);

        items.push({
          source: feed.source,
          headline: title,
          time: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Recently',
          tag,
          region,
          link: item.link || '#',
          image,
          summary: item.contentSnippet ? item.contentSnippet.slice(0, 200) : undefined,
        });
      }
      return items;
    } catch (e) {
      return [];
    }
  });

  const results = await Promise.allSettled(feedPromises);
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    }
  }

  const sorted = allItems.slice(0, 60);
  return NextResponse.json({ items: sorted });
}