import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
res.setHeader('Cache-Control', 'no-store');

if (req.method !== 'GET') {
return res.status(405).send('Method not allowed.');
}

const { code, state, error } = req.query;

if (error) {
return res.status(400).send('Login Google dibatalkan.');
}

const cookies = Object.fromEntries(
(req.headers.cookie || '')
.split(';')
.map(item => item.trim().split('='))
.filter(item => item.length >= 2)
.map(([key, ...value]) => [key, value.join('=')])
);

const savedState = cookies.blogger_oauth_state;

res.setHeader('Set-Cookie',
'blogger_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
);

const stateBuffer = Buffer.from(String(state || ''));
const savedStateBuffer = Buffer.from(String(savedState || ''));

if (
!code ||
!state ||
!savedState ||
stateBuffer.length !== savedStateBuffer.length ||
!crypto.timingSafeEqual(stateBuffer, savedStateBuffer)
) {
return res.status(400).send('Verifikasi OAuth gagal. Silakan ulangi login.');
}

try {
const tokenResponse = await fetch(
'https://oauth2.googleapis.com/token',
{
method: 'POST',
headers: {
'Content-Type': 'application/x-www-form-urlencoded'
},
body: new URLSearchParams({
code: String(code),
client_id: process.env.GOOGLE_CLIENT_ID,
client_secret: process.env.GOOGLE_CLIENT_SECRET,
redirect_uri: process.env.GOOGLE_REDIRECT_URI,
grant_type: 'authorization_code'
})
}
);

const token = await tokenResponse.json();

if (!tokenResponse.ok) {
  console.error('Google OAuth error:', token.error);
  throw new Error('Google gagal memberikan token.');
}

if (!token.refresh_token) {
  throw new Error('Refresh token tidak tersedia. Ulangi persetujuan Google.');
}

const expiresAt = new Date(
  Date.now() + token.expires_in * 1000
).toISOString();

const { error: dbError } = await supabase
  .from('blogger_tokens')
  .upsert({
    id: 'main',
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    token_type: token.token_type,
    scope: token.scope,
    expires_at: expiresAt,
    updated_at: new Date().toISOString()
  });

if (dbError) {
  console.error('Supabase token save error:', dbError.message);
  throw new Error('Gagal menyimpan koneksi Blogger.');
}

return res.redirect(
  302,
  '/?blogger=connected'
);

} catch (err) {
console.error('Blogger callback error:', err.message);

return res.status(500).send(
  'Koneksi Blogger gagal. Silakan coba kembali.'
);

}
  }
