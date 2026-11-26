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
    'FACEBOOK_PAGE_ACCESS_TOKEN'
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

        // SUSUN PESAN FACEBOOK
    const judul = artikel.title || '';
    const ringkasan =
      artikel.meta_description ||
      artikel.excerpt ||
      '';

    const urlArtikel = artikel.blogger_url || '';

    let pesan = judul;

    if (ringkasan) {
      pesan += '\n\n' + ringkasan;
    }

    if (urlArtikel) {
      pesan += '\n\nBaca selengkapnya:\n' + urlArtikel;
    }

    // KIRIM KE FACEBOOK PAGE
    const graphVersion = 'v23.0';

    const facebookResponse = await fetch(
      `https://graph.facebook.com/${graphVersion}/${process.env.FACEBOOK_PAGE_ID}/feed`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          message: pesan,
          access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN
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
