import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { getImageFromArticle } from '../services/imageScraper';
import { createAdvancedStoryVideo } from '../services/videoMaker';
import { shotstackMaker } from '../services/shotstackVideoMaker';

export async function processFeed(feedUrl: string, maxItems: number = 1) {
  console.log('Processing feed with FFmpeg:', feedUrl);
  const { data } = await axios.get(feedUrl);
  const parsed = await parseStringPromise(data);

  const items = parsed.rss.channel[0].item.slice(0, 10);
  const videos: string[] = [];

  let count = 0;
  for (const item of items) {
    if (item.title && item.title.length) {
      const title = item.title[0] as string;
      const link = item.link[0];
      const image = item['media:content']?.[0]?.$.url || await getImageFromArticle(link);

      const videoPath = await createAdvancedStoryVideo(title, image);
      videos.push(videoPath);
      count++;
      if (count >= maxItems) {
        break;
      }
    }
  }

  return videos;
}

export async function processFeedWithShotstack(feedUrl: string, templateId: string, maxItems: number = 5) {
  console.log('Processing feed with Shotstack:', feedUrl, 'Template:', templateId);
  
  try {
    const { data } = await axios.get(feedUrl);
    const parsed = await parseStringPromise(data);

    const items = parsed.rss.channel[0].item.slice(0, maxItems);
    const videos: Array<{
      title: string;
      link: string;
      imageUrl: string;
      videoUrl: string;
      status: 'success' | 'error';
      error?: string;
    }> = [];

    console.log(`Processing ${items.length} items from feed...`);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.title && item.title.length) {
        const title = item.title[0] as string;
        const link = item.link[0];
        let imageUrl = item['media:content']?.[0]?.$.url || 
                      item['media:thumbnail']?.[0]?.$.url ||
                      item.enclosure?.[0]?.$.url ||
                      await getImageFromArticle(link);

        try {
          // Create video using Shotstack
          const videoUrl = await shotstackMaker.createSimpleVideo(
            templateId,
            title,
            imageUrl,
          );

          videos.push({
            title,
            link,
            imageUrl,
            videoUrl,
            status: 'success'
          });

          console.log(`Video created successfully: ${title.substring(0, 30)}...`);

        } catch (error) {
          console.error(`Error creating video for "${title}":`, error);
          
          videos.push({
            title,
            link,
            imageUrl: imageUrl || '',
            videoUrl: '',
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }

        // Small pause between requests to avoid overloading the API
        if (i < items.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    return videos;

  } catch (error) {
    console.error('Error processing feed:', error);
    throw new Error(`Failed to process feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}