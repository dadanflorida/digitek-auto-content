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

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  let articleId;

  try {
    const { articleId: id, blogId } = req.body || {};
    articleId = id;

    if (!articleId || !blogId) {
      return res.status(400).json({
        success: false,
        message: 'ID artikel dan blog wajib diisi.'
      });
    }

    // AMBIL DRAFT
    const { data: artikel, error: articleError } =
      await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .eq('status', 'draft')
        .single();

    if (articleError || !artikel) {
      return res.status(409).json({
        success: false,
        message: 'Draft tidak ditemukan atau sedang diproses.'
      });
    }

    // KUNCI ARTIKEL DAN SIMPAN TUJUAN PUBLIKASI
const { data: locked, error: lockError } =
  await supabase
    .from('articles')
    .update({
  status: 'publishing',
  blogger_blog_id: String(blogId)
})
    .eq('id', articleId)
    .eq('status', 'draft')
    .select('id')
    .maybeSingle();

    if (lockError) throw lockError;

    if (!locked) {
      return res.status(409).json({
        success: false,
        message: 'Artikel sudah diproses atau sudah diterbitkan.'
      });
    }

    // AMBIL TOKEN BLOGGER
    const { data: saved, error: tokenError } =
      await supabase
        .from('blogger_tokens')
        .select('*')
        .eq('id', 'main')
        .single();

    if (tokenError || !saved?.refresh_token) {
      await supabase
        .from('articles')
        .update({ status: 'draft' })
        .eq('id', articleId)
        .eq('status', 'publishing');

      return res.status(401).json({
        success: false,
        message: 'Koneksi Blogger tidak tersedia.'
      });
    }

    let accessToken = saved.access_token;

    // REFRESH TOKEN JIKA KEDALUWARSA
    const expired =
      !saved.expires_at ||
      new Date(saved.expires_at).getTime() < Date.now() + 60000;

    if (expired) {
      const refreshResponse = await fetch(
        'https://oauth2.googleapis.com/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: saved.refresh_token,
            grant_type: 'refresh_token'
          })
        }
      );

      const refreshed = await refreshResponse.json();

      if (!refreshResponse.ok) {
        await supabase
          .from('articles')
          .update({ status: 'draft' })
          .eq('id', articleId)
          .eq('status', 'publishing');

        return res.status(401).json({
          success: false,
          message: 'Gagal memperbarui sesi Blogger.'
        });
      }

      accessToken = refreshed.access_token;

      const { error: tokenUpdateError } = await supabase
        .from('blogger_tokens')
        .update({
          access_token: accessToken,
          expires_at: new Date(
            Date.now() + refreshed.expires_in * 1000
          ).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', 'main');

      if (tokenUpdateError) throw tokenUpdateError;
    }

    // CATAT WAKTU SEBELUM MENGIRIM KE BLOGGER
const { data: attemptRecorded, error: attemptRecordError } =
  await supabase
    .from('articles')
    .update({
      publish_attempted_at: new Date().toISOString()
    })
    .eq('id', articleId)
    .eq('status', 'publishing')
    .select('id')
    .maybeSingle();

if (attemptRecordError || !attemptRecorded) {
  console.error('PUBLISH ATTEMPT RECORD ERROR:', attemptRecordError);

  return res.status(500).json({
    success: false,
    message: 'Waktu percobaan gagal dicatat. Pengiriman ke Blogger dibatalkan.'
  });
    }

    // KIRIM KE BLOGGER
    let bloggerResponse;

    try {
      bloggerResponse = await fetch(
        `https://www.googleapis.com/blogger/v3/blogs/${encodeURIComponent(blogId)}/posts/`,
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            kind: 'blogger#post',
            title: artikel.title,
            content: artikel.content_html,
            labels: artikel.labels || [],
            isDraft: false
          })
        }
      );
    } catch (networkError) {
      // JANGAN KEMBALIKAN KE DRAFT.
      // Hasil pengiriman belum dapat dipastikan.
      console.error('BLOGGER NETWORK ERROR:', networkError);

      return res.status(503).json({
        success: false,
        message: 'Hasil pengiriman belum dapat dipastikan. Artikel dikunci untuk mencegah publikasi ganda. Perlu pemeriksaan sebelum mencoba ulang.'
      });
    }

    const published = await bloggerResponse.json();

    if (!bloggerResponse.ok) {

  // JIKA HASILNYA BELUM PASTI, JANGAN KEMBALIKAN KE DRAFT
  if (
    bloggerResponse.status >= 500 ||
    bloggerResponse.status === 408 ||
    bloggerResponse.status === 429
  ) {
    console.error('BLOGGER UNCERTAIN RESPONSE:', published);

    return res.status(503).json({
      success: false,
      message: 'Respons Blogger belum dapat dipastikan. Artikel tetap dikunci untuk pemeriksaan sebelum mencoba ulang.'
    });
  }

  // JIKA BLOGGER JELAS MENOLAK PERMINTAAN
  await supabase
    .from('articles')
    .update({ status: 'draft' })
    .eq('id', articleId)
    .eq('status', 'publishing');

  return res.status(400).json({
    success: false,
    message:
      published.error?.message ||
      'Blogger menolak permintaan penerbitan.'
  });
    }

    // SIMPAN HASIL PENERBITAN
    const { data: updated, error: statusError } =
      await supabase
        .from('articles')
        .update({
          status: 'published',
          blogger_blog_id: String(blogId),
          blogger_post_id: String(published.id),
          blogger_url: published.url || null,
          published_at: new Date().toISOString()
        })
        .eq('id', articleId)
        .eq('status', 'publishing')
        .select('id')
        .maybeSingle();

    if (statusError || !updated) {
      console.error('PUBLISH STATUS ERROR:', statusError);

      return res.status(500).json({
        success: false,
        message: 'Blogger mungkin sudah menerbitkan artikel, tetapi pencatatan Supabase belum berhasil. Jangan mencoba menerbitkan ulang.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Artikel berhasil diterbitkan.',
      url: published.url,
      blogger_post_id: published.id
    });

  } catch (error) {
    console.error('TERBITKAN ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan. Jika artikel sudah berstatus publishing, jangan mencoba ulang sebelum diperiksa.',
      error: error.message
    });
  }
}
