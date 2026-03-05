import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

const FEEDS = [
  { url: 'https://tools.cdc.gov/api/v2/resources/media/316422.rss', source: 'CDC' },
  { url: 'https://www.who.int/rss-feeds/news-releases.xml', source: 'WHO' },
];

const TAG_KEYWORDS: Record<string, string[]> = {
  OUTBREAKS: ['outbreak', 'virus', 'disease', 'infection', 'epidemic', 'cholera', 'dengue', 'mpox', 'flu', 'measles', 'ebola', 'malaria'],
  DISCOVERIES: ['approved', 'approval', 'trial', 'study', 'research', 'vaccine', 'therapy', 'treatment', 'drug'],
  'MENTAL HEALTH': ['mental', 'depression', 'anxiety', 'suicide', 'psychiatric', 'behavioral', 'opioid', 'substance'],
  RECALLS: ['recall', 'alert', 'warning', 'contamina', 'allergen', 'salmonella', 'listeria', 'mislabel'],
};

function getTag(title: string, snippet: string): string {
  const text = (title + ' ' + snippet).toLowerCase();
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some(k => text.includes(k))) return tag;
  }
  return 'UPDATE';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get('tab') || 'ALL';

  const allItems: object[] = [];

  for (const feed of FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      for (const item of parsed.items.slice(0, 10)) {
        const title = item.title || '';
        const snippet = item.contentSnippet || '';
        const tag = getTag(title, snippet);

        if (tab !== 'ALL' && tag !== tab) continue;

        allItems.push({
          source: feed.source,
          headline: title,
          time: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Recently',
          tag,
          region: 'Global',
          link: item.link || '#',
        });
      }
    } catch {
      console.error(`Failed to fetch ${feed.source}`);
    }
  }

  return NextResponse.json({ items: allItems });
}