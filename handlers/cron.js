import { createClient } from '@supabase/supabase-js';

const TOPIK = [
  'Cara Membeli Pulsa Online dengan Mudah dan Aman',
  'Cara Memilih Paket Data Internet Sesuai Kebutuhan',
  'Cara Cek Kuota Internet Berbagai Operator',
  'Cara Membeli Token Listrik PLN Secara Online',
  'Cara Mengisi Token Listrik ke Meteran dengan Benar',
  'Cara Top Up DANA dengan Mudah',
  'Cara Top Up OVO dan GoPay Secara Online',
  'Cara Membeli Voucher Game Online',
  'Tips Memilih Nominal Top Up Mobile Legends',
  'Tips Aman Melakukan Transaksi Digital',
  'Keuntungan Membeli Pulsa dan Paket Data Secara Online',
  'Cara Memilih Layanan Top Up Digital yang Terpercaya'
];

function slugify(teks) {
  return String(teks)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function waktuJakarta() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date());

  return Object.fromEntries(
    parts.map(p => [p.type, p.value])
  );
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  const auth = req.headers.authorization;

  if (
    !process.env.CRON_SECRET ||
    auth !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak.'
    });
  }

  if (
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.GEMINI_API_KEY
  ) {
    return res.status(500).json({
      success: false,
      message: 'Konfigurasi server belum lengkap.'
    });
  }

let tahap = 'Memulai generator';  
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    tahap = 'Membaca pengaturan Supabase';
    const { data: setting, error: settingError } =
      await supabase
        .from('posting_settings')
        .select('*')
        .eq('id', 'main')
        .single();

    if (settingError) {
  console.error('SETTING ERROR DETAIL:', JSON.stringify(settingError));
  throw new Error(
    settingError.message || JSON.stringify(settingError)
  );
}

tahap = 'Memeriksa hasil pengaturan Supabase';

