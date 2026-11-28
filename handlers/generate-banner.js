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

function buatSVG(artikel, ilustrasiBase64) {
  const judul = potongJudul(artikel.title, 25);
  const kategori = tentukanKategori(artikel);

  const teksJudul = judul.map((baris, i) => `
    <text x="75" y="${270 + i * 76}"
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

    <rect width="1200" height="630"
      fill="url(#background)"/>

    <circle cx="1100" cy="100" r="220"
      fill="#1684E8" opacity="0.08"/>

    <circle cx="1100" cy="550" r="250"
      fill="#1684E8" opacity="0.10"/>

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
    <rect x="75" y="160" width="340" height="45"
      rx="12" fill="#D5EAFE"/>

    <text x="95" y="190"
      font-family="Roboto"
      font-size="20"
      font-weight="bold"
      fill="#0879E8">${escapeXml(kategori)}</text>

    <!-- ARTICLE TITLE -->
    ${teksJudul}

    <!-- ACCENT LINE -->
    <rect x="75" y="495" width="430" height="6"
      rx="3" fill="#0879E8"/>

    <text x="75" y="545"
      font-family="Roboto"
      font-size="22"
      fill="#31577D">Informasi dan solusi digital terpercaya</text>

    <!-- AI GENERATED ILLUSTRATION -->
<defs>
  <clipPath id="aiIllustrationClip">
    <rect x="760" y="150"
      width="390" height="350"
      rx="28"/>
  </clipPath>
</defs>

<rect x="760" y="150"
  width="390" height="350"
  rx="28"
  fill="#EAF4FF"/>

<image
  href="data:image/png;base64,${ilustrasiBase64}"
  x="760"
  y="150"
  width="390"
  height="350"
  preserveAspectRatio="xMidYMid slice"
  clip-path="url(#aiIllustrationClip)"/>
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
