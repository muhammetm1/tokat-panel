'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
const fmt = (iso: string) =>
  new Date(iso).toLocaleString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour12: false,
  });
type Item = {
  source: string;
  title: string;
  link: string;
  publishedAt: string;
  snippet?: string;
  media?: string;
  tags?: string[];
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [tokatOnly, setTokatOnly] = useState(true);

  // Sonsuz kaydırma
  const [visible, setVisible] = useState(20); // ilk sayfa 20 kart
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Dark mode toggle (html.classList)
 // Dark mode state: sadece html.classList'e bak
const [dark, setDark] = useState(false);
useEffect(() => {
  setDark(document.documentElement.classList.contains('dark'));
}, []);

const toggleDark = () => {
  const el = document.documentElement;
  const willBeDark = !el.classList.contains('dark');
  el.classList.toggle('dark', willBeDark);
  setDark(willBeDark);
  try { localStorage.setItem('theme', willBeDark ? 'dark' : 'light'); } catch {}
};


  // İlk yüklemede tema tercihini oku
  useEffect(() => {
    try {
      const pref = localStorage.getItem('theme');
      if (pref === 'dark') {
        document.documentElement.classList.add('dark');
        setDark(true);
      }
    } catch {}
  }, []);

  // Veri çek + 5 dk’da bir otomatik yenile
  useEffect(() => {
    const pull = () =>
      fetch('/api/aggregate')
        .then(r => r.json())
        .then(d => setItems(d.items || []))
        .catch(console.error);

    pull();
    const id = setInterval(pull, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Kaynak listesi
  const sources = useMemo(() => {
    const s = new Set(items.map(i => i.source));
    return ['all', ...Array.from(s)];
  }, [items]);

  // Filtre
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

  // Sonsuz kaydırma: IntersectionObserver ile görünürlük arttır
  useEffect(() => {
    if (!sentinelRef.current) return;
    const io = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (first.isIntersecting) {
          setVisible(v => Math.min(v + 20, filtered.length)); // her tetiklemede +20
        }
      },
      { rootMargin: '600px' } // önceden yükle
    );
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [filtered.length]);

  // Renkli rozetler (kaynak adına göre renk tonları)
  const sourceBadge = (src: string) => {
    const seeds = [
      'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-200 dark:border-indigo-800',
      'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800',
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800',
      'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-200 dark:border-sky-800',
      'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-800',
      'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/40 dark:text-violet-200 dark:border-violet-800',
      'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/40 dark:text-teal-200 dark:border-teal-800'
    ];
    // basit hash
    let h = 0;
    for (let i = 0; i < src.length; i++) h = (h * 31 + src.charCodeAt(i)) >>> 0;
    return seeds[h % seeds.length];
  };

  // Gösterilecek dilim
  const pageItems = filtered.slice(0, visible);

  return (
    <main className="min-h-screen">
      {/* Üst bar */}
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur dark:bg-[#0b0f14]/60">
        <div className="max-w-6xl mx-auto p-3 md:p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* LOGO + TITLE */}
          <div className="flex items-center gap-3">
            {/* Logo: public/logo.png (veya logo.svg) ekleyince görünür; yoksa gradient fallback */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Logo"
              onError={(e: any) => {
                e.currentTarget.style.display = 'none';
                (e.currentTarget.nextSibling as HTMLElement).style.display = 'block';
              }}
              className="h-9 w-9 rounded-xl2 object-contain border border-black/5 dark:border-white/10 bg-transparent"
            />
            <div className="hidden h-9 w-9 rounded-xl2 bg-gradient-to-br from-indigo-500 to-emerald-500 shadow-card" />
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight">Tokat Panel</h1>
          </div>

          {/* CONTROLS */}
          <div className="flex flex-wrap gap-2">
            <input
              placeholder="Ara başlık/özet…"
              value={q}
              onChange={e => setQ(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-white/5 dark:border-white/10"
            />

            <div className="relative">
            <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="
              appearance-none
              border rounded-lg px-3 py-2 pr-9 text-sm
              bg-white text-gray-900 border-gray-300
              focus:outline-none focus:ring-2 focus:ring-sky-500/30

              dark:bg-white/5 dark:text-gray-100 dark:border-white/10
              dark:placeholder:text-gray-400
              "
              title="Kaynak"
  >
              {sources.map((s) => (
                <option key={s} value={s}>{s}</option>
                ))}
            </select>

            {/* Özel ok ikonu (renkler dark'a uyar) */}
            <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-300"
            viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
  >
            <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"/>
            </svg>
            </div>

            <label className="flex items-center gap-2 text-sm border px-3 py-2 rounded-lg bg-white dark:bg-white/5 dark:border-white/10">
              <input
                type="checkbox"
                checked={tokatOnly}
                onChange={e => setTokatOnly(e.target.checked)}
              />
              Sadece Tokat
            </label>

            <button
              onClick={() =>
                fetch('/api/aggregate')
                  .then(r => r.json())
                  .then(d => setItems(d.items || []))
              }
              className="border px-3 py-2 rounded-lg text-sm bg-white dark:bg-white/5 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10"
            >
              Yenile
            </button>

            <button
              onClick={toggleDark}
              className="border px-3 py-2 rounded-lg text-sm bg-white dark:bg-white/5 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10"
              title="Karanlık modu aç/kapat"
            >
              {dark ? '🌙 Koyu' : '☀️ Açık'}
            </button>
          </div>
        </div>
      </header>

      {/* İçerik */}
      <section className="max-w-6xl mx-auto p-4">
        {pageItems.length === 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Hiç içerik bulunamadı. Kaynakları artırmayı deneyin.
          </div>
        )}

        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((i, idx) => (
            <article
              key={idx}
              className="group bg-white dark:bg-white/5 border dark:border-white/10 rounded-2xl p-4 shadow-sm hover:shadow-card hover:-translate-y-[1px]"
            >
              {/* Üst bilgi */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <span
                  className={`text-[11px] font-medium px-2 py-1 rounded border ${sourceBadge(
                    i.source
                  )}`}
                >
                  {i.source}
                </span>
                <time className="text-[11px] text-gray-500 dark:text-gray-400">
                {fmt(i.publishedAt)}
                </time>
              </div>

              {/* Başlık */}
              <a href={i.link} target="_blank" className="block font-semibold leading-snug group-hover:underline">
                {i.title}
              </a>

              {/* Thumbnail varsa */}
              {i.media && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  src={i.media}
                  className="mt-3 w-full aspect-video object-cover rounded-xl border dark:border-white/10"
                />
              )}

              {/* Özet */}
              {i.snippet && (
                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-4">
                  {i.snippet}
                </p>
              )}

              {/* Etiketler (opsiyonel) */}
              {i.tags && i.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {i.tags.map(t => (
                    <span
                      key={t}
                      className="text-[11px] px-2 py-0.5 rounded border bg-gray-50 dark:bg-white/5 dark:border-white/10"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Alt link */}
              <div className="mt-3 text-sm">
                <a href={i.link} target="_blank" className="inline-flex items-center gap-1 opacity-80 hover:opacity-100">
                  Haberi aç →
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Sonsuz kaydırma gözcüsü */}
        {visible < filtered.length && (
          <div
            ref={sentinelRef}
            className="h-10 mt-6 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400"
          >
            Yükleniyor…
          </div>
        )}
      </section>
    </main>
  );
}
