import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

const FEEDS = [
  // === THREATS / OUTBREAKS ===
  { url: 'https://tools.cdc.gov/api/v2/resources/media/316422.rss', source: 'CDC', region: 'North America' },
  { url: 'https://www.who.int/rss-feeds/news-releases.xml', source: 'WHO', region: 'Global' },
  { url: 'https://www.promedmail.org/feed/', source: 'ProMED', region: 'Global' },
  { url: 'https://www.ecdc.europa.eu/en/rss.xml', source: 'ECDC', region: 'Europe' },
  { url: 'https://www.ihme.uw.edu/rss', source: 'IHME', region: 'Global' },
  { url: 'https://www.foodsafetynews.com/feed/', source: 'Food Safety News', region: 'Global' },

  // === DISCOVERIES / BIOTECH ===
  { url: 'https://www.fiercebiotech.com/rss/xml', source: 'FierceBiotech', region: 'Global' },
  { url: 'https://www.fiercepharma.com/rss/xml', source: 'FiercePharma', region: 'Global' },
  { url: 'https://www.statnews.com/feed/', source: 'STAT News', region: 'Global' },
  { url: 'https://www.medcitynews.com/feed/', source: 'MedCity News', region: 'Global' },
  { url: 'https://www.drugdiscoverytrends.com/feed/', source: 'Drug Discovery Trends', region: 'Global' },
  { url: 'https://www.aacr.org/feed/', source: 'AACR', region: 'Global' },
  { url: 'https://www.nejm.org/rss/current.xml', source: 'NEJM', region: 'Global' },
  { url: 'https://www.nature.com/nm.rss', source: 'Nature Medicine', region: 'Global' },
  { url: 'https://www.sciencedaily.com/rss/health_medicine.xml', source: 'ScienceDaily', region: 'Global' },

  // === LONGEVITY — research ===
  { url: 'https://www.fightaging.org/feed/', source: 'FightAging!', region: 'Global' },
  { url: 'https://longevity.technology/feed/', source: 'Longevity.Technology', region: 'Global' },
  { url: 'https://www.lifespan.io/feed/', source: 'Lifespan.io', region: 'Global' },
  { url: 'https://novoslabs.com/feed/', source: 'NOVOS Labs', region: 'Global' },
  { url: 'https://longevity.stanford.edu/feed/', source: 'Stanford Longevity', region: 'Global' },
  { url: 'https://www.buckinstitute.org/feed/', source: 'Buck Institute', region: 'North America' },

  // === LONGEVITY — biotech companies (from CSV) ===
  { url: 'https://www.altoslabs.com/feed/', source: 'Altos Labs', region: 'Global' },
  { url: 'https://www.calicolabs.com/feed/', source: 'Calico', region: 'North America' },
  { url: 'https://insilico.com/blog/feed/', source: 'Insilico Medicine', region: 'Global' },
  { url: 'https://www.retro.bio/feed/', source: 'Retro Bio', region: 'North America' },
  { url: 'https://www.cambrianbio.com/feed/', source: 'Cambrian Bio', region: 'North America' },
  { url: 'https://juvlabs.com/feed/', source: 'Juvenescence', region: 'Europe' },
  { url: 'https://www.maximon.com/feed/', source: 'Maximon', region: 'Europe' },
  { url: 'https://shiftbioscience.com/feed/', source: 'Shift Bioscience', region: 'Europe' },

  // === LONGEVITY — clinics & centers (from CSV) ===
  { url: 'https://www.fountainlife.com/blog/feed/', source: 'Fountain Life', region: 'North America' },
  { url: 'https://upgradelabs.com/blog/feed/', source: 'Upgrade Labs', region: 'North America' },
  { url: 'https://www.next-health.com/blog/feed/', source: 'Next Health', region: 'North America' },
  { url: 'https://www.cliniquelaprairie.com/feed/', source: 'Clinique La Prairie', region: 'Europe' },
  { url: 'https://www.restore.com/feed/', source: 'Restore Hyper Wellness', region: 'North America' },

  // === MENTAL HEALTH ===
  { url: 'https://www.nimh.nih.gov/news/rss/nimh-all-news.xml', source: 'NIMH', region: 'Global' },
  { url: 'https://www.thelancet.com/rssfeed/lanpsy_current.xml', source: 'The Lancet Psychiatry', region: 'Global' },
  { url: 'https://www.mentalhealthweekly.org/feed/', source: 'Mental Health Weekly', region: 'Global' },
  { url: 'https://www.mindful.org/feed/', source: 'Mindful.org', region: 'Global' },

  // === PERFORMANCE ===
  { url: 'https://bjsm.bmj.com/rss/current.xml', source: 'BJSM', region: 'Global' },
  { url: 'https://sportstechnologyblog.com/feed/', source: 'Sports Technology Blog', region: 'Global' },
  { url: 'https://www.sciencedaily.com/rss/mind_brain/sports_science.xml', source: 'ScienceDaily Sports', region: 'Global' },
  { url: 'https://www.whoop.com/feed/', source: 'WHOOP', region: 'North America' },
  { url: 'https://ouraring.com/blog/feed/', source: 'Oura Ring', region: 'Global' },

  // === PERFORMANCE — altitude & hyperbaric (from CSV) ===
  { url: 'https://hypoxico.com/feed/', source: 'Hypoxico', region: 'North America' },
  { url: 'https://www.altitudecentre.com/feed/', source: 'Altitude Centre', region: 'Europe' },
  { url: 'https://www.teamexos.com/feed/', source: 'EXOS', region: 'North America' },

  // === ECONOMY / INVESTMENT ===
  { url: 'https://a16z.com/feed/', source: 'Andreessen Horowitz', region: 'Global' },
  { url: 'https://sifted.eu/feed/', source: 'Sifted', region: 'Europe' },
  { url: 'https://www.fiercehealthcare.com/feed', source: 'Fierce Healthcare', region: 'Global' },
  { url: 'https://lifescivc.com/feed/', source: 'LifeSciVC', region: 'Global' },
  { url: 'https://www.biopharmadive.com/feeds/news/', source: 'BioPharma Dive', region: 'Global' },
  { url: 'https://www.digitalhealth.net/feed/', source: 'Digital Health', region: 'Global' },
  { url: 'https://healthtechdigital.com/feed/', source: 'Health Tech Digital', region: 'Europe' },
  { url: 'https://www.mobihealthnews.com/feed', source: 'MobiHealthNews', region: 'Global' },

  // === ECONOMY — investors (from CSV) ===
  { url: 'https://www.flagshippioneering.com/feed/', source: 'Flagship Pioneering', region: 'Global' },
  { url: 'https://www.apollo.vc/feed/', source: 'Apollo Health Ventures', region: 'Europe' },
  { url: 'https://fprimecapital.com/feed/', source: 'F-Prime Capital', region: 'Global' },
  { url: 'https://www.healthspancapital.vc/feed/', source: 'Healthspan Capital', region: 'Global' },
  { url: 'https://www.sapphiresport.com/feed/', source: 'Sapphire Sport', region: 'Global' },

  // === GENERAL HEALTH ===
  { url: 'https://www.health.harvard.edu/blog/feed', source: 'Harvard Health', region: 'Global' },
  { url: 'https://feeds.reuters.com/reuters/healthNews', source: 'Reuters Health', region: 'Global' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml', source: 'NYT Health', region: 'Global' },
  { url: 'https://www.bbc.co.uk/news/health/rss.xml', source: 'BBC Health', region: 'Global' },
  { url: 'https://www.thelancet.com/rssfeed/lancet_online.xml', source: 'The Lancet', region: 'Global' },

  // === GCC / MENA ===
  { url: 'https://m42.ae/feed/', source: 'M42', region: 'GCC·MENA' },
  { url: 'https://www.mubadala.com/en/rss', source: 'Mubadala', region: 'GCC·MENA' },
];

const TAG_KEYWORDS: Record<string, string[]> = {
  OUTBREAKS: ['outbreak', 'virus', 'disease', 'infection', 'epidemic', 'cholera', 'dengue', 'mpox', 'flu', 'measles', 'ebola', 'malaria', 'pathogen', 'surveillance', 'zoonotic', 'promed', 'alert', 'food safety', 'contamina', 'recall'],
  DISCOVERIES: ['approved', 'approval', 'trial', 'study', 'research', 'vaccine', 'therapy', 'treatment', 'drug', 'clinical', 'phase', 'breakthrough', 'gene', 'cell therapy', 'biomarker', 'crispr', 'mrna', 'ai drug', 'insilico'],
  'MENTAL HEALTH': ['mental', 'depression', 'anxiety', 'suicide', 'psychiatric', 'behavioral', 'opioid', 'substance', 'psychedelic', 'ptsd', 'burnout', 'wellbeing', 'stress', 'mindful', 'ketamine', 'mdma'],
  LONGEVITY: ['longevity', 'aging', 'ageing', 'lifespan', 'healthspan', 'senolytic', 'rapamycin', 'nad+', 'telomere', 'rejuvenation', 'anti-aging', 'life extension', 'epigenetic', 'altos', 'calico', 'retro bio', 'reprogramming', 'senescence'],
  PERFORMANCE: ['performance', 'exercise', 'fitness', 'recovery', 'vo2', 'training', 'sport', 'muscle', 'sleep', 'cold therapy', 'heat therapy', 'biohack', 'nutrition', 'supplement', 'whoop', 'oura', 'wearable', 'altitude', 'hyperbaric', 'hbot', 'hypoxico'],
  ECONOMY: ['funding', 'investment', 'acquisition', 'merger', 'ipo', 'startup', 'biotech stock', 'venture', 'series a', 'series b', 'raises', 'billion', 'million', 'deal', 'market', 'a16z', 'flagship', 'mubadala', 'valuation', 'exits'],
  RECALLS: ['recall', 'alert', 'warning', 'contamina', 'allergen', 'salmonella', 'listeria', 'mislabel', 'unsafe', 'withdrawn'],
};

const SOURCE_TAGS: Record<string, string> = {
  // Longevity
  'FightAging!': 'LONGEVITY',
  'Longevity.Technology': 'LONGEVITY',
  'Lifespan.io': 'LONGEVITY',
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
  // Mental Health
  'NIMH': 'MENTAL HEALTH',
  'Mental Health Weekly': 'MENTAL HEALTH',
  'The Lancet Psychiatry': 'MENTAL HEALTH',
  'Mindful.org': 'MENTAL HEALTH',
  // Performance
  'BJSM': 'PERFORMANCE',
  'Sports Technology Blog': 'PERFORMANCE',
  'ScienceDaily Sports': 'PERFORMANCE',
  'WHOOP': 'PERFORMANCE',
  'Oura Ring': 'PERFORMANCE',
  'Hypoxico': 'PERFORMANCE',
  'Altitude Centre': 'PERFORMANCE',
  'EXOS': 'PERFORMANCE',
  // Discoveries
  'FierceBiotech': 'DISCOVERIES',
  'FiercePharma': 'DISCOVERIES',
  'NEJM': 'DISCOVERIES',
  'Drug Discovery Trends': 'DISCOVERIES',
  'AACR': 'DISCOVERIES',
  'Nature Medicine': 'DISCOVERIES',
  'ScienceDaily': 'DISCOVERIES',
  // Outbreaks
  'ProMED': 'OUTBREAKS',
  'ECDC': 'OUTBREAKS',
  'IHME': 'OUTBREAKS',
  'Food Safety News': 'OUTBREAKS',
  // Economy
  'Andreessen Horowitz': 'ECONOMY',
  'Sifted': 'ECONOMY',
  'LifeSciVC': 'ECONOMY',
  'BioPharma Dive': 'ECONOMY',
  'Fierce Healthcare': 'ECONOMY',
  'Digital Health': 'ECONOMY',
  'Health Tech Digital': 'ECONOMY',
  'MobiHealthNews': 'ECONOMY',
  'Flagship Pioneering': 'ECONOMY',
  'Apollo Health Ventures': 'ECONOMY',
  'F-Prime Capital': 'ECONOMY',
  'Healthspan Capital': 'ECONOMY',
  'Sapphire Sport': 'ECONOMY',
  'Mubadala': 'ECONOMY',
};

function getTag(title: string, snippet: string, source: string): string {
  if (SOURCE_TAGS[source]) return SOURCE_TAGS[source];
  const text = (title + ' ' + snippet).toLowerCase();
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some(k => text.includes(k))) return tag;
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

        items.push({
          source: feed.source,
          headline: title,
          time: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Recently',
          tag,
          region,
          link: item.link || '#',
        });
      }
      return items;
    } catch {
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