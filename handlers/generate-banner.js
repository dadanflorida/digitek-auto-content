import { createClient } from '@supabase/supabase-js';
import { Resvg } from '@resvg/resvg-js';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const FONT_REGULAR = resolve(
  __dirname,
  '../fonts/Roboto-Regular.ttf'
);

const FONT_BOLD = resolve(
  __dirname,
  '../fonts/Roboto-Bold.ttf'
);
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
  const judul = String(artikel.title || '').toLowerCase();

  const text = [
    judul,
    ...(artikel.keywords || []),
    ...(artikel.labels || [])
  ].join(' ').toLowerCase();

  // PRIORITAS UTAMA BERDASARKAN JUDUL
  if (/informasi|berita|tips|panduan teknologi|perkembangan teknologi/.test(judul))
    return 'INFORMASI DIGITAL';
  
  if (/bisnis|usaha|peluang usaha|peluang bisnis/.test(judul))
    return 'BISNIS DIGITAL';

  if (/paket data|internet|kuota|wifi/.test(judul))
    return 'PAKET DATA';

  if (/pulsa|telkomsel|indosat|xl|smartfren/.test(judul))
    return 'PULSA DIGITAL';

  if (/listrik|pln|token/.test(judul))
    return 'LISTRIK & PLN';

  if (/ewallet|e-wallet|dana|ovo|gopay|dompet digital/.test(judul))
    return 'E-WALLET';

  if (/game|gaming|voucher/.test(judul))
    return 'VOUCHER GAME';

  // PEMERIKSAAN KEYWORD DAN LABEL JIKA JUDUL BELUM COCOK
  if (/bisnis|usaha|entrepreneur/.test(text))
    return 'BISNIS DIGITAL';

  if (/paket data|internet|kuota|wifi/.test(text))
    return 'PAKET DATA';

  if (/pulsa|telkomsel|indosat|xl|smartfren/.test(text))
    return 'PULSA DIGITAL';

  if (/listrik|pln|token/.test(text))
    return 'LISTRIK & PLN';

  if (/ewallet|e-wallet|dana|ovo|gopay|dompet digital/.test(text))
    return 'E-WALLET';

  if (/game|gaming|voucher/.test(text))
    return 'VOUCHER GAME';

  return 'INFORMASI DIGITAL';
}

// ===================================
// PROMPT ILUSTRASI AI GEMINI
// ===================================

function buatPromptIlustrasi(artikel) {

  const kategori = tentukanKategori(artikel);

  return `
Create a premium editorial illustration
for a professional Indonesian digital services brand.

ARTICLE TITLE:
${artikel.title}

CATEGORY:
${kategori}

VISUAL REQUIREMENTS:
- Create a unique illustration based on the article topic.
- Modern professional technology aesthetic.
- Dominant blue and white color palette.
- Clean, premium, sophisticated composition.
- Main visual subject positioned on the RIGHT side.
- Keep the LEFT side mostly clean and uncluttered.
- Soft blue lighting and subtle depth.
- Suitable for a professional Facebook article banner.
- Wide landscape composition, 16:9 ratio.
- High visual quality and realistic details.

IMPORTANT:
- Do not include any text.
- Do not include letters or numbers.
- Do not create logos or watermarks.
- Do not imitate existing brand logos.
- The image will receive its title and branding separately.
`;
}

// ===================================
// GENERATE ILUSTRASI DENGAN GEMINI AI
// ===================================

async function generateIlustrasiAI(artikel) {

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY belum tersedia.');
  }

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: buatPromptIlustrasi(artikel)
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ['IMAGE'],
          imageConfig: {
            aspectRatio: '16:9',
            imageSize: '1K'
          }
        }
      })
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error?.message || 'Gemini gagal membuat ilustrasi.'
    );
  }

  const parts =
    result.candidates?.[0]?.content?.parts || [];

  const gambar = parts.find(
    part => part.inlineData?.data
  );

  if (!gambar) {
    throw new Error('Gemini tidak menghasilkan gambar.');
  }

  return Buffer.from(
    gambar.inlineData.data,
    'base64'
  );
          }

