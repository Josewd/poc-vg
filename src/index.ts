import express from 'express';
import feedRouter from './router';
import path from 'path';

const app = express();
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname)));

// Usar as rotas diretamente na raiz
app.use('/', feedRouter);

// Rota para servir o HTML principal
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
  console.log('📍 Endpoints disponíveis:');
  console.log('   POST /shotstack - Processar feed MRSS com Shotstack');
  console.log('   POST /webhook/shotstack - Webhook do Shotstack');
  console.log('   GET  /shotstack/renders - Listar renders');
  console.log('   GET  /app - Interface web');
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