if (!setting.auto_mode) {
  return res.status(200).json({
    success: true,
    message: 'Mode otomatis sedang tidak aktif.'
  });
}

    const manualRun = req.manualRun === true;
    const sekarang = waktuJakarta();
    const jamSekarang =
      `${sekarang.hour}:${sekarang.minute}`;

    if (
      !manualRun &&
      jamSekarang !== setting.posting_time
    ) {
      return res.status(200).json({
        success: true,
        message: 'Belum waktunya membuat artikel.',
        waktu_jakarta: jamSekarang,
        jadwal: setting.posting_time
      });
    }

    const awalHari = new Date(
      `${sekarang.year}-${sekarang.month}-${sekarang.day}T00:00:00+07:00`
    ).toISOString();

    const akhirHari = new Date(
      `${sekarang.year}-${sekarang.month}-${sekarang.day}T23:59:59.999+07:00`
    ).toISOString();

    const batas = Math.min(
      Math.max(Number(setting.articles_per_day) || 1, 1),
      3
    );

    const { count, error: countError } =
      await supabase
        .from('articles')
        .select('*', {
          count: 'exact',
          head: true
        })
        .contains('labels', ['DIGITEK_AUTO'])
        .gte('created_at', awalHari)
        .lte('created_at', akhirHari);

    if (countError) throw countError;

    if (count >= batas) {
      return res.status(200).json({
        success: true,
        message: 'Batas artikel otomatis hari ini sudah tercapai.',
        jumlah: count,
        batas
      });
    }

    const { data: artikelLama, error: artikelError } =
      await supabase
        .from('articles')
        .select('slug')
        .in('slug', TOPIK.map(slugify));

    if (artikelError) throw artikelError;

    const slugTerpakai = new Set(
      (artikelLama || []).map(item => item.slug)
    );

    const tersedia = TOPIK.filter(
      topik => !slugTerpakai.has(slugify(topik))
    );

    if (!tersedia.length) {
      return res.status(200).json({
        success: true,
        message: 'Semua topik sudah pernah dibuat.'
      });
    }

    const topik = tersedia[
      Math.floor(Math.random() * tersedia.length)
    ];

    const slug = slugify(topik);

    const prompt = `
Kamu adalah penulis profesional dan ahli SEO untuk DIGITEK STORE.

Buat artikel berbahasa Indonesia berdasarkan topik:
"${topik}"

Digitek Store adalah toko layanan digital PPOB
yang menyediakan pulsa, paket data, token PLN,
e-wallet, voucher game, dan pembayaran digital.

Ketentuan:
1. Artikel informatif, orisinal, dan mudah dipahami.
2. Gunakan struktur HTML H2, H3, paragraf dan daftar.
3. Hindari pengulangan keyword berlebihan.
4. Jangan mengarang harga, promo, atau fakta layanan.
5. Buat minimal 800 kata jika memungkinkan.
6. Sertakan FAQ.
7. Jangan gunakan tag html, head, atau body.

Kembalikan hanya JSON:
{
  "title": "Judul artikel",
  "meta_description": "Deskripsi SEO",
  "excerpt": "Ringkasan",
  "content_html": "<h2>...</h2><p>...</p>",
  "keywords": ["keyword"],
  "labels": ["label"],
  "faq": [
    {
      "question": "Pertanyaan",
      "answer": "Jawaban"
    }
  ]
}
`;

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      90000
    );

    let response;

    try {
      response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': process.env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.7,
              maxOutputTokens: 4096
            }
          }),
          signal: controller.signal
        }
      );
    } finally {
      clearTimeout(timeout);
    }

    const raw = await response.text();
    const hasil = JSON.parse(raw);

    if (!response.ok) {
      throw new Error(
        hasil.error?.message || 'Gemini gagal membuat artikel.'
      );
    }

    const teks = hasil.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('');

    if (!teks) {
      throw new Error('Gemini tidak menghasilkan artikel.');
    }

    const artikel = JSON.parse(teks);

    if (
      !artikel.title ||
      !artikel.content_html ||
      !artikel.meta_description
    ) {
      throw new Error('Struktur artikel tidak lengkap.');
    }

    artikel.content_html += `
<div style="
  margin:30px 0;
  padding:22px;
  background:#eef6ff;
  border:1px solid #cfe3ff;
  border-radius:12px;
  text-align:center;
">
  <h3 style="color:#1557a0;margin-top:0;">
    Butuh Pulsa, Paket Data atau Token Listrik?
  </h3>
  <p>
    Penuhi kebutuhan transaksi digital Anda
    melalui layanan PPOB Digitek Store.
  </p>
  <a href="https://digitekstore.blogspot.com/2026/11/layananppob.html"
     target="_blank"
     rel="noopener"
     style="
       display:inline-block;
       padding:13px 24px;
       background:#0879e8;
       color:white;
       text-decoration:none;
       border-radius:8px;
       font-weight:bold;
     ">
     🛒 BUKA LAYANAN PPOB
  </a>
</div>
`;

    const labels = Array.isArray(artikel.labels)
      ? artikel.labels
      : [];

    if (!labels.includes('DIGITEK_AUTO')) {
      labels.push('DIGITEK_AUTO');
    }

    const { data: tersimpan, error: simpanError } =
      await supabase
        .from('articles')
        .insert({
          title: artikel.title,
          slug,
          meta_description: artikel.meta_description,
          excerpt: artikel.excerpt || '',
          content_html: artikel.content_html,
          keywords: artikel.keywords || [],
          labels,
          faq: artikel.faq || [],
          status: 'draft'
        })
        .select()
        .single();

    if (simpanError) throw simpanError;

    return res.status(200).json({
      success: true,
      message: 'Artikel otomatis berhasil disimpan sebagai Draft.',
      topik,
      jumlah_hari_ini: (count || 0) + 1,
      batas_harian: batas,
      artikel: {
        id: tersimpan.id,
        title: tersimpan.title,
        slug: tersimpan.slug,
        status: tersimpan.status
      }
    });

  } catch (error) {
    console.error('CRON GENERATE ERROR:', {
      tahap,
      name: error?.name,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code,
      stack: error?.stack
    });

    if (error.name === 'AbortError') {
      return res.status(504).json({
        success: false,
        message: 'Gemini terlalu lama merespons.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Gagal menjalankan generator otomatis.',
      error: error.message
    });
  }
}
