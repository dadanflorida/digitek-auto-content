const CACHE_DURATION = 30 * 60 * 1000;

let cache = null;
let cacheTime = 0;

// DECODE XML
function decodeXML(text) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(
      /&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi,
      (match, entity) => {
        const entities = {
          amp: '&',
          lt: '<',
          gt: '>',
          quot: '"',
          apos: "'"
        };

        try {
          if (entity.startsWith('#x')) {
            return String.fromCodePoint(
              parseInt(entity.slice(2), 16)
            );
          }

          if (entity.startsWith('#')) {
            return String.fromCodePoint(
              parseInt(entity.slice(1), 10)
            );
          }
        } catch {
          return match;
        }

        return entities[entity.toLowerCase()] || match;
      }
    )
    .trim();
}

// BACA TAG XML
function getTag(xml, tag) {
  const escaped = tag.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );

  const regex = new RegExp(
    `<${escaped}\\b[^>]*>([\\s\\S]*?)<\\/${escaped}\\s*>`,
    'i'
  );

  const match = xml.match(regex);

  return match ? decodeXML(match[1]) : '';
}

// BACA GOOGLE TRENDS RSS
function getTrends(xml) {
  const items =
    xml.match(/<item\b[^>]*>[\s\S]*?<\/item>/gi) || [];

  return items.map((item, index) => {
    const title = getTag(item, 'title');
    const traffic = getTag(item, 'ht:approx_traffic');
    const pubDate = getTag(item, 'pubDate');

    const news = [];

    const newsMatches =
      item.match(
        /<ht:news_item\b[^>]*>[\s\S]*?<\/ht:news_item>/gi
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

// KATEGORI DIGITEK STORE
// KLASIFIKASI TREN DIGITEK STORE
function classify(title) {
  const text = title.toLowerCase();

  const categories = {
    'Pulsa & Paket Data': [
      'pulsa',
      'paket data',
      'kuota internet',
      'telkomsel',
      'indosat',
      'xl axiata',
      'smartfren',
      'by.u',
      'provider internet',
      'internet murah'
    ],

    'PLN & Listrik': [
      'token listrik',
      'listrik prabayar',
      'tagihan listrik',
      'tarif listrik',
      'pln'
    ],

    'E-Wallet & Pembayaran': [
      'dompet digital',
      'top up dana',
      'saldo dana',
      'gopay',
      'ovo',
      'shopeepay',
      'linkaja',
      'qris',
      'pembayaran digital'
    ],

    'Voucher & Game': [
      'mobile legends',
      'mobile legend',
      'free fire',
      'pubg mobile',
      'roblox',
      'voucher game',
      'top up game',
      'steam wallet'
    ],

    'Tagihan & Layanan Digital': [
      'bpjs',
      'pdam',
      'tagihan internet',
      'tv kabel',
      'pascabayar',
      'tagihan bulanan',
      'pembayaran online'
    ]
  };

  // RELEVANSI LANGSUNG
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return {
        category,
        relevance: 'Relevan',
        score: 90
      };
    }
  }

  // TOPIK POTENSIAL
  const potentialKeywords = [
    'harga internet',
    'internet cepat',
    'jaringan internet',
    'smartphone',
    'aplikasi digital',
    'belanja online',
    'teknologi',
    'transaksi online',
    'ekonomi digital',
    'bisnis online'
  ];

  if (
    potentialKeywords.some(keyword =>
      text.includes(keyword)
    )
  ) {
    return {
      category: 'Teknologi & Digital',
      relevance: 'Potensial',
      score: 60
    };
  }

  // TREN TIDAK RELEVAN
  return {
    category: 'Tren umum',
    relevance: 'Tidak relevan',
    score: 10
  };
      }

  

// API HANDLER
export default async function handler(req, res) {

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method tidak diizinkan'
    });
  }

  // CEK CACHE
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
          'User-Agent': 'Mozilla/5.0 DigitekContentEngine/1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        },
        signal: AbortSignal.timeout(12000)
      }
    );

    if (!response.ok) {
      throw new Error(
        `Google Trends HTTP ${response.status}`
      );
    }

    const xml = await response.text();

    const rawTrends = getTrends(xml);

    if (!rawTrends.length) {
      throw new Error(
        'RSS diterima tetapi data tren tidak ditemukan'
      );
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
