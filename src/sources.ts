// Haber kaynakları (RSS)
export const newsSources: string[] = [
  // Tokat genel
  "https://news.google.com/rss/search?q=Tokat&hl=tr&gl=TR&ceid=TR:tr",

  // İlçeler
  "https://news.google.com/rss/search?q=Tokat+Erbaa&hl=tr&gl=TR&ceid=TR:tr",
  "https://news.google.com/rss/search?q=Tokat+Niksar&hl=tr&gl=TR&ceid=TR:tr",
  "https://news.google.com/rss/search?q=Tokat+Zile&hl=tr&gl=TR&ceid=TR:tr",
  "https://news.google.com/rss/search?q=Tokat+Turhal&hl=tr&gl=TR&ceid=TR:tr",
  "https://news.google.com/rss/search?q=Tokat+Re%C5%9Fadiye&hl=tr&gl=TR&ceid=TR:tr",
  "https://news.google.com/rss/search?q=Tokat+Almus&hl=tr&gl=TR&ceid=TR:tr",
  "https://news.google.com/rss/search?q=Tokat+Pazar&hl=tr&gl=TR&ceid=TR:tr",
  "https://news.google.com/rss/search?q=Tokat+Artova&hl=tr&gl=TR&ceid=TR:tr",
  "https://news.google.com/rss/search?q=Tokat+Sulusaray&hl=tr&gl=TR&ceid=TR:tr",
  "https://news.google.com/rss/search?q=Tokat+Ba%C5%9F%C3%A7iftlik&hl=tr&gl=TR&ceid=TR:tr",

  // Ulusal akışlar (Tokat haberleri de düşer)
  "https://www.hurriyet.com.tr/rss/yerel/tokat",
  "https://www.sabah.com.tr/rss/yerel/tokat",
  "https://www.cnnturk.com/feed/rss/all/news",
  "https://www.dha.com.tr/rss",
  "https://www.aa.com.tr/tr/rss/default?cat=turkiye"
];

// Resmi duyuru kaynakları (RSS varsa)
export const officialSources: string[] = [
  "https://www.tokat.bel.tr/duyurular/rss",
  "https://www.tokat.gov.tr/duyurular/rss"
];

// Tweet embed için
export const twitterHandles: string[] = [
  "tokatvaliligi",
  "tokatbelediye",
  "emniyettokat",
  "AFADTURKIYE"
];

// Toplu export (opsiyonel)
const sources = { newsSources, officialSources, twitterHandles };
export default sources;
