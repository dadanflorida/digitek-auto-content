import express from 'express';

import bloggerBlogs from './api/blogger-blogs.js';
import bloggerCallback from './api/blogger-callback.js';
import bloggerLogin from './api/blogger-login.js';
import cron from './api/cron.js';
import deleteArticle from './api/delete-article.js';
import generate from './api/generate.js';
import listArticles from './api/list-articles.js';
import research from './api/research.js';
import saveArticle from './api/save-article.js';
import settings from './api/settings.js';
import updateArticle from './api/update-article.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================================
// API ROUTES
// ==================================

app.all('/api/blogger-blogs', bloggerBlogs);
app.all('/api/blogger-callback', bloggerCallback);
app.all('/api/blogger-login', bloggerLogin);
app.all('/api/cron', cron);
app.all('/api/delete-article', deleteArticle);
app.all('/api/generate', generate);
app.all('/api/list-articles', listArticles);
app.all('/api/research', research);
app.all('/api/save-article', saveArticle);
app.all('/api/settings', settings);
app.all('/api/update-article', updateArticle);

// ==================================
// TES EXPRESS
// ==================================

app.get('/api/express-test', (req, res) => {
  res.json({
    success: true,
    message: 'Express DIGITEK AUTO CONTENT ENGINE aktif.'
  });
});

// ==================================
// EXPORT UNTUK VERCEL
// ==================================

export default app;