function buatIlustrasiSVG(artikel) {
  const kategori = tentukanKategori(artikel);

  const ilustrasi = {
    'PULSA DIGITAL': `
  <!-- LINGKARAN AKSEN -->
  <circle cx="165" cy="150" r="140"
    fill="#0879E8" opacity="0.10"/>

  <!-- SMARTPHONE -->
  <rect x="95" y="25" width="145" height="260"
    rx="25" fill="url(#blue)"/>

  <rect x="108" y="48" width="119" height="205"
    rx="15" fill="#FFFFFF"/>

  <rect x="150" y="35" width="35" height="5"
    rx="3" fill="#9BBFE5"/>

  <circle cx="167" cy="269" r="8"
    fill="#FFFFFF"/>

  <!-- SIMBOL TELEPON -->
  <path d="
    M145 105
    Q135 115 145 135
    Q165 175 195 185
    Q210 190 220 175
    L200 155
    Q190 165 180 155
    L165 140
    Q175 130 165 120
    Z"
    fill="#0879E8"/>

  <!-- GELOMBANG KOMUNIKASI -->
  <path d="M205 95 Q240 115 235 150"
    fill="none"
    stroke="#1684E8"
    stroke-width="8"
    stroke-linecap="round"/>

  <path d="M220 75 Q275 105 260 160"
    fill="none"
    stroke="#64D8FF"
    stroke-width="7"
    stroke-linecap="round"/>

  <!-- KOIN PULSA -->
  <circle cx="65" cy="85" r="42"
    fill="#FFD740"/>

  <text x="65" y="96"
    text-anchor="middle"
    font-size="30"
    font-weight="bold"
    font-family="Roboto"
    fill="#123B70">Rp</text>

  <!-- AKSEN DIGITAL -->
  <circle cx="65" cy="220" r="10"
    fill="#64D8FF"/>

  <circle cx="275" cy="225" r="12"
    fill="#FFD740"/>
`,

    'PAKET DATA': `
  <!-- SMARTPHONE -->
  <rect x="105" y="25" width="145" height="255"
    rx="25" fill="#0879E8"/>

  <rect x="117" y="43" width="121" height="215"
    rx="16" fill="#FFFFFF"/>

  <rect x="155" y="52" width="45" height="6"
    rx="3" fill="#9BBFE5"/>

  <!-- NETWORK ICON -->
  <path d="M145 125 Q177 90 210 125"
    stroke="#0879E8" stroke-width="9"
    fill="none" stroke-linecap="round"/>

  <path d="M158 140 Q177 122 197 140"
    stroke="#1684E8" stroke-width="9"
    fill="none" stroke-linecap="round"/>

  <circle cx="178" cy="153" r="7"
    fill="#0879E8"/>

  <!-- DATA BAR -->
  <rect x="135" y="180" width="85" height="12"
    rx="6" fill="#DCEEFF"/>

  <rect x="135" y="180" width="65" height="12"
    rx="6" fill="#0879E8"/>

  <rect x="135" y="205" width="85" height="12"
    rx="6" fill="#DCEEFF"/>

  <rect x="135" y="205" width="45" height="12"
    rx="6" fill="#1684E8"/>

  <!-- 5G BADGE -->
  <circle cx="260" cy="85" r="43"
    fill="#FFD740"/>

  <text x="260" y="96"
    text-anchor="middle"
    font-size="30"
    font-weight="bold"
    font-family="Roboto"
    fill="#123B70">5G</text>

  <!-- FLOATING DATA ICON -->
  <circle cx="75" cy="220" r="30"
    fill="#DCEEFF"/>

  <path d="M62 220 H88 M75 207 V233"
    stroke="#0879E8" stroke-width="8"
    stroke-linecap="round"/>
`,

    'LISTRIK & PLN': `
  <!-- CAHAYA LATAR -->
  <circle cx="165" cy="150" r="145"
    fill="#FFD740" opacity="0.18"/>

  <!-- METERAN LISTRIK -->
  <rect x="75" y="35" width="190" height="245"
    rx="25" fill="#0879E8"/>

  <rect x="92" y="55" width="156" height="105"
    rx="14" fill="#FFFFFF"/>

  <!-- LAYAR DIGITAL -->
  <rect x="108" y="75" width="124" height="58"
    rx="8" fill="#DCEEFF"/>

  <text x="170" y="116"
    text-anchor="middle"
    font-size="34"
    font-weight="bold"
    font-family="Roboto"
    fill="#123B70">220V</text>

  <!-- INDIKATOR -->
  <circle cx="120" cy="185" r="9"
    fill="#64D8FF"/>

  <circle cx="170" cy="185" r="9"
    fill="#FFD740"/>

  <circle cx="220" cy="185" r="9"
    fill="#FFFFFF"/>

  <!-- PETIR -->
  <path d="
    M185 205
    L145 255
    H172
    L155 290
    L215 225
    H185
    Z"
    fill="#FFD740"
    stroke="#FFFFFF"
    stroke-width="5"
    stroke-linejoin="round"/>

  <!-- AKSEN ENERGI -->
  <path d="M45 75 L60 55 L75 75"
    fill="none"
    stroke="#E53935"
    stroke-width="8"
    stroke-linecap="round"
    stroke-linejoin="round"/>

  <circle cx="285" cy="85" r="12"
    fill="#FFD740"/>

  <circle cx="45" cy="220" r="10"
    fill="#64D8FF"/>
`,

    'E-WALLET': `
  <!-- DOMPET DIGITAL -->
  <rect x="65" y="90" width="220" height="155"
    rx="28" fill="url(#blue)"/>

  <rect x="85" y="65" width="175" height="125"
    rx="22" fill="#FFFFFF"
    stroke="#0879E8" stroke-width="9"/>

  <!-- KARTU PEMBAYARAN -->
  <rect x="125" y="105" width="175" height="120"
    rx="20" fill="#0879E8"/>

  <rect x="145" y="125" width="135" height="12"
    rx="6" fill="#FFFFFF" opacity="0.9"/>

  <rect x="145" y="150" width="65" height="12"
    rx="6" fill="#FFFFFF" opacity="0.65"/>

  <circle cx="250" cy="185" r="18"
    fill="#FFD740"/>

  <!-- SIMBOL QRIS -->
  <rect x="35" y="195" width="75" height="75"
    rx="12" fill="#FFFFFF"
    stroke="#1684E8" stroke-width="5"/>

  <rect x="47" y="207" width="18" height="18"
    fill="#0879E8"/>
  <rect x="80" y="207" width="13" height="13"
    fill="#0879E8"/>
  <rect x="47" y="240" width="13" height="13"
    fill="#0879E8"/>
  <rect x="72" y="235" width="9" height="9"
    fill="#0879E8"/>
  <rect x="87" y="250" width="8" height="8"
    fill="#0879E8"/>

  <!-- KOIN DIGITAL -->
  <circle cx="285" cy="65" r="35"
    fill="#FFD740"/>

  <text x="285" y="77"
    text-anchor="middle"
    font-size="32"
    font-weight="bold"
    font-family="Roboto"
    fill="#123B70">Rp</text>
`,

    'BISNIS DIGITAL': `
  <!-- LAPTOP -->
  <rect x="65" y="65" width="205" height="145"
    rx="15" fill="url(#blue)"/>

  <rect x="80" y="80" width="175" height="115"
    rx="7" fill="#FFFFFF"/>

  <!-- GRAFIK PERTUMBUHAN -->
  <path d="M100 165 L130 140 L160 150
    L190 115 L225 95"
    fill="none"
    stroke="#0879E8"
    stroke-width="9"
    stroke-linecap="round"
    stroke-linejoin="round"/>

  <circle cx="225" cy="95" r="9"
    fill="#FFD740"/>

  <!-- DASAR LAPTOP -->
  <path d="M45 215 H285 L265 235 H65 Z"
    fill="#064A9B"/>

  <!-- KOIN KEUNTUNGAN -->
  <circle cx="265" cy="65" r="38"
    fill="#FFD740"/>

  <text x="265" y="78"
    text-anchor="middle"
    font-size="34"
    font-weight="bold"
    font-family="Roboto"
    fill="#123B70">Rp</text>

  <!-- PANAH PERTUMBUHAN -->
  <path d="M45 95 L65 75 L85 95"
    fill="none"
    stroke="#1684E8"
    stroke-width="8"
    stroke-linecap="round"
    stroke-linejoin="round"/>

  <!-- AKSEN DIGITAL -->
  <circle cx="45" cy="165" r="9"
    fill="#64D8FF"/>

  <circle cx="295" cy="180" r="10"
    fill="#FFD740"/>
`,

    'VOUCHER GAME': `
  <!-- CAHAYA LATAR GAMING -->
  <circle cx="165" cy="150" r="145"
    fill="#0879E8" opacity="0.12"/>

  <circle cx="165" cy="150" r="115"
    fill="#1684E8" opacity="0.10"/>

  <!-- GAME CONTROLLER -->
  <path d="
    M75 105
    Q80 75 115 75
    H215
    Q250 75 255 105
    L285 205
    Q295 245 265 255
    Q245 260 225 230
    L205 210
    H125
    L105 230
    Q85 260 60 250
    Q35 240 45 205
    Z"
    fill="url(#blue)"
    stroke="#FFFFFF"
    stroke-width="7"
    stroke-linejoin="round"/>

  <!-- D-PAD -->
  <path d="M105 125 V185 M75 155 H135"
    stroke="#FFFFFF"
    stroke-width="15"
    stroke-linecap="round"/>

  <!-- TOMBOL GAMING -->
  <circle cx="210" cy="130" r="14"
    fill="#FFD740"/>

  <circle cx="245" cy="165" r="14"
    fill="#FFFFFF"/>

  <circle cx="205" cy="190" r="12"
    fill="#64D8FF"/>

  <circle cx="250" cy="210" r="11"
    fill="#FFD740"/>

  <!-- EFEK ENERGI -->
  <path d="M45 65 L60 45 L75 65"
    fill="none"
    stroke="#FFD740"
    stroke-width="7"
    stroke-linecap="round"
    stroke-linejoin="round"/>

  <path d="M265 55 L280 35 L295 55"
    fill="none"
    stroke="#1684E8"
    stroke-width="7"
    stroke-linecap="round"
    stroke-linejoin="round"/>

  <!-- AKSEN CAHAYA -->
  <circle cx="35" cy="180" r="7"
    fill="#FFD740"/>

  <circle cx="295" cy="115" r="8"
    fill="#64D8FF"/>
`,

    'INFORMASI DIGITAL': `
  <!-- DOKUMEN DIGITAL -->
  <rect x="85" y="35" width="175" height="235"
    rx="20" fill="url(#blue)"/>

  <rect x="102" y="52" width="141" height="195"
    rx="12" fill="#FFFFFF"/>

  <!-- SIMBOL INFORMASI -->
  <circle cx="172" cy="105" r="30"
    fill="#FFD740"/>

  <text x="172" y="119"
    text-anchor="middle"
    font-size="42"
    font-weight="bold"
    font-family="Roboto"
    fill="#123B70">i</text>

  <!-- BARIS INFORMASI -->
  <rect x="125" y="155" width="95" height="10"
    rx="5" fill="#0879E8"/>

  <rect x="125" y="180" width="75" height="10"
    rx="5" fill="#9BBFE5"/>

  <rect x="125" y="205" width="85" height="10"
    rx="5" fill="#9BBFE5"/>

  <!-- AKSEN DIGITAL -->
  <circle cx="65" cy="75" r="13"
    fill="#64D8FF"/>

  <circle cx="280" cy="195" r="15"
    fill="#FFD740"/>

  <path d="M45 225 L65 205 L85 225"
    fill="none"
    stroke="#1684E8"
    stroke-width="8"
    stroke-linecap="round"
    stroke-linejoin="round"/>
`,

   }; 

  return `
    <g transform="translate(760 155) scale(1.18)">
      <circle cx="165" cy="145" r="165"
  fill="#0879E8" opacity="0.08"/>

<circle cx="165" cy="145" r="125"
  fill="#FFFFFF" opacity="0.55"/>

<circle cx="165" cy="145" r="105"
  fill="none" stroke="#1684E8"
  stroke-width="3" opacity="0.18"/>

<circle cx="35" cy="35" r="12"
  fill="#1684E8" opacity="0.35"/>

<circle cx="295" cy="250" r="9"
  fill="#1684E8" opacity="0.45"/>
      ${ilustrasi[kategori] || `
        <rect x="75" y="45" width="180" height="200"
          rx="28" fill="url(#blue)"/>
        <path d="M115 110 H215 M115 145 H215 M115 180 H195"
          stroke="#FFFFFF" stroke-width="13"
          stroke-linecap="round"/>
      `}
    </g>
  `;
}

