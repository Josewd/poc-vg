import { Router } from 'express';
import { processFeed, processFeedWithShotstack } from "../services/feedParser";
import fs from 'fs';
import path from 'path';

const router = Router();

// Store to store render status locally only for development
const renderStatusStore = new Map<string, {
  status: string;
  url?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: any;
}>();


// Endpoint to process feed with FFmpeg
router.post('/ffmpeg', async (req, res) => {
  const { url, maxItems = 1 } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing feed URL' });

  try {
    const videos = await processFeed(url, maxItems);
    res.json({ videos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process feed' });
  }
});

router.post('/shotstack', async (req, res) => {
  const { url, templateId = process.env.SHOTSTACK_TEMPLATE_ID || '', maxItems = 1 } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing feed URL' });
  }
  
  if (!templateId) {
    return res.status(400).json({ error: 'Missing templateId' });
  }

  try {
    console.log(`Processing MRSS feed with Shotstack: ${url}`);
    console.log(`Template ID: ${templateId}, Max items: ${maxItems}`);
    
    const videos = await processFeedWithShotstack(url, templateId, maxItems);
    
    const successCount = videos.filter(v => v.status === 'success').length;
    const errorCount = videos.filter(v => v.status === 'error').length;
    
    res.json({ 
      success: true,
      message: `Processing completed: ${successCount} videos created, ${errorCount} errors`,
      summary: {
        total: videos.length,
        success: successCount,
        errors: errorCount
      },
      videos 
    });
  } catch (err) {
    console.error('Error processing feed with Shotstack:', err);
    res.status(500).json({ 
      error: 'Failed to process feed with Shotstack',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Webhook endpoint to receive notifications from Shotstack
router.post('/webhook/shotstack', async (req, res) => {
  console.log('🔔 Webhook received from Shotstack:', JSON.stringify(req.body, null, 2));
  
  try {
    const { id, owner, status, url, error, data } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Missing render ID in webhook' });
    }

    // Update status in store
    const existingRender = renderStatusStore.get(id);
    renderStatusStore.set(id, {
      status: status || 'unknown',
      url: url || existingRender?.url,
      error: error || existingRender?.error,
      createdAt: existingRender?.createdAt || new Date(),
      updatedAt: new Date(),
      metadata: {
        owner,
        data,
        webhookReceived: true
      }
    });

    console.log(`Status updated via webhook: ${id} -> ${status}`);
    
    if (status === 'done' && url) {
      console.log(`Video completed via webhook: ${url}`);
      
      // Download and save video locally
      try {
        console.log(`🎉 Video downloaded and saved: ${url}`);
      } catch (downloadError) {
        console.error('Failed to download video:', downloadError);
        // Keep the original URL if download fails
      }
    } else if (status === 'failed') {
      console.log(`Video failed via webhook: ${error}`);
    }

    // Respond OK to Shotstack
    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully',
      renderId: id,
      status: status
    });

  } catch (err) {
    console.error('Error processing webhook:', err);
    res.status(500).json({ 
      error: 'Failed to process webhook',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

// Endpoint to list downloaded videos
router.get('/videos/local', async (req, res) => {
  try {
    const publicDir = path.join(__dirname, '../../public');
    
    if (!fs.existsSync(publicDir)) {
      return res.json({ videos: [] });
    }
    
    const files = fs.readdirSync(publicDir);
    const videoFiles = files
      .filter(file => file.endsWith('.mp4'))
      .map(file => {
        const filePath = path.join(publicDir, file);
        const stats = fs.statSync(filePath);
        
        return {
          filename: file,
          url: `/public/${file}`,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
    
    res.json({
      success: true,
      count: videoFiles.length,
      videos: videoFiles
    });
  } catch (error) {
    console.error('Error listing local videos:', error);
    res.status(500).json({
      error: 'Failed to list local videos',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;