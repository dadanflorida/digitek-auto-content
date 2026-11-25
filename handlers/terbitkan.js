import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed.'
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

  try {
    const { articleId, blogId } = req.body || {};

    if (!articleId || !blogId) {
      return res.status(400).json({
        success: false,
        message: 'ID artikel dan tujuan blog wajib diisi.'
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // AMBIL ARTIKEL DARI SUPABASE
    const { data: artikel, error: articleError } =
      await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .eq('status', 'draft')
        .single();

    if (articleError || !artikel) {
      return res.status(404).json({
        success: false,
        message: 'Draft artikel tidak ditemukan.'
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
      return res.status(401).json({
        success: false,
        message: 'Koneksi Blogger tidak tersedia.'
      });
    }

    let accessToken = saved.access_token;

    // PERBARUI TOKEN JIKA KEDALUWARSA
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
        throw new Error('Gagal memperbarui sesi Blogger.');
      }

      accessToken = refreshed.access_token;

      const { error: updateTokenError } = await supabase
        .from('blogger_tokens')
        .update({
          access_token: accessToken,
          expires_at: new Date(
            Date.now() + refreshed.expires_in * 1000
          ).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', 'main');

      if (updateTokenError) {
        throw new Error('Gagal menyimpan token Blogger terbaru.');
      }
    }

    // TERBITKAN ARTIKEL KE BLOGGER
    const bloggerResponse = await fetch(
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

    const published = await bloggerResponse.json();

    if (!bloggerResponse.ok) {
      console.error('BLOGGER PUBLISH ERROR:', published.error);

      throw new Error(
        published.error?.message ||
        'Blogger gagal menerbitkan artikel.'
      );
    }

    // PERBARUI STATUS ARTIKEL DI SUPABASE
    const { error: statusError } = await supabase
      .from('articles')
      .update({
        status: 'published'
      })
      .eq('id', articleId)
      .eq('status', 'draft');

    if (statusError) {
      console.error('STATUS UPDATE ERROR:', statusError);
      throw new Error(
        'Artikel sudah dikirim ke Blogger, tetapi status database gagal diperbarui.'
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Artikel berhasil diterbitkan ke Blogger.',
      url: published.url,
      blogger_post_id: published.id
    });

  } catch (error) {
    console.error('TERBITKAN ARTIKEL ERROR:', error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
        }
