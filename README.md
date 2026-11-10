# 🎬 NoteGen AI — YouTube AI Summarizer & Notes Generator

A full-stack **MERN** application powered by **Google Gemini** that transforms public YouTube videos and user-provided transcripts into comprehensive, educational study guides, structured topic notes, glossaries, and chapter summaries.

---

## 🌟 Key Features

- **⚡ End-to-End MERN Stack Architecture**: React + Vite frontend backed by an Express + Node.js REST API with MongoDB persistence.
- **🎯 Intelligent YouTube Parsing**: Supports standard YouTube links, `youtu.be` short links, `/shorts/`, `/embed/`, and direct 11-character video IDs.
- **📑 Automatic Transcript Extraction**: Retrieves subtitles directly with HTML-entity decoding and accurate timestamp extraction.
- **✍️ Manual Transcript Fallback**: When video captions are disabled or unavailable, users can paste transcript text or notes directly to generate notes.
- **🤖 Google Gemini AI Integration**: Uses the official Google Gen AI SDK (`@google/genai`) with configurable models (default: `gemini-2.5-flash`).
- **📏 Bounded Long-Transcript Chunking**: Estimates token sizes, splits long lectures into coherent segments, preserves timestamps, and synthesizes intermediate summaries into a master guide.
- **📚 Rich Structured Study Guide**:
  1. **Executive Overview**: High-level contextual summary of the entire video.
  2. **Key Takeaways**: Bulleted highlight cards of the most essential insights.
  3. **Topic-by-Topic Detailed Notes**: In-depth conceptual explanations with sub-points.
  4. **Terminology & Definitions**: Glossary cards for technical jargon and foundational concepts.
  5. **Chapters & Clickable Timestamps**: Timestamps link directly to that exact moment on YouTube (`&t=Xs`).
  6. **Quick Revision Cheat-Sheet**: High-yield rapid review summary ideal for exams.
- **💾 MongoDB Persistence & Smart Caching**: Automatically saves generated notes to MongoDB and re-serves cached summaries on repeat queries to save AI tokens.
- **🕒 Interactive History Drawer**: Searchable slide-over drawer displaying past processed videos with thumbnails, channel names, dates, and 1-click reloading.
- **📋 Export & Portability**: 1-click copy for individual sections or full Markdown, `.md` file download, and print-to-PDF formatting.

---

## 🏗️ Architecture & Processing Pipeline

```
[User Browser / Vite + React]
        │
        │ 1. POST /api/videos/summarize (YouTube URL or Manual Transcript)
        ▼
[Express REST API]
        │
        ├─► 2. Validate URL & Extract Video ID (`utils/youtube.js`)
        ├─► 3. Check MongoDB Cache (`models/VideoSummary.js`)
        │      └─ If cached: Return saved study notes immediately
        │
        ├─► 4. Fetch Video Metadata via oEmbed API (`services/metadataService.js`)
        ├─► 5. Fetch Captions (`services/transcriptService.js`)
        │      └─ On caption error: Returns actionable signal for manual fallback
        │
        ├─► 6. Estimate Size & Divide into Chunks (`services/chunkingService.js`)
        ├─► 7. Gemini AI Generation (`services/geminiService.js`)
        │      └─ Structured JSON schema with defensive validation
        │
        ├─► 8. Save/Upsert Document to MongoDB (`models/VideoSummary.js`)
        │
        ▼
[Structured Response to Client]
```

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 6, JavaScript (ESM), Lucide Icons, Modern CSS3 |
| **Backend** | Node.js (v18+), Express.js (ESM), CORS, Dotenv |
| **Database** | MongoDB, Mongoose 8 (ODM with schema validation and indexing) |
| **Artificial Intelligence** | Google Gemini API via official `@google/genai` SDK |
| **Transcript Pipeline** | `youtube-transcript`, YouTube oEmbed API, Custom Regex Parser |

---

## 📂 Project Directory Structure

