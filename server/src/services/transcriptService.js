import { YoutubeTranscript } from 'youtube-transcript';
import { formatTimestamp } from '../utils/youtube.js';
import { AppError } from '../utils/errors.js';

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

export async function fetchYouTubeTranscript(videoId) {
  if (!videoId) {
    throw new AppError('Valid YouTube video ID is required for transcript retrieval.', 400);
  }

  try {
    const rawItems = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: 'en',
    }).catch(async () => {
      return await YoutubeTranscript.fetchTranscript(videoId);
    });

    if (!rawItems || rawItems.length === 0) {
      throw new AppError(
        'No captions found for this video. Captions may be disabled by the creator.',
        422,
        { reason: 'TRANSCRIPT_EMPTY', videoId, canUseManualFallback: true }
      );
    }

    const items = rawItems.map((item) => {
      const rawOffset = Number(item.offset) || 0;
      const offsetInSeconds = rawOffset > 50000 ? rawOffset / 1000 : rawOffset;
      const cleanText = decodeHtmlEntities(item.text).replace(/\s+/g, ' ').trim();

      return {
        text: cleanText,
        start: offsetInSeconds,
        duration: Number(item.duration) || 0,
        timestamp: formatTimestamp(offsetInSeconds),
      };
    }).filter((item) => item.text.length > 0);

    const fullText = items
      .map((item) => `[${item.timestamp}] ${item.text}`)
      .join('\n');

    const cleanPlainText = items.map((item) => item.text).join(' ');
    const wordCount = cleanPlainText.split(/\s+/).filter(Boolean).length;

    return {
      items,
      fullText,
      cleanPlainText,
      wordCount,
      source: 'youtube-automatic',
    };
  } catch (error) {
    if (error instanceof AppError) throw error;

    const msg = error.message || '';
    if (msg.includes('disabled') || msg.includes('Could not find') || msg.includes('No transcripts')) {
      throw new AppError(
        'Transcripts are not available for this YouTube video (captions may be turned off). You can paste the transcript manually below to continue.',
        422,
        { reason: 'TRANSCRIPT_DISABLED', videoId, canUseManualFallback: true }
      );
    }

    if (msg.includes('unavailable') || msg.includes('private')) {
      throw new AppError(
        'This video is private, restricted, or unavailable on YouTube.',
        404,
        { reason: 'VIDEO_UNAVAILABLE', videoId, canUseManualFallback: false }
      );
    }

    throw new AppError(
      `Unable to retrieve video transcript: ${msg}. You can paste the transcript manually to continue.`,
      422,
      { reason: 'TRANSCRIPT_ERROR', videoId, details: msg, canUseManualFallback: true }
    );
  }
}

export function processManualTranscript(rawText) {
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    throw new AppError('Manual transcript cannot be empty.', 400);
  }

  const cleaned = rawText.trim();
  const words = cleaned.split(/\s+/).filter(Boolean);

  if (words.length < 15) {
    throw new AppError(
      'Manual transcript is too short. Please provide at least 15 words of content to generate meaningful notes.',
      400
    );
  }

  const lines = cleaned.split('\n');
  const items = [];
  const timestampRegex = /^(?:\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*[:-]?\s*)?(.*)$/;

  let currentTime = '00:00';
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const match = trimmedLine.match(timestampRegex);
    if (match) {
      if (match[1]) {
        currentTime = match[1];
      }
      const text = match[2] || '';
      if (text.length > 0) {
        items.push({
          timestamp: currentTime,
          text: decodeHtmlEntities(text),
        });
      }
    }
  }

  if (items.length === 0) {
    items.push({
      timestamp: '00:00',
      text: decodeHtmlEntities(cleaned),
    });
  }

  return {
    items,
    fullText: items.map((i) => `[${i.timestamp}] ${i.text}`).join('\n'),
    cleanPlainText: cleaned,
    wordCount: words.length,
    source: 'manual-input',
  };
}