function buatSVG(artikel) {
  const judul = potongJudul(artikel.title, 25);
  const kategori = tentukanKategori(artikel);

  const teksJudul = judul.map((baris, i) => `
    <text x="95" y="${270 + i * 76}"
      font-family="Roboto"
      font-size="55"
      font-weight="bold"
      fill="#123B70">${escapeXml(baris)}</text>
  `).join('');

  return `
  <svg xmlns="http://www.w3.org/2000/svg"
       width="1200" height="630">

    <defs>
      <linearGradient id="background"
        x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#DCEEFF"/>
      </linearGradient>

      <linearGradient id="blue"
        x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0879E8"/>
        <stop offset="100%" stop-color="#064A9B"/>
      </linearGradient>
    </defs>

    <!-- PREMIUM BACKGROUND -->
<rect width="1200" height="630"
  fill="url(#background)"/>

<path d="M720 0 H1200 V630 H850
  Q950 420 720 0 Z"
  fill="#0879E8" opacity="0.07"/>

<circle cx="1020" cy="310" r="245"
  fill="#1684E8" opacity="0.08"/>

<circle cx="1020" cy="310" r="195"
  fill="none" stroke="#1684E8"
  stroke-width="2" opacity="0.12"/>

<circle cx="1020" cy="310" r="155"
  fill="none" stroke="#1684E8"
  stroke-width="2" opacity="0.16"/>

<rect x="755" y="145" width="355" height="365"
  rx="35" fill="#FFFFFF" opacity="0.65"/>

<path d="M65 140 H520"
  stroke="#1684E8" stroke-width="3"
  opacity="0.15"/>

    <!-- HEADER BRAND -->
    <rect x="65" y="48" width="1070" height="75"
      rx="18" fill="url(#blue)"/>

    <rect x="85" y="64" width="45" height="45"
      rx="10" fill="#FFFFFF"/>

    <path d="M97 78 H118 M97 87 H118 M97 96 H112"
      stroke="#0879E8"
      stroke-width="4"
      stroke-linecap="round"/>

    <text x="145" y="96"
      font-family="Roboto"
      font-size="27"
      font-weight="bold"
      fill="#FFFFFF">DIGITEK STORE</text>

    <text x="1100" y="94"
      text-anchor="end"
      font-family="Roboto"
      font-size="17"
      fill="#FFFFFF">MEDIA DIGITAL</text>

    <!-- CATEGORY -->
    <rect x="75" y="160" width="360" height="48"
  rx="14" fill="url(#blue)"/>

<circle cx="98" cy="184" r="5"
  fill="#FFFFFF"/>

    <text x="115" y="191"
      font-family="Roboto"
      font-size="20"
      font-weight="bold"
      fill="#FFFFFF">${escapeXml(kategori)}</text>

      <rect x="65" y="230" width="7" height="225"
  rx="3.5" fill="url(#blue)"/>

    <!-- ARTICLE TITLE -->
    ${teksJudul}

    <!-- ACCENT LINE -->
    <rect x="75" y="495" width="430" height="6"
      rx="3" fill="#0879E8"/>

    <text x="75" y="545"
      font-family="Roboto"
      font-size="22"
      fill="#31577D">Informasi dan solusi digital terpercaya</text>

    
    <!-- DYNAMIC CATEGORY ILLUSTRATION -->
    ${buatIlustrasiSVG(artikel)}

        <!-- FOOTER -->
    <rect x="65" y="585" width="1070" height="3"
      fill="#B6D9FA"/>

    <text x="75" y="615"
      font-family="Roboto"
      font-size="17"
      fill="#31577D">DIGITEK STORE | Solusi Layanan Digital</text>

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
    const renderer = new Resvg(svg, {
  fitTo: {
    mode: 'width',
    value: 1200
  },
  font: {
    fontFiles: [
      FONT_REGULAR,
      FONT_BOLD
    ],
    loadSystemFonts: false,
    defaultFontFamily: 'Roboto'
  }
});

const png = renderer.render().asPng();
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

    const imageUrl = `${publicData.publicUrl}?v=${Date.now()}`;

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
      error: 'Terjadi kendala saat membuat banner. Silakan coba kembali.'
    });
  }
    }
