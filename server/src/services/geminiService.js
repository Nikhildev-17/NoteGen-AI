import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { chunkTranscript } from './chunkingService.js';

function getGenAIClient() {
  if (!config.geminiApiKey || config.geminiApiKey.trim().length === 0) {
    throw new AppError(
      'Gemini API key is not configured. Please set GEMINI_API_KEY in server/.env to enable AI summarization.',
      400,
      { code: 'GEMINI_KEY_MISSING' }
    );
  }
  return new GoogleGenAI({ apiKey: config.geminiApiKey.trim() });
}

function extractJsonString(rawText) {
  if (!rawText) return '{}';
  const clean = rawText.trim();
  const jsonMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }
  return clean;
}

function sanitizeAiOutput(parsed) {
  const data = typeof parsed === 'object' && parsed !== null ? parsed : {};

  return {
    overview: typeof data.overview === 'string' && data.overview.trim().length > 0
      ? data.overview.trim()
      : 'Overview was not generated for this transcript.',
    keyTakeaways: Array.isArray(data.keyTakeaways)
      ? data.keyTakeaways.filter((item) => typeof item === 'string' && item.trim().length > 0)
      : [],
    structuredNotes: Array.isArray(data.structuredNotes)
      ? data.structuredNotes.map((note) => ({
          topic: note?.topic || 'Key Topic',
          summary: note?.summary || '',
          details: Array.isArray(note?.details) ? note.details.filter(Boolean) : [],
        }))
      : [],
    terminology: Array.isArray(data.terminology)
      ? data.terminology.map((t) => ({
          term: t?.term || 'Concept',
          definition: t?.definition || '',
        }))
      : [],
    chapters: Array.isArray(data.chapters)
      ? data.chapters.map((ch) => ({
          timestamp: ch?.timestamp || '00:00',
          title: ch?.title || 'Section',
          summary: ch?.summary || '',
        }))
      : [],
    flashcards: (() => {
      let cards = Array.isArray(data.flashcards)
        ? data.flashcards
            .filter((f) => f && typeof f.front === 'string' && typeof f.back === 'string' && f.front.trim().length > 0)
            .map((f) => ({ front: f.front.trim(), back: f.back.trim() }))
        : [];

      if (cards.length === 0) {
        if (Array.isArray(data.terminology)) {
          data.terminology.forEach((t) => {
            if (t?.term && t?.definition) {
              cards.push({
                front: `What is "${t.term.trim()}"?`,
                back: t.definition.trim(),
              });
            }
          });
        }
        if (Array.isArray(data.keyTakeaways)) {
          data.keyTakeaways.slice(0, 5).forEach((k, idx) => {
            if (typeof k === 'string' && k.trim().length > 0) {
              cards.push({
                front: `Key Concept #${idx + 1}: What is the core takeaway regarding this?`,
                back: k.trim(),
              });
            }
          });
        }
      }
      return cards;
    })(),
    revisionSummary: typeof data.revisionSummary === 'string'
      ? data.revisionSummary.trim()
      : 'No quick revision summary available.',
  };
}

function buildPrompt(transcriptText, videoTitle = '') {
  return `You are an elite educational AI assistant, university lecturer, and master note-taker.
Your mission is to generate comprehensive, highly structured, well-organized, and deeply educational study notes from the following video transcript.

${videoTitle ? `Video Title: "${videoTitle}"\n` : ''}

TRANSCRIPT:
"""
${transcriptText}
"""

CRITICAL INSTRUCTIONS:
1. Provide accurate, thorough, faithful notes based strictly on the content discussed in the transcript.
2. DO NOT hallucinate facts, outside trivia, or unsupported statements.
3. You must respond with valid JSON ONLY conforming to the exact schema specified below. Do not wrap with conversational filler.

REQUIRED JSON SCHEMA:
{
  "overview": "A comprehensive 2-3 paragraph executive summary explaining the core message, context, and significance of the video.",
  "keyTakeaways": [
    "Most crucial takeaway 1",
    "Most crucial takeaway 2",
    "Most crucial takeaway 3"
  ],
  "structuredNotes": [
    {
      "topic": "Specific Topic or Theme Name",
      "summary": "Coherent explanation of the topic discussed in the video.",
      "details": [
        "In-depth explanation or sub-point A",
        "In-depth explanation or sub-point B",
        "Practical example or real-world application cited"
      ]
    }
  ],
  "terminology": [
    {
      "term": "Key Technical Term or Concept",
      "definition": "Precise, clear definition and how it is used in the video."
    }
  ],
  "chapters": [
    {
      "timestamp": "MM:SS",
      "title": "Descriptive Chapter Name",
      "summary": "Brief explanation of what occurs in this section."
    }
  ],
  "flashcards": [
    {
      "front": "A targeted question, prompt, or challenge testing deep conceptual understanding",
      "back": "A concise, accurate, educational answer or explanation"
    }
  ],
  "revisionSummary": "A concise, high-yield rapid review summary (cheat-sheet style) ideal for quick exam or memory revision."
}`;
}

