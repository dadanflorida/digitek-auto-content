import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method tidak diizinkan.'
    });
  }

  try {
    const { keywords } = req.body || {};

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data keyword tidak ditemukan.'
      });
    }

    if (keywords.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Jumlah keyword melebihi batas.'
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const keywordData = keywords
      .filter(item =>
        item.keyword &&
        item.category &&
        item.intent
      )
      .map(item => ({
        keyword: item.keyword.trim().toLowerCase(),
        category: item.category,
        relevance: item.intent,
        source: 'riset_keyword',
        status: 'available',
        updated_at: new Date().toISOString()
      }));

    if (keywordData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada keyword valid.'
      });
    }

    const { error } = await supabase
      .from('keyword_pool')
      .upsert(keywordData, {
        onConflict: 'keyword',
        ignoreDuplicates: true
      });

    if (error) {
      console.error('KEYWORD POOL ERROR:', error);

      throw new Error('Gagal menyimpan keyword ke database.');
    }

    return res.status(200).json({
      success: true,
      message: 'Riset Keyword berhasil disimpan.',
      saved_keywords: keywordData.length
    });

  } catch (error) {
    console.error('KEYWORD POOL ERROR:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
      }
