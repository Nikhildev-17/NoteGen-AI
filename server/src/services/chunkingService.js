const DEFAULT_MAX_CHARS_PER_CHUNK = 80000;

export function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

export function chunkTranscript(transcriptInput, maxChars = DEFAULT_MAX_CHARS_PER_CHUNK) {
  let lines = [];
  if (Array.isArray(transcriptInput)) {
    lines = transcriptInput.map((item) => `[${item.timestamp || '00:00'}] ${item.text}`);
  } else if (typeof transcriptInput === 'string') {
    lines = transcriptInput.split('\n').filter(Boolean);
  }

  if (lines.length === 0) {
    return [];
  }

  const fullText = lines.join('\n');
  if (fullText.length <= maxChars) {
    return [
      {
        chunkIndex: 0,
        totalChunks: 1,
        text: fullText,
        estimatedTokens: estimateTokens(fullText),
      },
    ];
  }

  const chunks = [];
  let currentChunkLines = [];
  let currentLength = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLen = line.length + 1;

    if (currentLength + lineLen > maxChars && currentChunkLines.length > 0) {
      const chunkText = currentChunkLines.join('\n');
      chunks.push({
        chunkIndex: chunks.length,
        totalChunks: 0,
        text: chunkText,
        estimatedTokens: estimateTokens(chunkText),
      });

      const overlapLines = currentChunkLines.slice(-2);
      currentChunkLines = [...overlapLines, line];
      currentLength = currentChunkLines.join('\n').length;
    } else {
      currentChunkLines.push(line);
      currentLength += lineLen;
    }
  }

  if (currentChunkLines.length > 0) {
    const chunkText = currentChunkLines.join('\n');
    chunks.push({
      chunkIndex: chunks.length,
      totalChunks: 0,
      text: chunkText,
      estimatedTokens: estimateTokens(chunkText),
    });
  }

  const total = chunks.length;
  return chunks.map((c) => ({ ...c, totalChunks: total }));
}
