import crypto from 'crypto';

export default async function handler(req, res) {
res.setHeader('Cache-Control', 'no-store');

if (req.method !== 'GET') {
return res.status(405).json({
success: false,
message: 'Method not allowed.'
});
}

const clientId = process.env.GOOGLE_CLIENT_ID;
const redirectUri = process.env.GOOGLE_REDIRECT_URI;

if (!clientId || !redirectUri) {
return res.status(500).json({
success: false,
message: 'Konfigurasi Google OAuth belum lengkap.'
});
}

const state = crypto.randomBytes(32).toString('hex');

res.setHeader('Set-Cookie', [
'blogger_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600'
]);

const params = new URLSearchParams({
client_id: clientId,
redirect_uri: redirectUri,
response_type: 'code',
scope: 'https://www.googleapis.com/auth/blogger',
access_type: 'offline',
prompt: 'consent',
state
});

return res.redirect(
302,
'https://accounts.google.com/o/oauth2/v2/auth?' +
params.toString()
);
}
