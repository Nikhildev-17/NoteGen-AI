const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const DIRECT_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

export function extractVideoId(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  if (DIRECT_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(YOUTUBE_REGEX);
  return match ? match[1] : null;
}

export function isValidYouTubeUrl(input) {
  return extractVideoId(input) !== null;
}

export function formatTimestamp(seconds) {
  const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  const pad = (num) => String(num).padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
  }
  return `${pad(minutes)}:${pad(remainingSeconds)}`;
}

export function getYouTubeLinks(videoId) {
  return {
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnailHq: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    thumbnailMaxRes: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  };
}