async function callGemini(prompt) {
  const ai = getGenAIClient();
  const configuredModel = config.geminiModel || 'gemini-3.5-flash-lite';
  const candidateModels = Array.from(new Set([
    configuredModel,
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ]));

  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text ? response.text : response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new AppError('Gemini returned an empty response. Please try again.', 502);
      }

      const cleanJson = extractJsonString(text);
      let parsed;
      try {
        parsed = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error('Failed to parse Gemini JSON output:', text);
        throw new AppError('Failed to parse structured JSON from AI output.', 502, { raw: text });
      }

      return sanitizeAiOutput(parsed);
    } catch (error) {
      if (error instanceof AppError && error.statusCode !== 502) throw error;

      const errMsg = error.message || '';
      if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid')) {
        throw new AppError('The configured Gemini API key is invalid or inactive. Please check server/.env', 401);
      }
      if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
        throw new AppError('Gemini API rate limit or quota exceeded. Please wait a moment and try again.', 429);
      }

      lastError = error;
    }
  }

  let safeMessage = lastError?.message || 'All candidate Gemini models failed.';
  if (config.geminiApiKey) {
    safeMessage = safeMessage.replaceAll(config.geminiApiKey, '[REDACTED]');
  }

  throw new AppError(`Gemini AI service error: ${safeMessage}`, 502);
}

export async function summarizeTranscript(transcriptInput, videoTitle = '') {
  const chunks = chunkTranscript(transcriptInput);

  if (chunks.length === 0) {
    throw new AppError('Transcript has no readable content to summarize.', 400);
  }

  if (chunks.length === 1) {
    const prompt = buildPrompt(chunks[0].text, videoTitle);
    return await callGemini(prompt);
  }

  const intermediateSummaries = await Promise.all(
    chunks.map(async (chunk) => {
      const chunkPrompt = `You are an educational assistant analyzing part ${chunk.chunkIndex + 1} of ${chunk.totalChunks} of a video transcript.
Video Title: "${videoTitle}"

Transcript segment:
"""
${chunk.text}
"""

Please provide a structured summary of this section only, preserving timestamps, key facts, definitions, and main topics. Return valid JSON:
{
  "sectionSummary": "Summary of this section",
  "topics": ["topic 1", "topic 2"],
  "definitions": [{"term": "...", "definition": "..."}],
  "keyPoints": ["point 1", "point 2"],
  "chapters": [{"timestamp": "MM:SS", "title": "...", "summary": "..."}]
}`;
      return callGemini(chunkPrompt);
    })
  );

  const synthesisPrompt = `You are an elite educational AI assistant.
Combine the following intermediate notes from consecutive segments of the video "${videoTitle}" into a unified, coherent, master study guide.

INTERMEDIATE SEGMENTS:
${JSON.stringify(intermediateSummaries, null, 2)}

Produce the final comprehensive JSON document conforming to this exact schema:
{
  "overview": "2-3 paragraph complete overview of the whole video",
  "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3", "takeaway 4"],
  "structuredNotes": [
    {
      "topic": "Unified Topic Name",
      "summary": "Clear explanation",
      "details": ["sub-point 1", "sub-point 2"]
    }
  ],
  "terminology": [
    {
      "term": "Term",
      "definition": "Definition"
    }
  ],
  "chapters": [
    {
      "timestamp": "MM:SS",
      "title": "Chapter title",
      "summary": "Summary"
    }
  ],
  "flashcards": [
    {
      "front": "Question testing conceptual mastery",
      "back": "Comprehensive answer"
    }
  ],
  "revisionSummary": "Concise high-yield revision summary"
}`;

  return await callGemini(synthesisPrompt);
}
