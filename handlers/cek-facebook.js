import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
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

  const pageId = process.env.FACEBOOK_PAGE_ID;

  if (
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !pageId
  ) {
    return res.status(500).json({
      success: false,
      message: 'Konfigurasi Facebook belum lengkap.'
    });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('facebook_tokens')
      .select('page_access_token')
      .eq('id', 'main')
      .single();

    if (error || !data?.page_access_token) {
      return res.status(401).json({
        success: false,
        message: 'Page Access Token tidak ditemukan.'
      });
    }

    const graphUrl =
      `https://graph.facebook.com/v27.0/${encodeURIComponent(pageId)}` +
      `?fields=id,name&access_token=${encodeURIComponent(data.page_access_token)}`;

    const response = await fetch(graphUrl);
    const result = await response.json();

    if (!response.ok || !result.id) {
      console.error(
        'FACEBOOK CONNECTION CHECK FAILED:',
        result.error?.message || 'Unknown error'
      );

      return res.status(401).json({
        success: false,
        message: 'Facebook menolak token atau akses halaman.',
        detail: result.error?.message || 'Pemeriksaan gagal.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Koneksi Facebook berhasil.',
      page_id: result.id,
      page_name: result.name,
      page_id_matches: String(result.id) === String(pageId)
    });

  } catch (error) {
    console.error('CHECK FACEBOOK ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Gagal memeriksa koneksi Facebook.'
    });
  }
}
