import express from 'express';

import bloggerBlogs from './handlers/blogger-blogs.js';
import bloggerCallback from './handlers/blogger-callback.js';
import bloggerLogin from './handlers/blogger-login.js';
import cron from './handlers/cron.js';
import cronManual from './handlers/cron-manual.js';
import deleteArticle from './handlers/delete-article.js';
import generate from './handlers/generate.js';
import listArticles from './handlers/list-articles.js';
import research from './handlers/research.js';
import keywordPool from './handlers/keyword-pool.js';
import saveArticle from './handlers/save-article.js';
import settings from './handlers/settings.js';
import updateArticle from './handlers/update-article.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// HALAMAN UTAMA DASHBOARD
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// API ROUTES

app.all('/api/blogger-blogs', bloggerBlogs);
app.all('/api/blogger-callback', bloggerCallback);
app.all('/api/blogger-login', bloggerLogin);
app.all('/api/cron', cron);
app.all('/api/cron-manual', cronManual);
app.all('/api/delete-article', deleteArticle);
app.all('/api/generate', generate);
app.all('/api/list-articles', listArticles);
app.all('/api/research', research);
app.all('/api/keyword-pool', keywordPool);
app.all('/api/save-article', saveArticle);
app.all('/api/settings', settings);
app.all('/api/update-article', updateArticle);

// TES EXPRESS

app.get('/api/express-test', (req, res) => {
  res.json({
    success: true,
    message: 'Express DIGITEK AUTO CONTENT ENGINE aktif.'
  });
});

export default app;
