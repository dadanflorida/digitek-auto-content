import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

function escapeXml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function potongJudul(text, max = 27) {
  const words = String(text || '').split(/\s+/);
  const lines = [];
  let line = '';

  for (const word of words) {
    const next = line ? line + ' ' + word : word;

    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);

  return lines.slice(0, 3);
}

function tentukanKategori(artikel) {
  const text = [
    artikel.title,
    ...(artikel.keywords || []),
    ...(artikel.labels || [])
  ].join(' ').toLowerCase();

  if (/pulsa|telkomsel|indosat|xl|smartfren/.test(text))
    return 'PULSA DIGITAL';

  if (/internet|paket data|kuota|wifi/.test(text))
    return 'PAKET DATA';

  if (/listrik|pln|token/.test(text))
    return 'LISTRIK & PLN';

  if (/ewallet|e-wallet|dana|ovo|gopay|dompet digital/.test(text))
    return 'E-WALLET';

  if (/game|gaming|voucher/.test(text))
    return 'VOUCHER GAME';

  if (/bisnis|usaha|digital|teknologi/.test(text))
    return 'BISNIS DIGITAL';

  return 'INFORMASI DIGITAL';
}

function buatSVG(artikel) {
  const judul = potongJudul(artikel.title);
  const kategori = tentukanKategori(artikel);

  const teksJudul = judul.map((baris, i) =>
    `<text x="75" y="${275 + i * 75}"
      font-size="57"
      font-weight="bold"
      fill="#123B70">${escapeXml(baris)}</text>`
  ).join('');

  return `
  <svg xmlns="http://www.w3.org/2000/svg"
       width="1200" height="630">

    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#DCEEFF"/>
      </linearGradient>
    </defs>

    <rect width="1200" height="630" fill="url(#bg)"/>

    <circle cx="1050" cy="110" r="180"
            fill="#1684E8" opacity="0.10"/>

    <circle cx="1080" cy="500" r="220"
            fill="#1684E8" opacity="0.12"/>

    <rect x="75" y="65" width="370" height="48"
          rx="24" fill="#0879E8"/>

    <text x="100" y="97"
          font-size="24"
          font-weight="bold"
          fill="#FFFFFF">DIGITEK STORE</text>

    <rect x="75" y="160" width="300" height="42"
          rx="10" fill="#D5EAFE"/>

    <text x="95" y="188"
          font-size="21"
          font-weight="bold"
          fill="#0879E8">${escapeXml(kategori)}</text>

    ${teksJudul}

    <rect x="75" y="525" width="430" height="5"
          rx="2" fill="#0879E8"/>

    <text x="75" y="575"
          font-size="25"
          fill="#31577D">Informasi dan solusi digital</text>

    <g transform="translate(850 210)">
      <circle cx="120" cy="100" r="125"
              fill="#0879E8" opacity="0.12"/>

      <rect x="45" y="25" width="150" height="150"
            rx="28" fill="#0879E8"/>

      <path d="M85 75 H155 M85 100 H155 M85 125 H140"
            stroke="#FFFFFF"
            stroke-width="13"
            stroke-linecap="round"/>

      <circle cx="180" cy="165" r="30"
              fill="#FFFFFF"/>

      <path d="M165 165 L177 177 L198 151"
            fill="none"
            stroke="#0879E8"
            stroke-width="9"
            stroke-linecap="round"
            stroke-linejoin="round"/>
    </g>

    <text x="850" y="500"
          font-size="25"
          font-weight="bold"
          fill="#0879E8">DIGITEK STORE</text>

  </svg>`;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed.'
    });
  }

  const auth = req.headers.authorization;

  if (
    !process.env.MANUAL_GENERATE_SECRET ||
    auth !== `Bearer ${process.env.MANUAL_GENERATE_SECRET}`
  ) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak.'
    });
  }

  if (
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return res.status(500).json({
      success: false,
      message: 'Konfigurasi Supabase belum lengkap.'
    });
  }

  try {
    const { articleId } = req.body || {};

    if (!articleId) {
      return res.status(400).json({
        success: false,
        message: 'ID artikel wajib diisi.'
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: artikel, error: articleError } =
      await supabase
        .from('articles')
        .select('id, title, keywords, labels')
        .eq('id', articleId)
        .single();

    if (articleError || !artikel) {
      return res.status(404).json({
        success: false,
        message: 'Artikel tidak ditemukan.'
      });
    }

    const svg = buatSVG(artikel);

    const png = await sharp(
      Buffer.from(svg)
    )
      .resize(1200, 630)
      .png()
      .toBuffer();

    const filePath = `${artikel.id}.png`;

    const { error: uploadError } =
      await supabase.storage
        .from('facebook-banners')
        .upload(filePath, png, {
          contentType: 'image/png',
          upsert: true
        });

    if (uploadError) throw uploadError;

    const { data: publicData } =
      supabase.storage
        .from('facebook-banners')
        .getPublicUrl(filePath);

    const imageUrl = publicData.publicUrl;

    const { error: updateError } =
      await supabase
        .from('articles')
        .update({
          facebook_image_url: imageUrl,
          facebook_image_path: filePath
        })
        .eq('id', artikel.id);

    if (updateError) throw updateError;

    return res.status(200).json({
      success: true,
      message: 'Banner berhasil dibuat.',
      image_url: imageUrl
    });

  } catch (error) {
    console.error('GENERATE BANNER ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Gagal membuat banner.',
      error: error.message
    });
  }
    }
