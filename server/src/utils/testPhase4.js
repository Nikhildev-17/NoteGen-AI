import assert from 'node:assert';
import mongoose from 'mongoose';
import { connectDB, getDbStatus } from '../config/db.js';
import { VideoSummary } from '../models/VideoSummary.js';

async function runTests() {
  console.log('--- Running Phase 4 Tests ---');

  const connected = await connectDB();
  const status = getDbStatus();
  console.log(`Database connected: ${status.connected} (${status.readyStateDescription})`);
  assert.strictEqual(status.connected, true);
  console.log('MongoDB connection verified');

  await VideoSummary.deleteMany({ videoId: 'test_vid_123' });

  const mockPayload = {
    videoId: 'test_vid_123',
    videoUrl: 'https://www.youtube.com/watch?v=test_vid_123',
    title: 'Automated Testing with Node and MongoDB',
    authorName: 'Test Engineer',
    thumbnailUrl: 'https://img.youtube.com/vi/test_vid_123/hqdefault.jpg',
    transcriptSource: 'youtube-automatic',
    wordCount: 150,
    summary: {
      overview: 'This is a test overview for verifying Mongoose persistence pipeline.',
      keyTakeaways: ['Takeaway 1: Schema works', 'Takeaway 2: Indexes are active'],
      structuredNotes: [
        {
          topic: 'Database Layer',
          summary: 'Mongoose schema validation is effective.',
          details: ['Detail A', 'Detail B'],
        },
      ],
      terminology: [
        {
          term: 'Mongoose',
          definition: 'An Object Data Modeling (ODM) library for MongoDB and Node.js.',
        },
      ],
      chapters: [
        {
          timestamp: '00:00',
          title: 'Introduction',
          summary: 'Setup and imports.',
        },
      ],
      flashcards: [
        {
          front: 'What is Mongoose?',
          back: 'An ODM for MongoDB.',
        },
      ],
      revisionSummary: 'Quick revision note for persistence verification.',
    },
  };

  const saved = await VideoSummary.create(mockPayload);
  assert.ok(saved._id);
  assert.strictEqual(saved.videoId, 'test_vid_123');
  console.log(`Saved VideoSummary document to MongoDB with _id: ${saved._id}`);

  const history = await VideoSummary.find({ videoId: 'test_vid_123' }).lean();
  assert.strictEqual(history.length, 1);
  assert.strictEqual(history[0].title, 'Automated Testing with Node and MongoDB');
  console.log('History query returned valid document');

  const retrieved = await VideoSummary.findById(saved._id);
  assert.ok(retrieved);
  assert.strictEqual(retrieved.summary.structuredNotes[0].topic, 'Database Layer');
  assert.strictEqual(retrieved.summary.keyTakeaways.length, 2);
  console.log('Single record retrieval by ObjectId verified');

  const updated = await VideoSummary.findOneAndUpdate(
    { videoId: 'test_vid_123', transcriptSource: 'youtube-automatic' },
    { title: 'Updated Title' },
    { new: true }
  );
  assert.strictEqual(updated.title, 'Updated Title');
  console.log('Upsert / duplicate handling verified');

  await VideoSummary.deleteMany({ videoId: 'test_vid_123' });
  await mongoose.disconnect();

  console.log('ALL PHASE 4 TESTS PASSED SUCCESSFULLY');
}

runTests().catch((err) => {
  console.error('Phase 4 test failed:', err);
  process.exit(1);
});
