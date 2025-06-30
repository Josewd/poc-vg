import axios from 'axios';
import cheerio from 'cheerio';

export async function getImageFromArticle(url: string): Promise<string | null> {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const img = $('img').first().attr('src');
    return img || null;
  } catch (err) {
    return null;
  }
}