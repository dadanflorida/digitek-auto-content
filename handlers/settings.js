import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  // AMBIL PENGATURAN
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('posting_settings')
      .select('*')
      .eq('id', 'main')
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    return res.status(200).json({
      success: true,
      settings: data
    });
  }

  // SIMPAN PENGATURAN
  if (req.method === 'POST') {
    const {
      auto_mode,
      auto_publish,
      articles_per_day,
      posting_time,
      publishing_time
    } = req.body || {};

    if (
      typeof auto_mode !== 'boolean' ||
      typeof auto_publish !== 'boolean' ||
      !Number.isInteger(Number(articles_per_day)) ||
      Number(articles_per_day) < 1 ||
      Number(articles_per_day) > 3 ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(posting_time || '') ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(publishing_time || '')
    ) {
      return res.status(400).json({
        success: false,
        message: 'Pengaturan tidak valid.'
      });
    }

    const { data, error } = await supabase
      .from('posting_settings')
      .update({
        auto_mode,
        auto_publish,
        articles_per_day: Number(articles_per_day),
        posting_time,
        publishing_time,
        updated_at: new Date().toISOString()
      })
      .eq('id', 'main')
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Pengaturan berhasil disimpan.',
      settings: data
    });
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed.'
  });
}
