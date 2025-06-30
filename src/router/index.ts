import { Router } from 'express';
import { processFeed, processFeedWithShotstack } from "../services/feedParser";
import { shotstackMaker } from "../services/shotstackVideoMaker";

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

// Endpoint Shotstack - similar to FFmpeg endpoint
router.post('/shotstack', async (req, res) => {
  const { url, templateId = '2635a995-c613-478b-8dd6-429529854211', maxItems = 5 } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing feed URL' });
  }
  
  if (!templateId) {
    return res.status(400).json({ error: 'Missing templateId' });
  }

  try {
    console.log(`Processing feed MRSS with Shotstack: ${url}`);
    console.log(`Template ID: ${templateId}, Max items: ${maxItems}`);
    
    const videos = await processFeedWithShotstack(url, templateId, maxItems);
    
    const successCount = videos.filter(v => v.status === 'success').length;
    const errorCount = videos.filter(v => v.status === 'error').length;
    
    res.json({ 
      success: true,
      message: `Processing done: ${successCount} videos created, ${errorCount} errors`,
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
  console.log('🔔 Webhook recebido do Shotstack:', JSON.stringify(req.body, null, 2));
  
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
      console.log(`Video done via webhook: ${url}`);
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

export default router;