import express from 'express';

const app = express();

app.use(express.json());

// Tes koneksi Express
app.get('/api/express-test', (req, res) => {
  res.json({
    success: true,
    message: 'Express DIGITEK AUTO CONTENT ENGINE aktif.'
  });
});

// Export untuk Vercel
export default app;
