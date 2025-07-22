import axios from 'axios';

interface ShotstackTemplate {
  id: string;
  merge: Array<{
    find: string;
    replace: string;
  }>;
}

interface RenderResponse {
  success: boolean;
  message: string;
  response: {
    id: string;
    owner: string;
    plan: string;
    status: string;
    error?: string;
    url?: string;
    data?: any;
    created?: string;
    updated?: string;
  };
}

interface RenderStatus {
  success: boolean;
  message: string;
  response: {
    id: string;
    owner: string;
    plan: string;
    status: 'queued' | 'fetching' | 'rendering' | 'saving' | 'done' | 'failed';
    url?: string;
    error?: string;
    data?: any;
    created?: string;
    updated?: string;
  };
}

export class ShotstackVideoMaker {
  private apiKey: string;
  private baseUrl: string = 'https://api.shotstack.io/edit/v1';
  private webhookUrl?: string;

  constructor(apiKey: string, webhookUrl?: string) {
    this.apiKey = apiKey;
    this.webhookUrl = webhookUrl;
  }

  /**
   * Render a video using a Shotstack template
   */
  async renderFromTemplate(templateData: ShotstackTemplate): Promise<RenderResponse> {
    try {
      const response = await axios.post<RenderResponse>(
        `${this.baseUrl}/templates/render`,
        {
          ...templateData,
          ...(this.webhookUrl && { webhook: this.webhookUrl })
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error rendering video:', error);
      throw new Error(`Failed to render video: ${error}`);
    }
  }

  /**
   * Check render status
   */
  async getRenderStatus(renderId: string): Promise<RenderStatus> {
    try {
      const response = await axios.get<RenderStatus>(
        `${this.baseUrl}/render/${renderId}`,
        {
          headers: {
            'x-api-key': this.apiKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error checking render status:', error);
      throw new Error(`Failed to check status: ${error}`);
    }
  }

  /**
   * Wait for the video to be ready (polling)
   */
  async waitForRender(renderId: string, maxWaitTime: number = 300000): Promise<string> {
    const startTime = Date.now();
    const pollInterval = 5000; // 5 seconds

    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getRenderStatus(renderId);
      
      console.log(`Render status ${renderId}: ${status.response.status}`);

      if (status.response.status === 'done') {
        if (status.response.url) {
          return status.response.url;
        }
        throw new Error('Render completed but URL not available');
      }

      if (status.response.status === 'failed') {
        throw new Error(`Render failed: ${status.response.error || 'Unknown error'}`);
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Timeout: Render took too long to complete');
  }

  /**
   * Create a simple video with title and image
   */
  async createSimpleVideo(
    templateId: string,
    title: string,
    imageUrl: string,
  ): Promise<string> {
    const templateData: ShotstackTemplate = {
      id: templateId,
      merge: [
        {
          find: 'headline1',
          replace: title
        },
        {
          find: 'IMAGE_1',
          replace: imageUrl
        },
      ]
    };

    console.log('Starting render with template:', templateData);
    
    const renderResponse = await this.renderFromTemplate(templateData);
    
    if (!renderResponse.success) {
      throw new Error(`Failed to start render: ${renderResponse.message}`);
    }

    console.log('Render started with ID:', renderResponse.response.id);
    
    // Wait for the video to be ready
    const videoUrl = await this.waitForRender(renderResponse.response.id);
    
    console.log('Video ready at:', videoUrl);
    return videoUrl;
  }

  /**
   * List all renders for the user
   */
  async listRenders(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/render`,
        {
          headers: {
            'x-api-key': this.apiKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error listing renders:', error);
      throw new Error(`Failed to list renders: ${error}`);
    }
  }
}

// Function to get webhook URL based on environment
function getWebhookUrl(): string {
  const baseUrl = process.env.WEBHOOK_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/webhook/shotstack`;
}

// Default Shotstack instance with own webhook
export const shotstackMaker = new ShotstackVideoMaker(
 process.env.SHOTSTACK_API_KEY || 'sdtRcPSCkY32rFS6l3YfxU80GHdmINI6sQo2Sm5Y',
getWebhookUrl()
);

console.log('Shotstack configured with webhook:', getWebhookUrl()); 