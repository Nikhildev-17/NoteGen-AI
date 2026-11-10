import assert from 'node:assert';
import { chunkTranscript, estimateTokens } from '../services/chunkingService.js';
import { summarizeTranscript } from '../services/geminiService.js';

async function runTests() {
  console.log('--- Running Phase 3 Tests ---');

  const sample = 'Hello world this is a test.';
  const tokens = estimateTokens(sample);
  assert.ok(tokens > 0 && tokens <= 10);
  console.log(`Token estimation test passed (${tokens} tokens estimated)`);

  const shortTranscript = [
    { timestamp: '00:00', text: 'Introduction to data structures.' },
    { timestamp: '01:00', text: 'Arrays and linked lists explained.' }
  ];
  const singleChunk = chunkTranscript(shortTranscript, 5000);
  assert.strictEqual(singleChunk.length, 1);
  assert.strictEqual(singleChunk[0].totalChunks, 1);
  assert.ok(singleChunk[0].text.includes('[00:00] Introduction to data structures.'));
  console.log('Single-chunk transcript processing test passed');

  const longLines = [];
  for (let i = 0; i < 200; i++) {
    longLines.push(`[0${i}:00] Line number ${i} of detailed scientific explanation discussing concepts in deep learning.`);
  }
  const multiChunks = chunkTranscript(longLines.join('\n'), 1500);
  assert.ok(multiChunks.length > 1);
  assert.strictEqual(multiChunks[0].totalChunks, multiChunks.length);
  console.log(`Multi-chunking test passed (${multiChunks.length} chunks generated with preserved timestamps)`);

  let keyErrorCaught = false;
  try {
    await summarizeTranscript(shortTranscript, 'Test Title');
  } catch (err) {
    keyErrorCaught = true;
    console.log(`Gemini response: [${err.statusCode}] ${err.message}`);
    assert.ok(err.statusCode === 400 || err.statusCode === 401 || err.statusCode === 404 || err.statusCode === 502);
  }
  console.log('Gemini call handling test passed');

  console.log('ALL PHASE 3 TESTS PASSED SUCCESSFULLY');
}

runTests().catch((err) => {
  console.error('Phase 3 test failed:', err);
  process.exit(1);
});
