# Shotstack Video Maker - Usage Examples

This project now includes complete integration with the Shotstack API for creating professional videos using templates, **including automatic MRSS feed processing** similar to the FFmpeg endpoint.

## Configuration

- **API Key**: `ort2vvEEUIGo3VifniEcXv7AdtEhdcBvvAk5dEpS`
- **Webhook URL**: `https://webhook.site/c3543d8c-beca-4707-a1c2-8a84545cdea0`

## 🚀 Main Endpoint - Process MRSS Feed

### **POST** `/shotstack` ⭐ **NEW**

**This is the main endpoint**, similar to the FFmpeg endpoint. It receives an MRSS feed URL and automatically generates videos for the items using Shotstack.

```json
{
  "url": "https://rss.cnn.com/rss/edition.rss",
  "templateId": "2635a995-c613-478b-8dd6-429529854211",
  "maxItems": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Processing completed: 4 videos created, 1 errors",
  "summary": {
    "total": 5,
    "success": 4,
    "errors": 1
  },
  "videos": [
    {
      "title": "Breaking: Important News Story",
      "link": "https://example.com/news/story1",
      "imageUrl": "https://example.com/image1.jpg",
      "videoUrl": "https://cdn.shotstack.io/au/v1/video1.mp4",
      "status": "success"
    },
    {
      "title": "Tech Update: New Innovation",
      "link": "https://example.com/news/story2",
      "imageUrl": "https://example.com/image2.jpg",
      "videoUrl": "",
      "status": "error",
      "error": "Template processing failed"
    }
  ]
}
```

**Features:**
- ✅ Processes RSS/MRSS feeds automatically
- ✅ Extracts images from items or article content
- ✅ Creates videos using Shotstack template
- ✅ Waits for completion of each video (automatic polling)
- ✅ Returns ready-to-use video URLs
- ✅ Robust error handling
- ✅ Configurable item limitation (maxItems)
- ✅ Pause between requests to avoid overloading the API

### Example with cURL:
```bash
curl -X POST http://localhost:3000/shotstack \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://rss.cnn.com/rss/edition.rss",
    "templateId": "2635a995-c613-478b-8dd6-429529854211",
    "maxItems": 3
  }'
```

## Other Available Endpoints

### 1. Create Simple Video
**POST** `/shotstack/create`

Creates a video using a template with basic substitutions.

```json
{
  "templateId": "2635a995-c613-478b-8dd6-429529854211",
  "title": "Video Title",
  "imageUrl": "https://example.com/image.jpg",
  "additionalReplacements": {
    "subtitle": "Optional Subtitle",
    "author": "Author Name"
  }
}
```

**Response:**
```json
{
  "success": true,
  "videoUrl": "https://cdn.shotstack.io/au/v1/video.mp4",
  "message": "Video created successfully!"
}
```

### 2. Create News Video
**POST** `/shotstack/news`

Specialized for creating news/article videos.

```json
{
  "templateId": "2635a995-c613-478b-8dd6-429529854211",
  "headline": "News Headline",
  "imageUrl": "https://example.com/news.jpg",
  "author": "Journalist",
  "date": "2024-01-15"
}
```

### 3. Custom Template
**POST** `/shotstack/template`

Renders using complete template configuration.

```json
{
  "templateData": {
    "id": "2635a995-c613-478b-8dd6-429529854211",
    "merge": [
      {
        "find": "headline1",
        "replace": "2024"
      },
      {
        "find": "IMAGE_1",
        "replace": "https://templates.shotstack.io/car-sale-slideshow-video/27efb285-a3b2-47e6-8440-574a6b660183/pexels-photo-9513395.jpg"
      }
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "render": {
    "success": true,
    "message": "Created",
    "response": {
      "id": "b9db24e4-5a4c-4ccd-b43d-4ecfc51c0b2a",
      "status": "queued"
    }
  }
}
```

### 4. Check Render Status
**GET** `/shotstack/status/:renderId`

Checks the progress of a specific render.

**Response:**
```json
{
  "success": true,
  "response": {
    "id": "b9db24e4-5a4c-4ccd-b43d-4ecfc51c0b2a",
    "status": "done",
    "url": "https://cdn.shotstack.io/au/v1/video.mp4"
  }
}
```

Possible statuses:
- `queued`: In queue
- `fetching`: Fetching resources
- `rendering`: Rendering
- `saving`: Saving
- `done`: Completed
- `failed`: Failed

### 5. List All Renders
**GET** `/shotstack/renders`

Lists all renders from the account.

## Comparison with FFmpeg

| Feature | FFmpeg (Current) | Shotstack (New) |
|---------|------------------|-----------------|
| **Input** | MRSS Feed URL | MRSS Feed URL |
| **Processing** | Local (FFmpeg) | Cloud (Shotstack) |
| **Quality** | Basic | Professional |
| **Templates** | Fixed code | Visual templates |
| **Scalability** | Limited | High |
| **Speed** | Average | Fast (parallel) |
| **Resources** | Local CPU | Infinite cloud |

## Complete Usage Example

```javascript
// 1. Processar feed automaticamente
const response = await fetch('http://localhost:3000/shotstack', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
    templateId: '2635a995-c613-478b-8dd6-429529854211',
    maxItems: 10
  })
});

const result = await response.json();

// 2. Verificar resultados
console.log(`Criados: ${result.summary.success} vídeos`);
console.log(`Erros: ${result.summary.errors}`);

// 3. Usar URLs dos vídeos
result.videos.forEach(video => {
  if (video.status === 'success') {
    console.log(`Vídeo: ${video.title}`);
    console.log(`URL: ${video.videoUrl}`);
  }
});
```

## Casos de Uso

1. **🆕 Automação de Conteúdo**: Processar feeds RSS e gerar vídeos automaticamente
2. **📰 Portais de Notícias**: Converter artigos em vídeos profissionais
3. **📱 Redes Sociais**: Criar conteúdo visual para engajamento
4. **🎯 Marketing**: Gerar vídeos promocionais em escala
5. **🔄 Integração CMS**: Automatizar criação de vídeos em sistemas existentes

## Testes

Execute o script de teste para verificar todas as funcionalidades:

```bash
npm run test:shotstack
```

O script testa:
- ✅ Processamento de feed MRSS (endpoint principal)
- ✅ Criação de vídeos individuais
- ✅ Templates personalizados
- ✅ Verificação de status
- ✅ Listagem de renders

## Próximos Passos

- [ ] Cache de vídeos gerados para evitar re-processamento
- [ ] Interface web para gerenciar templates e renders
- [ ] Suporte a múltiplos templates por feed
- [ ] Webhooks para notificações em tempo real
- [ ] Analytics de uso e performance 