import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
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

  // FILTER STATUS
  const status = req.query.status;

  const statusValid = ['draft', 'published', 'archived'];

  if (status && !statusValid.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status artikel tidak valid.'
    });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    let query = supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        meta_description,
        status,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.status(200).json({
      success: true,
      total: data.length,
      articles: data
    });

  } catch (error) {
    console.error('LIST ARTICLES ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar artikel.',
      error: error.message
    });
  }
      }
