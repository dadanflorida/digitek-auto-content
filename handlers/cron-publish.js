import { createClient } from '@supabase/supabase-js';

function waktuJakarta() {
const parts = new Intl.DateTimeFormat('en-CA', {
timeZone: 'Asia/Jakarta',
year: 'numeric',
month: '2-digit',
day: '2-digit',
hour: '2-digit',
minute: '2-digit',
hourCycle: 'h23'
}).formatToParts(new Date());

return Object.fromEntries(
parts.map(p => [p.type, p.value])
);
}

export default async function handler(req, res) {
res.setHeader('Cache-Control', 'no-store');

if (req.method !== 'GET') {
return res.status(405).json({
success: false,
message: 'Method not allowed.'
});
}

if (
!process.env.CRON_SECRET ||
req.headers.authorization !==
`Bearer ${process.env.CRON_SECRET}`
) {
return res.status(401).json({
success: false,
message: 'Akses ditolak.'
});
}

const requiredEnv = [
'SUPABASE_URL',
'SUPABASE_SERVICE_ROLE_KEY',
'MANUAL_GENERATE_SECRET'
];

const missing = requiredEnv.filter(
key => !process.env[key]
);

if (missing.length) {
return res.status(500).json({
success: false,
message: 'Konfigurasi server belum lengkap.',
missing
});
}

try {
const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
);

// PERIKSA PENGATURAN
const { data: setting, error: settingError } =
  await supabase
    .from('posting_settings')
    .select('*')
    .eq('id', 'main')
    .single();

if (settingError) throw settingError;

if (!setting.auto_publish) {
  console.log(
    'AUTO PUBLISH STATUS:',
    'OFF',
    '| Waktu:',
    new Date().toISOString()
  );

  return res.status(200).json({
    success: true,
    message: 'Mesin penerbitan otomatis sedang OFF.'
  });
}

if (!setting.blogger_blog_id) {
  return res.status(400).json({
    success: false,
    message: 'Blog tujuan belum dikonfigurasi.'
  });
}

const sekarang = waktuJakarta();
const jamSekarang =
  `${sekarang.hour}:${sekarang.minute}`;

const jadwal = String(
  setting.publishing_time
).slice(0, 5);

const menitSekarang =
  Number(sekarang.hour) * 60 +
  Number(sekarang.minute);

const [jamJadwal, menitJadwal] =
  jadwal.split(':').map(Number);

const menitTarget =
  jamJadwal * 60 + menitJadwal;

if (
  menitSekarang < menitTarget ||
  menitSekarang >= menitTarget + 15
) {
  return res.status(200).json({
    success: true,
    message: 'Belum waktunya menerbitkan artikel.',
    waktu_jakarta: jamSekarang,
    jadwal
  });
}

  // KUNCI EKSEKUSI HARIAN
const runKey =
  `${sekarang.year}-${sekarang.month}-${sekarang.day}_${jadwal}`;

const { data: berhasilDikunci, error: lockError } =
  await supabase.rpc('claim_auto_publish', {
    p_run_key: runKey
  });

if (lockError) throw lockError;

if (!berhasilDikunci) {
  return res.status(200).json({
    success: true,
    message: 'Jadwal penerbitan hari ini sudah dijalankan.',
    run_key: runKey
  });
}

const host = req.headers['x-forwarded-host'] ||
  req.headers.host;

if (!host) {
  throw new Error('Alamat server tidak ditemukan.');
}

const baseUrl = `https://${host}`;

const hasil = [];

// AMBIL DRAFT SIAP TERBIT
const { data: drafts, error: draftError } =
  await supabase
    .from('articles')
    .select('id, title, facebook_status, facebook_image_url')
    .eq('status', 'draft')
    .order('created_at', { ascending: true })
    .limit(5);

if (draftError) throw draftError;

// AMBIL ARTIKEL BLOGGER TERBIT
// YANG FACEBOOK-NYA BELUM SELESAI
const { data: facebookPending, error: facebookError } =
  await supabase
    .from('articles')
    .select('id, title, facebook_status, facebook_image_url')
    .eq('status', 'published')
    .in('facebook_status', ['pending', 'failed'])
    .not('blogger_post_id', 'is', null)
    .limit(5);

if (facebookError) throw facebookError;

const daftar = new Map();

[...(drafts || []), ...(facebookPending || [])]
  .forEach(item => daftar.set(item.id, item));

for (const artikel of daftar.values()) {

  const catatan = {
    article_id: artikel.id,
    title: artikel.title,
    blogger: 'belum diproses',
    facebook: 'belum diproses'
  };

  // TERBITKAN KE BLOGGER JIKA MASIH DRAFT
  if (drafts.some(item => item.id === artikel.id)) {
    try {
      const response = await fetch(
        `${baseUrl}/api/terbitkan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              `Bearer ${process.env.MANUAL_GENERATE_SECRET}`
          },
          body: JSON.stringify({
            articleId: artikel.id,
            blogId: setting.blogger_blog_id
          })
        }
      );

      const result = await response.json();

      catatan.blogger = response.ok && result.success
        ? 'berhasil'
        : result.message || 'gagal';

    } catch (error) {
      catatan.blogger = 'hasil belum dapat dipastikan';
      console.error('AUTO BLOGGER ERROR:', error);
    }
  } else {
    catatan.blogger = 'sudah diterbitkan';
  }

  // PERIKSA STATUS FACEBOOK TERBARU
  const { data: terbaru, error: terbaruError } =
    await supabase
      .from('articles')
      .select('facebook_status, facebook_image_url')
      .eq('id', artikel.id)
      .single();

  if (terbaruError) {
    catatan.facebook = 'gagal membaca status';
    hasil.push(catatan);
    continue;
  }

  if (
  ['published', 'publishing', 'uncertain', 'failed'].includes(
    terbaru.facebook_status
  )
) {
    catatan.facebook =
      'dilewati: status ' + terbaru.facebook_status;
  } else if (!terbaru.facebook_image_url) {
    catatan.facebook = 'menunggu banner';
  } else {
    // TERBITKAN KE FACEBOOK
    try {
      const response = await fetch(
        `${baseUrl}/api/terbitkan-facebook`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              `Bearer ${process.env.MANUAL_GENERATE_SECRET}`
          },
          body: JSON.stringify({
            articleId: artikel.id
          })
        }
      );

      const result = await response.json();

      catatan.facebook = response.ok && result.success
        ? 'berhasil'
        : result.message || 'gagal';

    } catch (error) {
      catatan.facebook =
        'hasil belum dapat dipastikan';

      console.error('AUTO FACEBOOK ERROR:', error);
    }
  }

  hasil.push(catatan);
}

return res.status(200).json({
  success: true,
  message: 'Pemeriksaan penerbitan otomatis selesai.',
  waktu_jakarta: jamSekarang,
  hasil
});

} catch (error) {
console.error('CRON PUBLISH ERROR:', error);

return res.status(500).json({
  success: false,
  message: 'Mesin penerbitan otomatis gagal dijalankan.',
  error: error.message
});

}
  }
