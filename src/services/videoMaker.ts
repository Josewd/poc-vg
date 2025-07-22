import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import axios from 'axios';
import { escapeText } from '../utils';

export async function createAdvancedStoryVideo(
  title: string,
  imageUrl: string,
): Promise<string> {
  const id = uuid();
  const imagePath = path.join(__dirname, `../../public/${id}.jpg`);
  const videoPath = path.join(__dirname, `../../public/${id}.mp4`);

  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  fs.writeFileSync(imagePath, response.data);

  const splitText = escapeText(title).split(' ');

  // Divide text into 3 parts approximately equal
  const textLength = splitText.length;
  const partLength = Math.ceil(textLength / 3);
  
  const part1 = splitText.slice(0, partLength).join(' ');
  const part2 = splitText.slice(partLength, partLength * 2).join(' ');
  const part3 = splitText.slice(partLength * 2).join(' ');

  return new Promise((resolve, reject) => {
    ffmpeg(imagePath)
      .loop(10)
      .videoFilters([
        
        // Frame 1: Zoom from 100% to 115% over 2 seconds
        {
          filter: 'zoompan',
          options: {
            z: 'zoom+0.005', // Zoom from 1.0 to 1.15 (0.075/2s = 0.0375/s)
            d: 420, // Duration in frames (2s at 40fps = 80 frames)
            s: '1920x1080', // Adjust to your video resolution
          
          }
        },
        // Frame 2: Black overlay fading in from 0 to 0.3 opacity (2s to 2.6s)
        {
          filter: 'drawbox',
          options: {
            x: 50,
            y: 700,
            width: 'iw-100',
            height: 350,
            color: 'black@0.09',
            t: 'fill',
            enable: 'between(t,2,8)',
          }
        },
        // Frame 2: "Exclusive" tag slides up and fades in (2s to 2.5s)
        {
          filter: 'drawtext',
          options: {
            text: 'EXCLUSIVE',
            fontfile: 'Poppins',
            fontsize: 48,
            fontcolor: 'white',
            x: 'w*0.1', // 10% from left
            y: 'h*0.72', // Slide up 12px (scaled to ~48px in video)
            alpha: 'if(lt(t,2),0,if(lt(t,3),(t-2)/1,1))',
            enable: 'gte(t,2)'
          }
        },
        // Frame 3: Headline line 1 (2.5s to 3s)
        {
          filter: 'drawtext',
          options: {
            text: `${part1}`,
            fontfile: 'Poppins',
            fontsize: 40,
            fontcolor: 'white',
            x: 'w*0.1',
            y: 'h*0.8', // Slide up
            alpha: 'if(lt(t,3),0,if(lt(t,4),(t-3)/1,1))',
            enable: 'gte(t,3)'
          }
        },
        // Frame 3: Headline line 2 (2.7s to 3.2s)
        {
          filter: 'drawtext',
          options: {
            text: `${part2}`,
            fontfile: 'Poppins',
            fontsize: 40,
            fontcolor: 'white',
            x: 'w*0.1',
            y: 'h*0.8+42', // Offset by 1 line height
            alpha: 'if(lt(t,3),0,if(lt(t,4),(t-3)/1,1))',
            enable: 'gte(t,3)'
          }
        },
        // Frame 3: Headline line 3 (2.9s to 3.4s)
        {
          filter: 'drawtext',
          options: {
            text: `${part3}`,
            fontfile: 'Poppins',
            fontsize: 40,
            fontcolor: 'white',
            x: 'w*0.1',
            y: 'h*0.8+84', // Offset by 2 line heights
            alpha: 'if(lt(t,3),0,if(lt(t,4),(t-3)/1,1))',
            enable: 'gte(t,3)'
          }
        },
      ])
      .output(videoPath)
      .on('end', () => resolve(`/public/${id}.mp4`))
      .on('error', reject)
      .run();
  });
}