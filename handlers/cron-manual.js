import cron from './cron.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
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

  if (!process.env.CRON_SECRET) {
    return res.status(500).json({
      success: false,
      message: 'CRON_SECRET belum tersedia.'
    });
  }

  const cronRequest = {
    method: 'GET',
    headers: {
      authorization: `Bearer ${process.env.CRON_SECRET}`
    }
  };

  return cron(cronRequest, res);
}
