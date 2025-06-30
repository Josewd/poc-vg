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
// 1. Process feed automatically
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

// 2. Check results
console.log(`Created: ${result.summary.success} videos`);
console.log(`Errors: ${result.summary.errors}`);

// 3. Use video URLs
result.videos.forEach(video => {
  if (video.status === 'success') {
    console.log(`Video: ${video.title}`);
    console.log(`URL: ${video.videoUrl}`);
  }
});
```

## Use Cases

1. **🆕 Content Automation**: Process RSS feeds and generate videos automatically
2. **📰 News Portals**: Convert articles into professional videos
3. **📱 Social Media**: Create visual content for engagement
4. **🎯 Marketing**: Generate promotional videos at scale
5. **🔄 CMS Integration**: Automate video creation in existing systems

## Testing

Run the test script to verify all functionalities:

```bash
npm run test:shotstack
```

The script tests:
- ✅ MRSS feed processing (main endpoint)
- ✅ Individual video creation
- ✅ Custom templates
- ✅ Status checking
- ✅ Render listing

## Next Steps

- [ ] Video caching to avoid re-processing
- [ ] Web interface to manage templates and renders
- [ ] Support for multiple templates per feed
- [ ] Webhooks for real-time notifications
- [ ] Usage and performance analytics 