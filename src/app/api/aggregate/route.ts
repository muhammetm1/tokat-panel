export const runtime = 'nodejs';

import Parser from 'rss-parser';
import { newsSources } from '../../../sources';

export const revalidate = 0;

// Normalize function
function normalize(tr: string) {
  return (tr || '')
    .toLowerCase()
    .replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i')
    .replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u');
}

// Auto-tag rules
const TAG_RULES: Record<string, string[]> = {
  "Belediye": ["belediye","baskan","meclis","ihale","temizlik","zabıta","park","imar"],
  "Valilik/Emniyet": ["valilik","vali","emniyet","jandarma","trafik","asayis","uyari","yasak"],
  "AFAD/Deprem": ["afad","deprem","sarsinti","tatbikat","acil durum"],
  "Eğitim": ["okul","universite","meb","ogretmen","ogrenci","sinav","ders"],
  "Sağlık": ["hastane","saglik","eczane","doktor","ambulans","aşı","asi"],
  "Spor": ["spor","mac","lig","futbol","basketbol","voleybol","skor"],
  "Ekonomi": ["esnaf","pazar","fiyat","zam","yatirim","istihdam","kredi","ihracat"],
  "Duyuru": ["duyuru","aciklama","basin","etkinlik","festival","konser","tören"]
};

// Auto tagging per item
function autoTags(title: string, snippet: string, source: string) {
  const hay = normalize(`${title} ${snippet} ${source}`);
  const hits: string[] = [];

  for (const [tag, kws] of Object.entries(TAG_RULES)) {
    if (kws.some(k => hay.includes(normalize(k)))) {
      hits.push(tag);
    }
  }

  // İl filtresi
  if (hay.includes("tokat")) hits.unshift("Tokat");

  return Array.from(new Set(hits));
}

type FeedItem = {
  source: string;
  title: string;
  link: string;
  publishedAt: string;
  snippet?: string;
  media?: string;
  tags?: string[];
};

export async function GET() {
  const parser = new Parser();
  const collected: FeedItem[] = [];

  for (const url of newsSources) {
    try {
      const feed = await parser.parseURL(url);
      const src = feed.title || url;

      for (const i of feed.items || []) {
        const title = i.title || '(Başlıksız)';
        const snippet = (i as any).contentSnippet || (i as any).content || '';
        const link = i.link || url;

        collected.push({
          source: src,
          title,
          link,
          snippet,
          publishedAt: i.pubDate
            ? new Date(i.pubDate).toISOString()
            : new Date().toISOString(),
          media: (i as any).enclosure?.url || undefined,
          tags: autoTags(title, snippet, src)
        });
      }
    } catch (err) {
      console.error('RSS error @', url, err);
    }
  }

  // Dedupe
  const seen = new Set<string>();
  const uniq: FeedItem[] = [];

  for (const it of collected) {
    const key = normalize(`${it.title}|${it.link}`);
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(it);
  }

  // Sort newest first
  uniq.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

  return Response.json({ items: uniq });
}
