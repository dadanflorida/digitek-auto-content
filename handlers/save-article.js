import { createClient } from '@supabase/supabase-js';

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
    const artikel = req.body || {};

    if (
      !artikel.title ||
      !artikel.content_html ||
      !artikel.meta_description
    ) {
      return res.status(400).json({
        success: false,
        message: 'Data artikel tidak lengkap.'
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('articles')
      .insert({
        title: artikel.title,
        slug: artikel.slug || '',
        meta_description: artikel.meta_description,
        excerpt: artikel.excerpt || '',
        content_html: artikel.content_html,
        keywords: artikel.keywords || [],
        labels: artikel.labels || [],
        faq: artikel.faq || [],
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Artikel berhasil disimpan sebagai draft.',
      article: data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menyimpan artikel.',
      error: error.message
    });
  }
        }
