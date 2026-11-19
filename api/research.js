const CACHE_DURATION = 30 * 60 * 1000;
let cache = null;
let cacheTime = 0;

function decodeXML(text) {
return text
.replace(/&/g, '&')
.replace(/</g, '<')
.replace(/>/g, '>')
.replace(/"/g, '"')
.replace(/'/g, "'");
}

function getTag(xml, tag) {
const escaped = tag.replace(':', '\:');
const match = xml.match(
new RegExp("<${escaped}[^>]*>([\\\\s\\\\S]*?)<\\\\/${escaped}>", 'i')
);

return match ? decodeXML(match[1].trim()) : '';
}

function getTrends(xml) {
const items = xml.match(/<item[\s\S]*?</item>/gi) || [];

return items.map((item, index) => {
const title = getTag(item, 'title');
const traffic = getTag(item, 'ht:approx_traffic');
const pubDate = getTag(item, 'pubDate');

const news = [];
const newsMatches = item.match(
  /<ht:news_item>[\s\S]*?<\/ht:news_item>/gi
) || [];

newsMatches.forEach(entry => {
  news.push({
    title: getTag(entry, 'ht:news_item_title'),
    source: getTag(entry, 'ht:news_item_source'),
    url: getTag(entry, 'ht:news_item_url')
  });
});

return {
  id: index + 1,
  title,
  traffic,
  pubDate,
  news
};

}).filter(item => item.title);
}

function classify(title) {
const text = title.toLowerCase();

const categories = {
'Pulsa & Paket Data': [
'telkomsel', 'indosat', 'xl', 'axis', 'tri',
'smartfren', 'internet', 'paket data', 'kuota', 'pulsa'
],
'PLN & Listrik': [
'pln', 'token listrik', 'listrik', 'tarif listrik'
],
'E-Wallet': [
'dana', 'ovo', 'gopay', 'shopeepay', 'linkaja'
],
'Voucher & Game': [
'mobile legends', 'free fire', 'pubg', 'game',
'steam', 'roblox', 'voucher'
]
};

for (const [category, keywords] of Object.entries(categories)) {
if (keywords.some(keyword => text.includes(keyword))) {
return {
category,
relevance: 'Relevan',
score: 80
};
}
}

return {
category: 'Tren umum',
relevance: 'Perlu dianalisis',
score: 30
};
}

export default async function handler(req, res) {
if (req.method !== 'GET') {
return res.status(405).json({
success: false,
message: 'Method tidak diizinkan'
});
}

if (cache && Date.now() - cacheTime < CACHE_DURATION) {
return res.status(200).json({
success: true,
cached: true,
country: 'Indonesia',
updatedAt: new Date(cacheTime).toISOString(),
total: cache.length,
trends: cache
});
}

try {
const response = await fetch(
'https://trends.google.com/trending/rss?geo=ID',
{
headers: {
'User-Agent': 'Mozilla/5.0 DigitekContentEngine/1.0'
},
signal: AbortSignal.timeout(12000)
}
);

if (!response.ok) {
  throw new Error(`Google Trends HTTP ${response.status}`);
}

const xml = await response.text();
const rawTrends = getTrends(xml);

if (!rawTrends.length) {
  throw new Error('Data tren belum berhasil dibaca');
}

const trends = rawTrends.map(item => ({
  ...item,
  ...classify(item.title)
}));

cache = trends;
cacheTime = Date.now();

return res.status(200).json({
  success: true,
  cached: false,
  country: 'Indonesia',
  updatedAt: new Date(cacheTime).toISOString(),
  total: trends.length,
  trends
});

} catch (error) {
console.error('RISET PASAR ERROR:', error);

return res.status(502).json({
  success: false,
  message: 'Gagal mengambil data Google Trends.',
  detail: error.message
});

}
}
