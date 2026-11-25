import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Normalisasi HTML untuk pencocokan isi artikel
function normalisasiIsi(html = '') {
  return String(html)
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed.'
    });
  }

  // KEAMANAN API
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

  try {
    const { articleId } = req.body || {};

    if (!articleId) {
      return res.status(400).json({
        success: false,
        message: 'ID artikel wajib diisi.'
      });
    }

    // AMBIL ARTIKEL YANG TERTAHAN
    const { data: artikel, error: articleError } =
      await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .eq('status', 'publishing')
        .single();

    if (articleError || !artikel) {
      return res.status(404).json({
        success: false,
        message: 'Artikel publishing tidak ditemukan.'
      });
    }

    if (!artikel.blogger_blog_id) {
      return res.status(409).json({
        success: false,
        message: 'ID blog tujuan belum tersedia. Pemeriksaan dibatalkan.'
      });
    }

    // AMBIL TOKEN BLOGGER
    const { data: saved, error: tokenError } =
      await supabase
        .from('blogger_tokens')
        .select('*')
        .eq('id', 'main')
        .single();

    if (tokenError || !saved?.refresh_token) {
      return res.status(401).json({
        success: false,
        message: 'Koneksi Blogger tidak tersedia.'
      });
    }

    let accessToken = saved.access_token;

    // PERBARUI TOKEN JIKA KEDALUWARSA
    const expired =
      !saved.expires_at ||
      new Date(saved.expires_at).getTime() < Date.now() + 60000;

    if (expired) {
      const refreshResponse = await fetch(
        'https://oauth2.googleapis.com/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: saved.refresh_token,
            grant_type: 'refresh_token'
          })
        }
      );

      const refreshed = await refreshResponse.json();

      if (!refreshResponse.ok) {
        return res.status(401).json({
          success: false,
          message: 'Gagal memperbarui sesi Blogger.'
        });
      }

      accessToken = refreshed.access_token;

      const { error: updateTokenError } = await supabase
        .from('blogger_tokens')
        .update({
          access_token: accessToken,
          expires_at: new Date(
            Date.now() + refreshed.expires_in * 1000
          ).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', 'main');

      if (updateTokenError) throw updateTokenError;
    }

    // AMBIL POSTINGAN LIVE DARI BLOGGER
const waktuPercobaan = artikel.publish_attempted_at
  ? new Date(
      new Date(artikel.publish_attempted_at).getTime() -
      24 * 60 * 60 * 1000
    ).toISOString()
  : undefined;

const liveParams = new URLSearchParams({
  status: 'live',
  fetchBodies: 'true',
  maxResults: '500',
  orderBy: 'published'
});

if (waktuPercobaan) {
  liveParams.set('startDate', waktuPercobaan);
}

let livePosts = [];
let pageToken = null;
let halaman = 0;

do {
  if (pageToken) {
    liveParams.set('pageToken', pageToken);
  }

  const liveUrl =
    'https://www.googleapis.com/blogger/v3/blogs/' +
    encodeURIComponent(artikel.blogger_blog_id) +
    '/posts?' +
    liveParams.toString();

  const liveResponse = await fetch(liveUrl, {
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  });

  const liveResult = await liveResponse.json();

  if (!liveResponse.ok) {
    console.error('BLOGGER LIVE ERROR:', liveResult);

    return res.status(502).json({
      success: false,
      message: 'Gagal mengambil daftar artikel yang sudah terbit.'
    });
  }

  livePosts.push(...(liveResult.items || []));

  pageToken = liveResult.nextPageToken || null;
  halaman++;

} while (pageToken && halaman < 5);

// JANGAN MENYIMPULKAN JIKA PEMERIKSAAN BELUM LENGKAP
if (pageToken) {
  return res.status(200).json({
    success: true,
    found: false,
    message: 'Pemeriksaan belum lengkap. Status tetap publishing.'
  });
}

// COCOKKAN JUDUL DAN ISI
const artikelCocok = livePosts.filter(post => {
  const judulSama =
    String(post.title || '').trim() ===
    String(artikel.title || '').trim();

  const isiSama =
    normalisasiIsi(post.content) ===
    normalisasiIsi(artikel.content_html);

  return (
    judulSama &&
    isiSama &&
    Boolean(post.id && post.published && post.url)
  );
});

// JIKA TIDAK DITEMUKAN, JANGAN UBAH STATUS
if (artikelCocok.length === 0) {
  return res.status(200).json({
    success: true,
    found: false,
    message: 'Artikel belum ditemukan di Blogger. Status tetap publishing.'
  });
}
    
    // HASIL GANDA: JANGAN PILIH SEMBARANGAN
    if (artikelCocok.length > 1) {
      return res.status(409).json({
        success: false,
        found: true,
        message: 'Ditemukan lebih dari satu postingan yang cocok. Pemeriksaan manual diperlukan.'
      });
    }

    const post = artikelCocok[0];

    // SIMPAN HASIL PEMERIKSAAN
    const { data: updated, error: updateError } =
      await supabase
        .from('articles')
        .update({
          status: 'published',
          blogger_blog_id: String(artikel.blogger_blog_id),
          blogger_post_id: String(post.id),
          blogger_url: post.url,
          published_at: post.published
        })
        .eq('id', artikel.id)
        .eq('status', 'publishing')
        .select('id')
        .maybeSingle();

    if (updateError || !updated) {
      console.error('SUPABASE RECOVERY ERROR:', updateError);

      return res.status(500).json({
        success: false,
        found: true,
        message: 'Postingan ditemukan, tetapi status Supabase belum berhasil diperbarui.'
      });
    }

    return res.status(200).json({
      success: true,
      found: true,
      message: 'Artikel berhasil dikenali dan status diperbarui menjadi published.',
      blogger_post_id: post.id,
      blogger_url: post.url
    });

  } catch (error) {
    console.error('PERIKSA PUBLIKASI ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memeriksa publikasi.'
    });
  }
      }
