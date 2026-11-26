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

  const {
    FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET,
    FACEBOOK_USER_TOKEN
  } = process.env;

  if (
    !FACEBOOK_APP_ID ||
    !FACEBOOK_APP_SECRET ||
    !FACEBOOK_USER_TOKEN
  ) {
    return res.status(500).json({
      success: false,
      message: 'Environment Facebook belum lengkap.'
    });
  }

  try {
    const response = await fetch(
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

    const result = await response.json();

    if (!response.ok || !result.access_token) {
      return res.status(400).json({
        success: false,
        message: result.error?.message ||
          'Pertukaran token gagal.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Token berhasil ditukar.',
      access_token: result.access_token,
      expires_in: result.expires_in,
      expires_days: Math.floor(
        result.expires_in / 86400
      )
    });

  } catch (error) {
    console.error('FACEBOOK TOKEN EXCHANGE:', error);

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghubungi Meta.'
    });
  }
          }
