import { getYouTubeLinks } from '../utils/youtube.js';

export async function getVideoMetadata(videoId) {
  const links = getYouTubeLinks(videoId);
  const defaultMetadata = {
    videoId,
    title: `YouTube Video (${videoId})`,
    authorName: 'YouTube Creator',
    authorUrl: '',
    thumbnailUrl: links.thumbnailHq,
    watchUrl: links.watchUrl,
  };

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(links.watchUrl)}&format=json`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(oembedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        videoId,
        title: data.title || defaultMetadata.title,
        authorName: data.author_name || defaultMetadata.authorName,
        authorUrl: data.author_url || '',
        thumbnailUrl: data.thumbnail_url || links.thumbnailHq,
        watchUrl: links.watchUrl,
      };
    }
  } catch (err) {
    console.warn(`[metadataService] oEmbed fetch notice for ${videoId}: ${err.message}`);
  }

  return defaultMetadata;
}
