import express from 'express';
import feedRouter from './router';
import path from 'path';

const app = express();
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname)));

// Use routes directly at root
app.use('/', feedRouter);

// Route to serve main HTML
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
  console.log('📍 Available endpoints:');
  console.log('   POST /shotstack - Process MRSS feed with Shotstack');
  console.log('   POST /webhook/shotstack - Shotstack Webhook');
  console.log('   GET  /shotstack/renders - List renders');
  console.log('   GET  /app - Web interface');
});

// File: src/routes/feed.ts
import { Router } from 'express';
import { processFeed } from './services/feedParser';

const router = Router();

router.post('/', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing feed URL' });

  try {
    const videos = await processFeed(url);
    res.json({ videos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process feed' });
  }
});