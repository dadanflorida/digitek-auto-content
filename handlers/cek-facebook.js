import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed.'
    });
  }

  if (
    !process.env.MANUAL_GENERATE_SECRET ||
    req.headers.authorization !==
      `Bearer ${process.env.MANUAL_GENERATE_SECRET}`
  ) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak.'
    });
  }

  const pageId = process.env.FACEBOOK_PAGE_ID;

  if (
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !pageId
  ) {
    return res.status(500).json({
      success: false,
      message: 'Konfigurasi belum lengkap.'
    });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('facebook_tokens')
      .select('page_access_token, user_access_token')
      .eq('id', 'main')
      .single();

    if (error || !data?.page_access_token) {
      return res.status(401).json({
        success: false,
        message: 'Page Access Token tidak ditemukan.'
      });
    }

    if (!data.user_access_token) {
      return res.status(401).json({
        success: false,
        message: 'User Access Token tidak ditemukan.'
      });
    }

    // 1. PERIKSA IDENTITAS FANPAGE
    const pageUrl = new URL(
      `https://graph.facebook.com/v27.0/${encodeURIComponent(pageId)}`
    );

    pageUrl.searchParams.set('fields', 'id,name');
    pageUrl.searchParams.set(
      'access_token',
      data.page_access_token
    );

    const pageResponse = await fetch(pageUrl);
    const pageResult = await pageResponse.json();

    if (!pageResponse.ok || !pageResult.id) {
      return res.status(401).json({
        success: false,
        message: 'Pemeriksaan identitas Fanpage gagal.'
      });
    }

    // 2. PERIKSA IZIN USER ACCESS TOKEN
    const permissionUrl = new URL(
      'https://graph.facebook.com/v27.0/me/permissions'
    );

    permissionUrl.searchParams.set(
      'access_token',
      data.user_access_token
    );

    const permissionResponse = await fetch(permissionUrl);
    const permissionResult = await permissionResponse.json();

    if (
      !permissionResponse.ok ||
      !Array.isArray(permissionResult.data)
    ) {
      return res.status(401).json({
        success: false,
        message: 'Gagal membaca izin akun Facebook.'
      });
    }

    const permissions = permissionResult.data;

    const statusIzin = nama => {
      const item = permissions.find(
        p => p.permission === nama
      );

      return item?.status || 'not_granted';
    };

    const hasil = {
      pages_manage_posts: statusIzin('pages_manage_posts'),
      pages_read_engagement: statusIzin('pages_read_engagement'),
      pages_show_list: statusIzin('pages_show_list')
    };

    return res.status(200).json({
      success: true,
      message: 'Pemeriksaan Facebook selesai.',
      page_name: pageResult.name,
      page_id: pageResult.id,
      page_id_matches: String(pageResult.id) === String(pageId),
      permissions: hasil,
      publishing_permission_ready:
        hasil.pages_manage_posts === 'granted' &&
        hasil.pages_read_engagement === 'granted'
    });

  } catch (error) {
    console.error(
      'CHECK FACEBOOK ERROR:',
      error.message
    );

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memeriksa Facebook.'
    });
  }
        }
