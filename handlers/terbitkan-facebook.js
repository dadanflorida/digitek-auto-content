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
