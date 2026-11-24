import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method tidak diizinkan.'
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

    const keywordData = keywords
      .filter(item =>
        item &&
        typeof item.keyword === 'string' &&
        item.keyword.trim() &&
        typeof item.category === 'string' &&
        typeof item.intent === 'string'
      )
      .map(item => ({
        keyword: item.keyword.trim().toLowerCase(),
        category: item.category.trim(),
        intent: item.intent.trim()
      }));

    const uniqueKeywords = [
      ...new Map(
        keywordData.map(item => [item.keyword, item])
      ).values()
    ];

    if (uniqueKeywords.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada keyword valid.'
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const names = uniqueKeywords.map(item => item.keyword);

    const { data: existing, error: lookupError } =
      await supabase
        .from('keyword_pool')
        .select('id, keyword, source')
        .in('keyword', names);

    if (lookupError) throw lookupError;

    const existingMap = new Map(
      (existing || []).map(item => [
        item.keyword,
        item
      ])
    );

    const toInsert = [];
    const toUpdate = [];

    for (const item of uniqueKeywords) {
      const old = existingMap.get(item.keyword);

      if (!old) {
        toInsert.push({
          ...item,
          relevance: 'Relevan',
          source: 'riset_keyword',
          status: 'available'
        });

      } else if (old.source === 'riset_keyword') {
        toUpdate.push({
          ...item,
          id: old.id,
          source: old.source
        });

      } else {
        // Keyword dari sumber lain tidak ditimpa.
        // Hanya tambahkan informasi search intent.
        toUpdate.push({
          id: old.id,
          intent: item.intent
        });
      }
    }

    if (toInsert.length > 0) {
      const { error } = await supabase
        .from('keyword_pool')
        .insert(toInsert);

      if (error) throw error;
    }

    for (const item of toUpdate) {
      const updateData = item.source === 'riset_keyword'
        ? {
            category: item.category,
            relevance: 'Relevan',
            intent: item.intent,
            updated_at: new Date().toISOString()
          }
        : {
            intent: item.intent,
            updated_at: new Date().toISOString()
          };

      const { error } = await supabase
        .from('keyword_pool')
        .update(updateData)
        .eq('id', item.id);

      if (error) throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Riset Keyword berhasil disimpan.',
      total_keywords: uniqueKeywords.length,
      inserted_keywords: toInsert.length,
      updated_keywords: toUpdate.length
    });

  } catch (error) {
    console.error('KEYWORD POOL ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Gagal menyimpan keyword ke database.',
      detail: error.message
    });
  }
          }
