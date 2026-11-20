export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  // Keamanan API
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

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      success: false,
      message: 'Gemini API Key belum tersedia.'
    });
  }

  const { keyword, topic } = req.body || {};
  const topik = String(keyword || topic || '').trim();

  if (!topik || topik.length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Keyword atau topik tidak valid.'
    });
  }

  try {
    const prompt = `
Kamu adalah penulis profesional dan ahli SEO untuk DIGITEK STORE.

Tulis artikel berbahasa Indonesia berdasarkan topik:
"${topik}"

Tentang Digitek Store:
Digitek Store adalah toko layanan digital PPOB.
Layanannya meliputi:
- Pulsa
- Paket data internet
- Token PLN
- E-wallet
- Voucher game
- Pembayaran tagihan digital

Ketentuan artikel:
1. Artikel harus relevan dengan topik.
2. Gunakan bahasa Indonesia yang alami dan mudah dipahami.
3. Buat artikel informatif, orisinal, dan bermanfaat.
4. Hindari pengulangan keyword berlebihan.
5. Gunakan struktur HTML dengan H2, H3, paragraf dan daftar bila diperlukan.
6. Jangan mengarang harga, promo, diskon, atau fakta layanan.
7. Jangan membuat klaim yang tidak memiliki dasar.
8. Buat minimal 800 kata jika topiknya memungkinkan.
9. Sertakan FAQ yang relevan.
10. Jangan memasukkan tag HTML html, head, atau body.

Kembalikan hasil hanya dalam format JSON dengan struktur:

{
  "title": "Judul artikel",
  "slug": "alamat-artikel",
  "meta_description": "Deskripsi penelusuran",
  "excerpt": "Ringkasan artikel",
  "content_html": "<h2>...</h2><p>...</p>",
  "keywords": ["keyword utama", "keyword turunan"],
  "labels": ["label 1", "label 2"],
  "faq": [
    {
      "question": "Pertanyaan",
      "answer": "Jawaban"
    }
  ]
}
`;

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
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
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7
          }
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        message: 'Gemini gagal membuat artikel.',
        error: result.error?.message || 'Kesalahan API Gemini.'
      });
    }

    const teks =
      result.candidates?.[0]?.content?.parts
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

    return res.status(200).json({
      success: true,
      message: 'Artikel berhasil dibuat.',
      artikel
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat artikel.',
      error: error.message
    });
  }
      }
