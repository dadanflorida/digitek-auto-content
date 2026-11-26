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
    !process.env.FACEBOOK_TOKEN_SETUP_SECRET ||
    auth !== `Bearer ${process.env.FACEBOOK_TOKEN_SETUP_SECRET}`
  ) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak.'
    });
  }

  const {
    FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET,
    FACEBOOK_USER_TOKEN,
    FACEBOOK_PAGE_ID,
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  } = process.env;

  if (
    !FACEBOOK_APP_ID ||
    !FACEBOOK_APP_SECRET ||
    !FACEBOOK_USER_TOKEN ||
    !FACEBOOK_PAGE_ID ||
    !SUPABASE_URL ||
    !SUPABASE_SERVICE_ROLE_KEY
  ) {
    return res.status(500).json({
      success: false,
      message: 'Environment belum lengkap.'
    });
  }

  const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // 1. Tukar User Token menjadi Long-Lived Token
    const exchangeResponse = await fetch(
      'https://graph.facebook.com/v27.0/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'fb_exchange_token',
          client_id: FACEBOOK_APP_ID,
          client_secret: FACEBOOK_APP_SECRET,
          fb_exchange_token: FACEBOOK_USER_TOKEN
        })
      }
    );

    const exchange = await exchangeResponse.json();

    if (!exchangeResponse.ok || !exchange.access_token) {
      return res.status(400).json({
        success: false,
        message: exchange.error?.message ||
          'Pertukaran User Token gagal.'
      });
    }

    const userToken = exchange.access_token;

    // 2. Ambil Page Access Token
    const accountsUrl = new URL(
      'https://graph.facebook.com/v27.0/me/accounts'
    );

    accountsUrl.searchParams.set('fields', 'id,name,access_token');
    accountsUrl.searchParams.set('access_token', userToken);

    const accountsResponse = await fetch(accountsUrl);
    const accounts = await accountsResponse.json();

    if (!accountsResponse.ok || !accounts.data) {
      return res.status(400).json({
        success: false,
        message: accounts.error?.message ||
          'Gagal mengambil daftar halaman Facebook.'
      });
    }

    const page = accounts.data.find(
      item => item.id === FACEBOOK_PAGE_ID
    );

    if (!page || !page.access_token) {
      return res.status(400).json({
        success: false,
        message: 'Page Digitek Store tidak ditemukan atau token tidak tersedia.'
      });
    }

    // 3. Simpan token di Supabase
    const userExpiry = exchange.expires_in
      ? new Date(Date.now() + exchange.expires_in * 1000).toISOString()
      : null;

    const { error } = await supabase
      .from('facebook_tokens')
      .upsert({
        id: 'main',
        user_access_token: userToken,
        user_token_expires_at: userExpiry,
        page_access_token: page.access_token,
        page_token_expires_at: null,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('FACEBOOK TOKEN STORAGE ERROR:', error.message);

      return res.status(500).json({
        success: false,
        message: 'Token diperoleh, tetapi gagal disimpan.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Long-Lived User Token dan Page Access Token berhasil disimpan.',
      expires_days: exchange.expires_in
        ? Math.floor(exchange.expires_in / 86400)
        : null
    });

  } catch (error) {
    console.error('FACEBOOK TOKEN SETUP ERROR:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memproses token Facebook.'
    });
  }
        }
