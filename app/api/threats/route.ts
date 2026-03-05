import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

const FEEDS = [
  { url: 'https://www.who.int/rss-feeds/news-releases.xml', source: 'WHO' },
  { url: 'https://tools.cdc.gov/api/v2/resources/media/316422.rss', source: 'CDC' },
];

const THREAT_KEYWORDS = [
  'outbreak', 'virus', 'disease', 'infection', 'epidemic', 'pandemic',
  'alert', 'warning', 'confirmed cases', 'deaths', 'flu', 'cholera',
  'dengue', 'mpox', 'measles', 'tuberculosis', 'malaria', 'ebola',
  'coronavirus', 'avian', 'zika', 'yellow fever', 'typhoid', 'recall',
  'contamina', 'allergen', 'salmonella', 'listeria'
];

const COUNTRY_COORDS: Record<string, [number, number]> = {
  'united states': [-95.7129, 37.0902],
  'usa': [-95.7129, 37.0902],
  'u.s.': [-95.7129, 37.0902],
  'india': [78.9629, 20.5937],
  'china': [104.1954, 35.8617],
  'brazil': [-51.9253, -14.2350],
  'nigeria': [8.6753, 9.0820],
  'congo': [23.6566, -2.8770],
  'saudi arabia': [45.0792, 23.8859],
  'uae': [53.8478, 23.4241],
  'dubai': [55.2708, 25.2048],
  'uk': [-3.4359, 55.3781],
  'united kingdom': [-3.4359, 55.3781],
  'france': [2.2137, 46.2276],
  'germany': [10.4515, 51.1657],
  'italy': [12.5674, 41.8719],
  'spain': [-3.7492, 40.4637],
  'pakistan': [69.3451, 30.3753],
  'bangladesh': [90.3563, 23.6850],
  'indonesia': [113.9213, -0.7893],
  'philippines': [121.7740, 12.8797],
  'mexico': [-102.5528, 23.6345],
  'south africa': [22.9375, -30.5595],
  'kenya': [37.9062, -0.0236],
  'ethiopia': [40.4897, 9.1450],
  'sudan': [30.2176, 15.5007],
  'somalia': [46.1996, 5.1521],
  'ukraine': [31.1656, 48.3794],
  'russia': [105.3188, 61.5240],
  'japan': [138.2529, 36.2048],
  'south korea': [127.7669, 35.9078],
  'thailand': [100.9925, 15.8700],
  'vietnam': [108.2772, 14.0583],
  'malaysia': [109.6976, 4.2105],
  'cambodia': [104.9910, 12.5657],
  'myanmar': [95.9560, 21.9162],
  'global': [20, 20],
  'worldwide': [20, 20],
  'international': [20, 20],
};

function getCoordinates(text: string): [number, number] {
  const lower = text.toLowerCase();
  for (const [country, coords] of Object.entries(COUNTRY_COORDS)) {
    if (lower.includes(country)) return coords;
  }
  return [20, 20];
}

function getSeverity(title: string): { severity: string; color: string } {
  const t = title.toLowerCase();
  if (t.includes('death') || t.includes('fatal') || t.includes('kill') || t.includes('emergency')) {
    return { severity: 'HIGH ALERT', color: '#FF4D6D' };
  }
  if (t.includes('outbreak') || t.includes('confirmed') || t.includes('spread')) {
    return { severity: 'ELEVATED', color: '#FFB347' };
  }
  return { severity: 'MONITORING', color: '#FF8FA3' };
}

export async function GET() {
  try {
    const allItems: object[] = [];

    for (const feed of FEEDS) {
      try {
        const parsed = await parser.parseURL(feed.url);
        const items = parsed.items.slice(0, 8);

        for (const item of items) {
          const title = item.title || '';
          const snippet = item.contentSnippet || '';
          const fullText = title + ' ' + snippet;

          const isRelevant = THREAT_KEYWORDS.some(k => fullText.toLowerCase().includes(k));
          if (!isRelevant) continue;

          const { severity, color } = getSeverity(title);
          const coordinates = getCoordinates(fullText);

          allItems.push({
            id: item.guid || item.link || Math.random().toString(),
            name: title.slice(0, 80),
            severity,
            color,
            location: coordinates[0] === 20 ? 'Global' : 'See source',
            keyStat: snippet.slice(0, 120) || 'See source for details',
            ageContext: 'See source for details',
            whyHere: 'See source for details',
            timeline: `Published: ${item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Recently'}`,
            source: feed.source,
            link: item.link || item.guid || '',
            coordinates,
          });
        }
      } catch {
        console.error(`Failed to fetch ${feed.source}`);
      }
    }

    return NextResponse.json({ threats: allItems });
  } catch {
    return NextResponse.json({ threats: [] }, { status: 500 });
  }
}