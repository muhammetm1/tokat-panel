'use client';
import { useEffect, useMemo, useState } from 'react';

type Item = {
  source: string;
  title: string;
  link: string;
  publishedAt: string;
  snippet?: string;
  media?: string;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [tokatOnly, setTokatOnly] = useState(true);

  // İlk yükleme
  useEffect(() => {
    fetch('/api/aggregate')
      .then(r => r.json())
      .then(d => setItems(d.items || []))
      .catch(console.error);
  }, []);

  // 5 dakikada bir otomatik yenile
  useEffect(() => {
    const id = setInterval(() => {
      fetch('/api/aggregate')
        .then(r => r.json())
        .then(d => setItems(d.items || []))
        .catch(console.error);
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const sources = useMemo(() => {
    const s = new Set(items.map(i => i.source));
    return ['all', ...Array.from(s)];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter(i => {
      if (sourceFilter !== 'all' && i.source !== sourceFilter) return false;

      if (tokatOnly) {
        const text = ((i.title || '') + ' ' + (i.snippet || '')).toLowerCase();
        if (!text.includes('tokat')) return false;
      }

      if (
        q &&
        !(
          i.title?.toLowerCase().includes(q.toLowerCase()) ||
          i.snippet?.toLowerCase().includes(q.toLowerCase())
        )
      ) {
        return false;
      }

      return true;
    });
  }, [items, q, sourceFilter, tokatOnly]);

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900">
      <header className="sticky top-0 bg-white border-b">
        <div className="max-w-5xl mx-auto p-4 flex flex-wrap gap-2 items-center justify-between">
          <h1 className="font-bold">Tokat Muhtar Paneli</h1>
          <div className="flex flex-wrap gap-2">
            <input
              placeholder="Ara..."
              value={q}
              onChange={e => setQ(e.target.value)}
              className="border px-3 py-2 rounded-lg"
            />
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="border px-3 py-2 rounded-lg"
            >
              {sources.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-sm border px-3 py-2 rounded-lg bg-white">
              <input
                type="checkbox"
                checked={tokatOnly}
                onChange={e => setTokatOnly(e.target.checked)}
              />
              Sadece "Tokat" geçenler
            </label>

            <button
              onClick={() =>
                fetch('/api/aggregate')
                  .then(r => r.json())
                  .then(d => setItems(d.items || []))
              }
              className="border px-3 py-2 rounded-lg"
            >
              Yenile
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {filtered.length === 0 && (
          <div className="text-sm text-gray-600">
            Hiç içerik bulunamadı. Kaynakları artırmayı deneyin.
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((i, idx) => (
            <article key={idx} className="bg-white border rounded-lg p-4 shadow text-gray-900">
              <a href={i.link} target="_blank" className="font-semibold hover:underline">
                {i.title}
              </a>
              <div className="text-xs text-gray-500">
                {new Date(i.publishedAt).toLocaleString()}
              </div>
              <div className="text-xs mt-2 inline-flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-gray-100 border">{i.source}</span>
                <a href={i.link} target="_blank" className="underline opacity-80 hover:opacity-100">
                  Haberi aç →
                </a>
              </div>
              {i.media && <img src={i.media} className="rounded-lg mt-3" />}
              <p className="text-sm mt-3 text-gray-700">{i.snippet}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
