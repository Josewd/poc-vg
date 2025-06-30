import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import axios from 'axios';

// Function to escape text for use in FFmpeg
function escapeText(text: string): string {
  return text
    .replace(/'/g, "`")  // Escape single quotes
    .replace(/:/g, "")  // Escape colons
    .replace(/=/g, "")  // Escape equals
    .replace(/\[/g, "") // Escape brackets
    .replace(/\]/g, "") // Escape brackets
    .replace(/\(/g, "") // Escape parentheses
    .replace(/\)/g, "") // Escape parentheses
    .replace(/,/g, "")  // Escape commas
    .replace(/;/g, "")  // Escape semicolons
    .replace(/\n/g, "") // Escape line breaks
    .replace(/\r/g, ""); // Escape carriage returns
}

export async function createKenBurnsVideo(title: string, imageUrl: string): Promise<string> {
  const id = uuid();
  const imagePath = path.join(__dirname, `../../public/${id}.jpg`);
  const videoPath = path.join(__dirname, `../../public/${id}.mp4`);

  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  fs.writeFileSync(imagePath, response.data);

  return new Promise((resolve, reject) => {
    ffmpeg(imagePath)
      .loop(15)
      .videoFilter([
        "zoompan=z='min(zoom+0.0005,1.2)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=450:s=1280x720",
        `drawtext=text='${title}':fontcolor=white:fontsize=48:box=1:boxcolor=black@0.5:boxborderw=5:x='(w-text_w)/2':y='h-text_h-50'`
      ])
      .size('1280x720')
      .output(videoPath)
      .on('end', () => resolve(`/public/${id}.mp4`))
      .on('error', reject)
      .run();
  
  });
}

export async function createKenBurnsVideoWithText(
  title: string, 
  imageUrl: string, 
  textOptions?: {
    fontSize?: number;
    fontColor?: string;
    backgroundColor?: string;
    position?: 'top' | 'center' | 'bottom';
    showBackground?: boolean;
  }
): Promise<string> {
  const id = uuid();
  const imagePath = path.join(__dirname, `../../public/${id}.jpg`);
  const videoPath = path.join(__dirname, `../../public/${id}.mp4`);

  const {
    fontSize = 48,
    fontColor = 'white',
    backgroundColor = 'black@0.5',
    position = 'bottom',
    showBackground = true
  } = textOptions || {};

  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  fs.writeFileSync(imagePath, response.data);

  // Definir posição do texto baseada na escolha
  let yPosition: string;
  switch (position) {
    case 'top':
      yPosition = '50';
      break;
    case 'center':
      yPosition = "'(h-text_h)/2'";
      break;
    case 'bottom':
    default:
      yPosition = "'h-text_h-50'";
      break;
  }

  const backgroundBox = showBackground ? `:box=1:boxcolor=${backgroundColor}:boxborderw=5` : '';

  return new Promise((resolve, reject) => {
    ffmpeg(imagePath)
      .loop(15)
      .videoFilter([
        "zoompan=z='min(zoom+0.0005,1.2)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=450:s=1280x720",
        `drawtext=text='${title}':fontcolor=${fontColor}:fontsize=${fontSize}${backgroundBox}:x='(w-text_w)/2':y=${yPosition}`
      ])
      .size('1280x720')
      .output(videoPath)
      .on('end', () => resolve(`/public/${id}.mp4`))
      .on('error', reject)
      .run();
  });
}

export async function createAnimatedStoryVideo(
  title: string,
  imageUrl: string,
  options?: {
    exclusive?: boolean;
    ctaText?: string;
    duration?: number;
  }
): Promise<string> {
  const id = uuid();
  const imagePath = path.join(__dirname, `../../public/${id}.jpg`);
  const videoPath = path.join(__dirname, `../../public/${id}.mp4`);

  const {
    exclusive = true,
    ctaText = "READ MORE",
    duration = 8
  } = options || {};

  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  fs.writeFileSync(imagePath, response.data);

  // Calculate frames based on duration (30fps)
  const totalFrames = duration * 30;
  
  // Frames for each animation
  const frame2Start = 2 * 30; // 2 seconds
  const frame3Start = 4 * 30; // 4 seconds
  const ctaStart = 6.5 * 30;  // 6.5 seconds

  return new Promise((resolve, reject) => {
    ffmpeg(imagePath)
      .loop(duration)
      .videoFilter([
        // Frame 1: Smooth zoom from 100% to 115% until frame2Start (2s)
        `zoompan=z='if(lt(n,${frame2Start}),min(zoom+0.0003,1.15),1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=1280x720`,
        
        // Frame 2: Black overlay (0% to 30% opacity) starting from frame 60
        `drawbox=x=0:y=0:w=iw:h=ih:color=black@0.3:t=fill:enable='between(n,${frame2Start},${totalFrames})'`,
        
        // "EXCLUSIVE" tag - appears at frame 60
        exclusive ? `drawtext=text='EXCLUSIVE':fontcolor=white:fontsize=32:box=1:boxcolor=black@0.7:boxborderw=3:x='(w-text_w)/2':y=100:enable='between(n,${frame2Start},${totalFrames})'` : '',
        
        // Decorative line under the tag
        exclusive ? `drawbox=x='(w-200)/2':y=140:w=200:h=2:color=white:t=fill:enable='between(n,${frame2Start + 15},${totalFrames})'` : '',
        
        // Main title - appears at frame 120
        `drawtext=text='${title}':fontcolor=white:fontsize=48:box=1:boxcolor=black@0.5:boxborderw=5:x='(w-text_w)/2':y='(h-text_h)/2':enable='between(n,${frame3Start},${totalFrames})'`,
        
        // CTA - appears at frame 195 (6.5s)
        `drawtext=text='${ctaText}':fontcolor=white:fontsize=36:box=1:boxcolor=red@0.8:boxborderw=3:x='(w-text_w)/2':y='h-text_h-100':enable='between(n,${ctaStart},${totalFrames})'`
      ].filter(Boolean)) // Remove empty filters
      .size('1280x720')
      .output(videoPath)
      .on('end', () => resolve(`/public/${id}.mp4`))
      .on('error', reject)
      .run();
  });
}

export async function createAdvancedStoryVideo(
  title: string,
  imageUrl: string,
  options?: {
    exclusive?: boolean;
    duration?: number;
    headlineLines?: string[];
  }
): Promise<string> {
  const id = uuid();
  const imagePath = path.join(__dirname, `../../public/${id}.jpg`);
  const videoPath = path.join(__dirname, `../../public/${id}.mp4`);

  const {
    exclusive = true,
    duration = 8,
    headlineLines = [title]
  } = options || {};

  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  fs.writeFileSync(imagePath, response.data);

  console.log([escapeText(title)])

  const splitText = escapeText(title).split(' ');

  // Divide text into 3 parts approximately equal
  const textLength = splitText.length;
  const partLength = Math.ceil(textLength / 3);
  
  const part1 = splitText.slice(0, partLength).join(' ');
  const part2 = splitText.slice(partLength, partLength * 2).join(' ');
  const part3 = splitText.slice(partLength * 2).join(' ');

  const DS = 1.0; // display start
  const DE = 10.0; // display end
  const FID = 1.5; // fade in duration
  const FOD = 5; // fade out duration

  return new Promise((resolve, reject) => {
    ffmpeg(imagePath)
      .loop(duration)
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