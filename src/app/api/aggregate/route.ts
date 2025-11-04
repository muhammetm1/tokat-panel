export const runtime = 'nodejs';
import Parser from 'rss-parser';
import { sources } from '../../../sources'; // dikkat: 3 kez '..'

export const revalidate = 0;

type FeedItem = {
  source: string;
  title: string;
  link: string;
  publishedAt: string;
  snippet?: string;
  media?: string;
};

export async function GET() {
  const rssList: string[] = sources.rss || [];
  const parser = new Parser();
  const all: FeedItem[] = [];

  for (const url of rssList) {
    try {
      const feed = await parser.parseURL(url);
      const sourceName = feed.title || url;

      for (const i of feed.items || []) {
      //const text = ((i.title || '') + ' ' + (i.contentSnippet || '')).toLowerCase();
        //if (!text.includes('tokat')) continue;
        all.push({
          source: sourceName,
          title: i.title || '(Untitled)',
          link: i.link || url,
          publishedAt: i.pubDate
            ? new Date(i.pubDate).toISOString()
            : new Date().toISOString(),
          snippet: (i as any).contentSnippet || (i as any).content || '',
          media: (i as any).enclosure?.url || undefined,
        });
      }
    } catch (e) {
      console.error('RSS error', url, e);
    }
  }
    // dedupe by normalized title+link
const seen = new Set<string>();
const uniq = [];
for (const it of all) {
  const key = (it.title + '|' + it.link).toLowerCase().trim();
  if (seen.has(key)) continue;
  seen.add(key);
  uniq.push(it);
}
const items = uniq.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
return new Response(JSON.stringify({ items }), {
  headers: { 'Content-Type': 'application/json' }
});

  all.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

  return new Response(JSON.stringify({ items: all }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
