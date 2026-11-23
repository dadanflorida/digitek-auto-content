import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed.'
    });
  }

  try {
    const { data: saved, error: dbError } = await supabase
      .from('blogger_tokens')
      .select('*')
      .eq('id', 'main')
      .single();

    if (dbError || !saved?.refresh_token) {
      return res.status(401).json({
        success: false,
        message: 'Blogger belum terhubung. Silakan hubungkan akun Google.'
      });
    }

    let accessToken = saved.access_token;

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
        console.error('Google refresh error:', refreshed.error);

        return res.status(401).json({
          success: false,
          message: 'Sesi Blogger perlu dihubungkan ulang.'
        });
      }

      accessToken = refreshed.access_token;

      const { error: updateError } = await supabase
        .from('blogger_tokens')
        .update({
          access_token: accessToken,
          expires_at: new Date(
            Date.now() + refreshed.expires_in * 1000
          ).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', 'main');

      if (updateError) {
        throw new Error('Gagal memperbarui token Blogger.');
      }
    }

    const blogsResponse = await fetch(
      'https://www.googleapis.com/blogger/v3/users/self/blogs',
      {
        headers: {
          Authorization: 'Bearer ' + accessToken
        }
      }
    );

    const blogs = await blogsResponse.json();

    if (!blogsResponse.ok) {
      console.error('Blogger API error:', blogs.error);

      throw new Error('Gagal mengambil daftar blog.');
    }

    return res.status(200).json({
      success: true,
      blogs: (blogs.items || []).map(blog => ({
        id: blog.id,
        name: blog.name,
        url: blog.url
      }))
    });

  } catch (error) {
    console.error('Blogger blogs error:', error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
            }
