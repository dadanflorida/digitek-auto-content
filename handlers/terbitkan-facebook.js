import { createClient } from '@supabase/supabase-js';

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

  const requiredEnv = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'FACEBOOK_PAGE_ID',
  ];

  const missingEnv = requiredEnv.filter(
    key => !process.env[key]
  );

  if (missingEnv.length > 0) {
    return res.status(500).json({
      success: false,
      message: 'Konfigurasi Facebook belum lengkap.',
      missing: missingEnv
    });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  let articleId = null;
  let locked = false;

  try {

  // AMBIL PAGE ACCESS TOKEN TERBARU DARI SUPABASE
const { data: facebookToken, error: tokenError } =
  await supabase
    .from('facebook_tokens')
    .select('page_access_token')
    .eq('id', 'main')
    .single();

if (
  tokenError ||
  !facebookToken ||
  !facebookToken.page_access_token
) {
  return res.status(500).json({
    success: false,
    message: 'Token Facebook belum tersedia. Silakan perbarui token terlebih dahulu.'
  });
}

const pageAccessToken = facebookToken.page_access_token;

  
    const { articleId: id } = req.body || {};
    articleId = id;

    if (!articleId) {
      return res.status(400).json({
        success: false,
        message: 'ID artikel wajib diisi.'
      });
    }

    // AMBIL ARTIKEL
    const { data: artikel, error: articleError } =
      await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

    if (articleError || !artikel) {
      return res.status(404).json({
        success: false,
        message: 'Artikel tidak ditemukan.'
      });
    }

    // BANNER WAJIB ADA SEBELUM PUBLIKASI
const imageUrl = artikel.facebook_image_url;

if (!imageUrl) {
  return res.status(400).json({
    success: false,
    message: 'Banner artikel belum dibuat. Buat banner terlebih dahulu.'
  });
}

    // CEK STATUS FACEBOOK
    const statusFacebook =
      artikel.facebook_status || 'pending';

    if (
      !['pending', 'failed'].includes(statusFacebook)
    ) {
      return res.status(409).json({
        success: false,
        message:
          'Artikel tidak dapat dikirim ulang. Status Facebook: ' +
          statusFacebook
      });
    }

    // KUNCI PUBLIKASI FACEBOOK
    const { data: lockData, error: lockError } =
      await supabase
        .from('articles')
        .update({
          facebook_status: 'publishing',
          facebook_page_id: process.env.FACEBOOK_PAGE_ID,
          facebook_attempted_at: new Date().toISOString(),
          facebook_error: null
        })
        .eq('id', articleId)
        .in('facebook_status', ['pending', 'failed'])
        .select('id')
        .maybeSingle();

    if (lockError) throw lockError;

    if (!lockData) {
      return res.status(409).json({
        success: false,
        message:
          'Artikel sedang diproses atau sudah diterbitkan ke Facebook.'
      });
    }

    locked = true;

        // SUSUN CAPTION FACEBOOK
const judul = artikel.title || '';

const ringkasan =
artikel.meta_description ||
artikel.excerpt ||
'';

let caption =
(artikel.facebook_caption || '').trim();

if (!caption) {
caption = [judul, ringkasan]
.filter(Boolean)
.join('\n\n');
}

const urlArtikel = (artikel.blogger_url || '').trim();

if (urlArtikel && !caption.includes(urlArtikel)) {
caption +=
'\n\nBaca artikel selengkapnya di sini:\n' +
urlArtikel;
}

// KIRIM BANNER + CAPTION KE FACEBOOK
const graphVersion = 'v27.0';

const facebookResponse = await fetch(
  `https://graph.facebook.com/${graphVersion}/${process.env.FACEBOOK_PAGE_ID}/photos`,
{
method: 'POST',
headers: {
'Content-Type': 'application/x-www-form-urlencoded'
},
body: new URLSearchParams({
url: imageUrl,
caption,
access_token: pageAccessToken
})
}
);
    let facebookResult;

    try {
      facebookResult = await facebookResponse.json();
    } catch {
      facebookResult = {};
    }

    // JIKA RESPONS FACEBOOK TIDAK BERHASIL
    if (!facebookResponse.ok || !facebookResult.id) {

      const errorMessage =
        facebookResult.error?.message ||
        'Facebook menolak permintaan publikasi.';

      const uncertain =
        facebookResponse.status >= 500 ||
        facebookResponse.status === 408 ||
        facebookResponse.status === 429;

      await supabase
        .from('articles')
        .update({
          facebook_status: uncertain
            ? 'uncertain'
            : 'failed',
          facebook_error: errorMessage
        })
        .eq('id', articleId)
        .eq('facebook_status', 'publishing');

      locked = false;

      return res.status(
        uncertain ? 503 : 400
      ).json({
        success: false,
        message: uncertain
          ? 'Hasil pengiriman belum dapat dipastikan. Periksa halaman Facebook sebelum mencoba kembali.'
          : errorMessage,
        facebook_status: uncertain
          ? 'uncertain'
          : 'failed'
      });
    }

      // SIMPAN HASIL PUBLIKASI
    const postId = String(
  facebookResult.post_id || facebookResult.id
);
    const facebookUrl =
      `https://www.facebook.com/${postId}`;

    const { data: updated, error: updateError } =
      await supabase
        .from('articles')
        .update({
          facebook_status: 'published',
          facebook_post_id: postId,
          facebook_url: facebookUrl,
          facebook_published_at: new Date().toISOString(),
          facebook_error: null
        })
        .eq('id', articleId)
        .eq('facebook_status', 'publishing')
        .select('id')
        .maybeSingle();

    if (updateError || !updated) {
      console.error(
        'FACEBOOK STATUS UPDATE ERROR:',
        updateError
      );

      return res.status(500).json({
        success: false,
        message:
          'Facebook mungkin sudah menerbitkan artikel, tetapi pencatatan Supabase gagal. Jangan kirim ulang sebelum diperiksa.'
      });
    }

    locked = false;

    return res.status(200).json({
      success: true,
      message: 'Artikel berhasil diterbitkan ke Facebook.',
      facebook_post_id: postId,
      facebook_url: facebookUrl
    });

  } catch (error) {
    console.error('FACEBOOK PUBLISH ERROR:', error);

    // JIKA PROSES TERHENTI SETELAH ARTIKEL DIKUNCI
    // HASIL PENGIRIMAN DIANGGAP BELUM PASTI
    if (locked && articleId) {
      await supabase
        .from('articles')
        .update({
          facebook_status: 'uncertain',
          facebook_error:
            'Proses terhenti. Periksa Fanpage sebelum mencoba kembali.'
        })
        .eq('id', articleId)
        .eq('facebook_status', 'publishing');
    }

    return res.status(500).json({
      success: false,
      message:
        'Terjadi kesalahan. Periksa status publikasi Facebook sebelum mencoba kembali.'
    });
  }
}
