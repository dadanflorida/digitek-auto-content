import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  // Hanya menerima GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  // Periksa keamanan CRON_SECRET
  const auth = req.headers.authorization;

  if (
    !process.env.CRON_SECRET ||
    auth !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak.'
    });
  }

  // Periksa konfigurasi Supabase
  if (
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return res.status(500).json({
      success: false,
      message: 'Konfigurasi database belum lengkap.'
    });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Ambil pengaturan jadwal
    const { data, error } = await supabase
      .from('posting_settings')
      .select('*')
      .eq('id', 'main')
      .single();

    if (error) {
      throw error;
    }

    const waktuJakarta = new Intl.DateTimeFormat(
      'id-ID',
      {
        timeZone: 'Asia/Jakarta',
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    ).format(new Date());

    return res.status(200).json({
      success: true,
      message: 'CRON berhasil terhubung.',
      waktu_jakarta: waktuJakarta,
      pengaturan: {
        auto_mode: data.auto_mode,
        articles_per_day: data.articles_per_day,
        posting_time: data.posting_time,
        timezone: data.timezone
      },
      status: 'Pemeriksaan berhasil. Belum ada artikel yang dibuat.'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memeriksa pengaturan.',
      error: error.message
    });
  }
          }