```text
youtube-ai-summarizer/
├── client/                     # Frontend Vite + React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Header with live DB/Gemini status pills
│   │   │   ├── UrlForm.jsx              # URL input, clipboard paste, sample links
│   │   │   ├── ManualTranscriptModal.jsx# Fallback input modal with word counter
│   │   │   ├── ProcessingState.jsx      # Animated radar spinner & step progress
│   │   │   ├── ResultsViewer.jsx        # Tabbed/stacked study notes & export buttons
│   │   │   ├── HistoryDrawer.jsx        # Searchable sidebar of saved notes
│   │   │   └── Toast.jsx                # Notification popups
│   │   ├── services/
│   │   │   └── api.js                   # Client HTTP API abstraction
│   │   ├── App.jsx                      # Main application coordinator
│   │   ├── index.css                    # Modern design system & CSS variables
│   │   └── main.jsx                     # Vite React entry point
│   ├── index.html
│   ├── vite.config.js                   # Proxy configuration for /api
│   ├── package.json
│   └── .env.example
│
├── server/                     # Backend Express REST API
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                    # MongoDB connection & status monitoring
│   │   │   └── env.js                   # Centralized configuration loader
│   │   ├── controllers/
│   │   │   └── videoController.js       # Endpoints: summarize, history, getById
│   │   ├── models/
│   │   │   └── VideoSummary.js          # Mongoose schema for persistent notes
│   │   ├── routes/
│   │   │   └── videoRoutes.js           # Express router for /api/videos
│   │   ├── services/
│   │   │   ├── chunkingService.js       # Token estimation & chunking pipeline
│   │   │   ├── geminiService.js         # Google Gen AI SDK client & JSON validator
│   │   │   ├── metadataService.js       # YouTube oEmbed metadata fetcher
│   │   │   └── transcriptService.js     # Captions retrieval & manual parser
│   │   ├── utils/
│   │   │   ├── errors.js                # AppError class & centralized error middleware
│   │   │   ├── youtube.js               # URL validation, video ID & timestamps
│   │   │   ├── testPhase2.js            # Phase 2 test suite
│   │   │   ├── testPhase3.js            # Phase 3 test suite
│   │   │   ├── testPhase4.js            # Phase 4 test suite
│   │   │   └── testEndpoints.js         # HTTP API endpoint test suite
│   │   ├── app.js                       # Express app setup & middleware
│   │   └── server.js                    # Server startup script
│   ├── package.json
│   └── .env.example
│
├── package.json                # Root package for workspace orchestration
├── .gitignore                  # Git ignore rules (node_modules, .env, dist)
├── PROGRESS.md                 # Implementation progress & verification logs
└── README.md                   # Complete documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or later (tested on `v24.14.0`)
- **npm**: `v9.0.0` or later
- **MongoDB**: Local MongoDB instance running on `localhost:27017` or a MongoDB Atlas URI
- **Google Gemini API Key**: Free API key from [Google AI Studio](https://aistudio.google.com/)

---

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository (when configured)
git clone <your-repo-url>
cd youtube-ai-summarizer

# Install all dependencies (root, server, and client in one step)
npm run install:all
```

Or install individually:
```bash
# Root
npm install

# Server
cd server
npm install

# Client
cd ../client
npm install
```

---

### Step 2: Configure Environment Variables

#### Backend Configuration (`server/.env`):
Create `server/.env` by copying `server/.env.example`:
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:5173

# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/youtube_summarizer

# Google Gemini API Key (Required for AI generation)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Configurable Gemini Model (e.g., gemini-2.5-flash, gemini-2.5-pro, gemini-1.5-flash)
GEMINI_MODEL=gemini-2.5-flash
```

#### Frontend Configuration (`client/.env`):
Create `client/.env` by copying `client/.env.example`:
```bash
cp client/.env.example client/.env
```
Default content:
```env
# Leave empty in development to utilize the Vite proxy (/api -> localhost:5000)
VITE_API_URL=http://localhost:5000
```

---

### Step 3: Start the Application

You can start both frontend and backend concurrently from the root directory:

```bash
npm run dev
```

Or run them in separate terminals:

```bash
# Terminal 1 - Backend Server (runs on port 5000 with --watch auto-restart)
npm run dev:server

# Terminal 2 - Frontend Client (runs on port 5173)
npm run dev:client
```

Open your browser at:
👉 **`http://localhost:5173`**

---

## 🧪 Running Automated Tests

Run the full end-to-end backend test suite (testing URL parsing, transcript fetching, chunking, MongoDB schemas, and HTTP endpoints):

```bash
npm test
```

Expected output:
```text
--- Running Phase 2 Tests ---
✅ URL validation & ID extraction tests passed!
✅ Timestamp formatting tests passed!
✅ Manual transcript processing tests passed!
✅ Short manual transcript rejection test passed!
✅ Metadata retrieval test passed!
✅ Live transcript fetch succeeded!
🎉 ALL PHASE 2 TESTS PASSED SUCCESSFULLY!

--- Running Phase 3 Tests ---
✅ Token estimation test passed!
✅ Single-chunk transcript processing test passed!
✅ Multi-chunking test passed!
✅ Missing/invalid key handling test passed!
🎉 ALL PHASE 3 TESTS PASSED SUCCESSFULLY!

--- Running Phase 4 Tests ---
✅ MongoDB connection verified!
✅ Saved VideoSummary document to MongoDB!
✅ History query returned valid document!
✅ Single record retrieval by ObjectId verified!
✅ Upsert / duplicate handling verified!
🎉 ALL PHASE 4 TESTS PASSED SUCCESSFULLY!

--- Testing API Endpoints over HTTP ---
✅ Health endpoint verified over HTTP
✅ History endpoint verified over HTTP
✅ Invalid URL validation rejection verified over HTTP
✅ Gemini API key requirement verified over HTTP
🎉 ALL HTTP API ENDPOINT TESTS PASSED SUCCESSFULLY!
```

To test the client build:
```bash
npm run build:client
```

---

## 📡 REST API Reference

