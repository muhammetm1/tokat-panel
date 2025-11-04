import './globals.css';
import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tokat Panel',
  description: 'Tokat odaklı haber paneli',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Tema tercihini hydration'dan ÖNCE uygula */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch(e) {}
})();
`,
          }}
        />
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900 dark:bg-[#0b0f14] dark:text-gray-100`}>
        {children}
      </body>
    </html>
  );
}
