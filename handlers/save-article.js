import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
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
    const sourceKeyword = String(
      artikel.source_keyword || ''
    ).trim().toLowerCase();

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

    if (!sourceKeyword) {
      return res.status(400).json({
        success: false,
        message: 'Keyword sumber tidak ditemukan.'
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // SIMPAN ARTIKEL TERLEBIH DAHULU
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

    if (error) throw error;

    // CATAT RIWAYAT KEYWORD MANUAL
    let historyWarning = null;

    try {
      const { data: keywordData, error: keywordError } =
        await supabase
          .from('keyword_pool')
          .select('id')
          .eq('keyword', sourceKeyword)
          .maybeSingle();

      if (keywordError) throw keywordError;

      const { error: historyError } = await supabase
        .from('keyword_usage')
        .insert({
          keyword_id: keywordData?.id || null,
          keyword: sourceKeyword,
          usage_mode: 'manual',
          article_id: data.id
        });

      if (historyError) throw historyError;

    } catch (historyError) {
      console.error(
        'GAGAL MENCATAT RIWAYAT KEYWORD:',
        historyError
      );

      historyWarning =
        'Artikel tersimpan, tetapi riwayat keyword belum tercatat.';
    }

    return res.status(200).json({
      success: true,
      message: 'Artikel berhasil disimpan sebagai draft.',
      article: data,
      history_warning: historyWarning
    });

  } catch (error) {
    console.error('SAVE ARTICLE ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Gagal menyimpan artikel.',
      error: error.message
    });
  }
            }
