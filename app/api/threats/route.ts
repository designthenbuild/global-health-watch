import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

const FEEDS = [
  { url: 'https://www.who.int/rss-feeds/news-releases.xml', source: 'WHO' },
  { url: 'https://tools.cdc.gov/api/v2/resources/media/316422.rss', source: 'CDC' },
  { url: 'https://www.promedmail.org/feed/', source: 'ProMED' },
];

const THREAT_KEYWORDS = [
  'outbreak', 'virus', 'disease', 'infection', 'epidemic', 'pandemic',
  'alert', 'warning', 'confirmed cases', 'deaths', 'flu', 'cholera',
  'dengue', 'mpox', 'measles', 'tuberculosis', 'malaria', 'ebola',
  'coronavirus', 'avian', 'zika', 'yellow fever', 'typhoid'
];

function getSeverity(title: string): { severity: string; color: string } {
  const t = title.toLowerCase();
  if (t.includes('death') || t.includes('fatal') || t.includes('kill') || t.includes('emergency')) {
    return { severity: 'HIGH ALERT', color: '#FF4D6D' };
  }
  if (t.includes('outbreak') || t.includes('confirmed') || t.includes('spread')) {
    return { severity: 'ELEVATED', color: '#FFB347' };
  }
  return { severity: 'MONITORING', color: '#FFD166' };
}

export async function GET() {
  try {
    const allItems: object[] = [];

    for (const feed of FEEDS) {
      try {
        const parsed = await parser.parseURL(feed.url);
        const items = parsed.items.slice(0, 5);

        for (const item of items) {
          const title = item.title || '';
          const isRelevant = THREAT_KEYWORDS.some(k => title.toLowerCase().includes(k));
          if (!isRelevant) continue;

          const { severity, color } = getSeverity(title);

          allItems.push({
            id: item.guid || item.link,
            name: title,
            severity,
            color,
            location: 'Global',
            keyStat: item.contentSnippet?.slice(0, 100) || 'See source for details',
            ageContext: 'See source for details',
            whyHere: 'See source for details',
            timeline: `Published: ${item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Recently'}`,
            source: feed.source,
            link: item.link,
            coordinates: [0, 20],
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