import mongoose from 'mongoose';

const ChapterSchema = new mongoose.Schema(
  {
    timestamp: { type: String, default: '00:00' },
    title: { type: String, required: true },
    summary: { type: String, default: '' },
  },
  { _id: false }
);

const TerminologySchema = new mongoose.Schema(
  {
    term: { type: String, required: true },
    definition: { type: String, required: true },
  },
  { _id: false }
);

const StructuredNoteSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    summary: { type: String, default: '' },
    details: [{ type: String }],
  },
  { _id: false }
);

const FlashcardSchema = new mongoose.Schema(
  {
    front: { type: String, required: true },
    back: { type: String, required: true },
  },
  { _id: false }
);

const SummaryPayloadSchema = new mongoose.Schema(
  {
    overview: { type: String, required: true },
    keyTakeaways: [{ type: String }],
    structuredNotes: [StructuredNoteSchema],
    terminology: [TerminologySchema],
    chapters: [ChapterSchema],
    flashcards: [FlashcardSchema],
    revisionSummary: { type: String, default: '' },
  },
  { _id: false }
);

const VideoSummarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    videoId: {
      type: String,
      required: [true, 'Video ID is required'],
      index: true,
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
    },
    authorName: {
      type: String,
      default: 'YouTube Creator',
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    transcriptSource: {
      type: String,
      enum: ['youtube-automatic', 'manual-input'],
      default: 'youtube-automatic',
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    summary: {
      type: SummaryPayloadSchema,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  }
);

VideoSummarySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const VideoSummary = mongoose.model('VideoSummary', VideoSummarySchema);
