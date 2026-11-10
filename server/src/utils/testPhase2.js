import assert from 'node:assert';
import { extractVideoId, isValidYouTubeUrl, formatTimestamp } from './youtube.js';
import { processManualTranscript } from '../services/transcriptService.js';
import { getVideoMetadata } from '../services/metadataService.js';

async function runTests() {
  console.log('--- Running Phase 2 Tests ---');

  const testUrls = [
    { input: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
    { input: 'https://youtu.be/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
    { input: 'https://www.youtube.com/embed/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
    { input: 'https://www.youtube.com/shorts/dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
    { input: 'dQw4w9WgXcQ', expected: 'dQw4w9WgXcQ' },
    { input: 'https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s', expected: 'dQw4w9WgXcQ' },
    { input: 'https://example.com/not-youtube', expected: null },
    { input: 'invalid-string', expected: null },
  ];

  for (const { input, expected } of testUrls) {
    const extracted = extractVideoId(input);
    assert.strictEqual(extracted, expected, `extractVideoId failed for: ${input}`);
    assert.strictEqual(isValidYouTubeUrl(input), expected !== null, `isValidYouTubeUrl failed for: ${input}`);
  }
  console.log('URL validation & ID extraction tests passed');

  assert.strictEqual(formatTimestamp(0), '00:00');
  assert.strictEqual(formatTimestamp(65), '01:05');
  assert.strictEqual(formatTimestamp(3665), '01:01:05');
  console.log('Timestamp formatting tests passed');

  const manualText = `[00:00] Welcome to this crash course on artificial intelligence.
[00:15] Today we will cover neural networks, transformers, and large language models.
[00:45] Let's begin by defining what machine learning actually represents in modern computing.`;

  const processed = processManualTranscript(manualText);
  assert.strictEqual(processed.source, 'manual-input');
  assert.strictEqual(processed.items.length, 3);
  assert.strictEqual(processed.items[0].timestamp, '00:00');
  assert.strictEqual(processed.items[1].timestamp, '00:15');
  assert.ok(processed.wordCount > 15);
  console.log('Manual transcript processing tests passed');

  let shortErrorThrown = false;
  try {
    processManualTranscript('Too short');
  } catch (err) {
    shortErrorThrown = true;
    assert.strictEqual(err.statusCode, 400);
  }
  assert.ok(shortErrorThrown);
  console.log('Short manual transcript rejection test passed');

  const metadata = await getVideoMetadata('dQw4w9WgXcQ');
  assert.ok(metadata.videoId === 'dQw4w9WgXcQ');
  assert.ok(metadata.title.length > 0);
  assert.ok(metadata.thumbnailUrl.length > 0);
  console.log(`Metadata retrieval test passed (Title: "${metadata.title}")`);

  const { fetchYouTubeTranscript } = await import('../services/transcriptService.js');
  try {
    const transcript = await fetchYouTubeTranscript('dQw4w9WgXcQ');
    console.log(`Live transcript fetch succeeded with ${transcript.items.length} items`);
  } catch (err) {
    console.log(`Live transcript fetch handled: [${err.statusCode}] ${err.message}`);
    assert.ok(err.statusCode === 422 || err.statusCode === 404);
    assert.strictEqual(err.details?.canUseManualFallback, true);
  }

  console.log('ALL PHASE 2 TESTS PASSED SUCCESSFULLY');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