### 1. Health Check
`GET /api/health`
- **Description**: Verifies backend availability, database connection, and Gemini readiness.
- **Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-10-14T16:36:35.803Z",
  "service": "youtube-ai-summarizer-api",
  "environment": "development",
  "geminiConfigured": true,
  "geminiModel": "gemini-2.5-flash",
  "database": {
    "connected": true,
    "readyState": 1,
    "readyStateDescription": "connected"
  }
}
```

### 2. Summarize Video
`POST /api/videos/summarize`
- **Description**: Summarizes a YouTube video or manual transcript and generates structured notes.
- **Request Body**:
```json
{
  "url": "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
  "manualTranscript": "Optional manual transcript text...",
  "forceRefresh": false
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "cached": false,
  "data": {
    "videoId": "UF8uR6Z6KLc",
    "videoUrl": "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
    "title": "Steve Jobs' 2005 Stanford Commencement Address",
    "authorName": "Stanford",
    "thumbnailUrl": "https://img.youtube.com/vi/UF8uR6Z6KLc/hqdefault.jpg",
    "transcriptSource": "youtube-automatic",
    "wordCount": 2184,
    "summary": {
      "overview": "Steve Jobs delivers three life lessons on connecting dots, love and loss, and death...",
      "keyTakeaways": [
        "You can only connect the dots looking backwards.",
        "Your work is going to fill a large part of your life; find what you love."
      ],
      "structuredNotes": [
        {
          "topic": "Connecting the Dots",
          "summary": "How dropping out of Reed College led to learning calligraphy which influenced the Mac.",
          "details": ["Trust in your destiny, karma, or life."]
        }
      ],
      "terminology": [
        {
          "term": "Calligraphy",
          "definition": "Visual art related to writing, essential in the typography of the Macintosh."
        }
      ],
      "chapters": [
        {
          "timestamp": "00:00",
          "title": "Introduction & Dropping Out",
          "summary": "Steve Jobs begins his address to Stanford graduates."
        }
      ],
      "revisionSummary": "Three stories: connecting dots, love/loss, and mortality to maintain purpose."
    },
    "createdAt": "2026-10-14T16:40:00.000Z"
  }
}
```

### 3. Get Processing History
`GET /api/videos/history`
- **Description**: Retrieves recent summaries stored in MongoDB.
- **Response (200 OK)**:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "videoId": "UF8uR6Z6KLc",
      "videoUrl": "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
      "title": "Steve Jobs' 2005 Stanford Commencement Address",
      "authorName": "Stanford",
      "thumbnailUrl": "https://img.youtube.com/vi/UF8uR6Z6KLc/hqdefault.jpg",
      "transcriptSource": "youtube-automatic",
      "createdAt": "2026-10-14T16:40:00.000Z"
    }
  ],
  "persistedHistoryAvailable": true
}
```

### 4. Get Saved Summary By ID
`GET /api/videos/:id`
- **Description**: Retrieves full study notes by MongoDB `_id` or YouTube `videoId`.

---

## 🔒 Security & Best Practices

- **Zero Secret Leakage**: The Google Gemini API key is strictly maintained on the backend in `server/.env`.
- **Client Shielding**: The React frontend never interacts with Google's API directly; all requests route through the Express proxy.
- **Sanitized Errors**: The custom `errorHandler` regex-strips secret keys from exception stack traces and messages.
- **Strict Input Validation**: Video URLs are restricted to YouTube domains and verified with regex before processing.
- **Request Size Limiting**: Express JSON parser enforces size limits (10MB) to guard against denial-of-service payload attacks.
- **CORS Restricted**: Allowed origins are restricted to configured client hosts (`http://localhost:5173`).

---

## 👥 GitHub Collaboration Guide

When collaborating on this repository with teammates:

1. **Git Hygiene**:
   - Never commit `.env` files. Both `server/.env` and `client/.env` are in `.gitignore`.
   - Maintain `.env.example` when adding new configuration parameters.

2. **Branching Strategy**:
   - `main`: Production-ready, fully tested code.
   - `feature/<feature-name>`: Create new feature branches for enhancements (e.g., `feature/pdf-export`, `feature/user-auth`).
   - Create Pull Requests (PRs) into `main` and run `npm test` before merging.

3. **Useful Scripts**:
   - `npm run dev`: Runs both client and server with unified logging.
   - `npm test`: Validates all backend unit and integration tests.
   - `npm run build:client`: Checks for frontend syntax/build regressions.

---

## ⚠️ Known Limitations & Design Decisions

1. **YouTube Subtitle Availability**:
   - Automatic transcript retrieval relies on public captions (creator-uploaded or YouTube auto-generated captions).
   - If captions are turned off by the creator, the backend responds with a clear `422` error signaling that the **Manual Transcript Fallback** is available.
2. **Shared History (MVP)**:
   - For this MVP, saved video summaries in MongoDB are shared among users of the instance. A full multi-tenant authentication system (e.g. JWT / OAuth) can be added as a subsequent iteration.
3. **Gemini API Limits**:
   - If you encounter rate limits (`429 RESOURCE_EXHAUSTED`), please check your quota in Google AI Studio or adjust chunk sizes in `server/src/services/chunkingService.js`.
