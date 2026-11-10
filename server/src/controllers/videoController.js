import mongoose from 'mongoose';
import { extractVideoId, getYouTubeLinks } from '../utils/youtube.js';
import { getVideoMetadata } from '../services/metadataService.js';
import { fetchYouTubeTranscript, processManualTranscript } from '../services/transcriptService.js';
import { summarizeTranscript } from '../services/geminiService.js';
import { VideoSummary } from '../models/VideoSummary.js';
import { getDbStatus } from '../config/db.js';
import { AppError } from '../utils/errors.js';

export async function summarizeVideo(req, res, next) {
  try {
    const { url, manualTranscript, forceRefresh = false } = req.body;

    if (!req.user) {
      throw new AppError('Please sign in to generate and save video notes.', 401);
    }

    if (!url && !manualTranscript) {
      throw new AppError('Please provide a YouTube video URL or paste a transcript to summarize.', 400);
    }

    let videoId = null;
    let videoUrl = url || '';

    if (url) {
      videoId = extractVideoId(url);
      if (!videoId) {
        throw new AppError('Invalid YouTube URL or video ID. Please check the link and try again.', 400);
      }
      videoUrl = getYouTubeLinks(videoId).watchUrl;
    } else {
      videoId = 'manual_' + Date.now().toString(36);
      videoUrl = `manual://custom-transcript-${videoId}`;
    }

    const dbStatus = getDbStatus();
    const transcriptSource = manualTranscript ? 'manual-input' : 'youtube-automatic';
    const userId = req.user._id;

    if (dbStatus.connected && !forceRefresh && !manualTranscript) {
      const cached = await VideoSummary.findOne({ userId, videoId, transcriptSource }).sort({ createdAt: -1 });
      if (cached) {
        return res.status(200).json({
          success: true,
          cached: true,
          data: cached,
        });
      }
    }

    const metadata = url ? await getVideoMetadata(videoId) : {
      videoId,
      title: 'Custom Transcript Notes',
      authorName: 'Manual Entry',
      authorUrl: '',
      thumbnailUrl: '',
      watchUrl: videoUrl,
    };

    let transcriptData;
    if (manualTranscript && manualTranscript.trim().length > 0) {
      transcriptData = processManualTranscript(manualTranscript);
    } else {
      transcriptData = await fetchYouTubeTranscript(videoId);
    }

    const generatedNotes = await summarizeTranscript(transcriptData.fullText, metadata.title);

    let savedRecord = null;
    if (dbStatus.connected) {
      try {
        savedRecord = await VideoSummary.findOneAndUpdate(
          { userId, videoId, transcriptSource },
          {
            userId,
            videoId,
            videoUrl,
            title: metadata.title,
            authorName: metadata.authorName,
            thumbnailUrl: metadata.thumbnailUrl,
            transcriptSource: transcriptData.source,
            wordCount: transcriptData.wordCount,
            summary: generatedNotes,
            updatedAt: new Date(),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (dbErr) {
        console.warn(`Failed to persist summary to MongoDB: ${dbErr.message}`);
      }
    }

    const responsePayload = savedRecord ? savedRecord.toObject() : {
      userId,
      videoId,
      videoUrl,
      title: metadata.title,
      authorName: metadata.authorName,
      thumbnailUrl: metadata.thumbnailUrl,
      transcriptSource: transcriptData.source,
      wordCount: transcriptData.wordCount,
      summary: generatedNotes,
      createdAt: new Date().toISOString(),
      persisted: Boolean(savedRecord),
    };

    return res.status(200).json({
      success: true,
      cached: false,
      data: responsePayload,
    });
  } catch (error) {
    next(error);
  }
}

export async function getHistory(req, res, next) {
  try {
    const dbStatus = getDbStatus();
    if (!dbStatus.connected) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        persistedHistoryAvailable: false,
        message: 'MongoDB is currently unavailable.',
      });
    }

    if (!req.user) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        persistedHistoryAvailable: true,
        message: 'Please sign in to view your saved history.',
      });
    }

    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };

    const history = await VideoSummary.find(filter)
      .select('videoId videoUrl title authorName thumbnailUrl transcriptSource wordCount createdAt summary.overview userId')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
      persistedHistoryAvailable: true,
    });
  } catch (error) {
    next(error);
  }
}

export async function getVideoById(req, res, next) {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (!dbStatus.connected) {
      throw new AppError('MongoDB is currently unavailable. Cannot retrieve saved record.', 503);
    }

    let query = { videoId: id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { videoId: id }] };
    }

    const record = await VideoSummary.findOne(query);

    if (!record) {
      throw new AppError(`No saved notes found for video ID: "${id}"`, 404);
    }

    if (
      record.userId &&
      req.user &&
      req.user.role !== 'admin' &&
      record.userId.toString() !== req.user._id.toString()
    ) {
      throw new AppError('You do not have permission to view this study guide.', 403);
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteVideo(req, res, next) {
  try {
    const { id } = req.params;
    const dbStatus = getDbStatus();

    if (!dbStatus.connected) {
      throw new AppError('MongoDB is currently unavailable.', 503);
    }

    let query = { videoId: id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { videoId: id }] };
    }

    const record = await VideoSummary.findOne(query);

    if (!record) {
      throw new AppError('Video summary not found.', 404);
    }

    if (
      record.userId &&
      req.user &&
      req.user.role !== 'admin' &&
      record.userId.toString() !== req.user._id.toString()
    ) {
      throw new AppError('You do not have permission to delete this summary.', 403);
    }

    await VideoSummary.deleteOne(query);

    return res.status(200).json({
      success: true,
      message: 'Video summary removed successfully.',
    });
  } catch (error) {
    next(error);
  }
}
