# 🎬 Video Generator with Shotstack

Automatic generator of professional videos from MRSS feeds using the Shotstack API.

## 🚀 How to Use

### 1. Start the Server
```bash
npm install
npm run dev
```

### 2. Generate Videos Automatically
**POST** `http://localhost:3000/shotstack`

```json
{
  "url": "https://rss.cnn.com/rss/edition.rss",
  "templateId": "2635a995-c613-478b-8dd6-429529854211",
  "maxItems": 5
}
```

### 3. Receive Video URLs
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
      "title": "Breaking News Story",
      "videoUrl": "https://cdn.shotstack.io/au/v1/video.mp4",
      "status": "success"
    }
  ]
}
```

## ✨ What It Does

1. **Receives** an RSS/MRSS feed URL
2. **Extracts** titles, images and metadata from articles
3. **Creates** professional videos using Shotstack templates
4. **Returns** URLs of ready-to-use videos

## 🎯 Practical Example

```bash
curl -X POST http://localhost:3000/shotstack \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://feeds.bbci.co.uk/news/rss.xml",
    "templateId": "2635a995-c613-478b-8dd6-429529854211",
    "maxItems": 3
  }'
```

## 🔧 Configuration

The project comes pre-configured with:
- **Shotstack API Key**: `ort2vvEEUIGo3VifniEcXv7AdtEhdcBvvAk5dEpS`
- **Default Template ID**: `2635a995-c613-478b-8dd6-429529854211`
- **Webhook**: `https://webhook.site/c3543d8c-beca-4707-a1c2-8a84545cdea0`

## 🧪 Testing

```bash
npm run test:shotstack
```

## 📚 Complete Documentation

See `SHOTSTACK_EXAMPLES.md` for detailed examples and other available endpoints.

## 🔄 Complete Flow

```
RSS Feed → Parse → Image Extraction → Shotstack Template → Professional Video
```

**That simple!** 🎉 