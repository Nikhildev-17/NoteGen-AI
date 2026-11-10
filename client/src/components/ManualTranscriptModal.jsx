import React, { useState } from 'react';
import { X, FileText, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export default function ManualTranscriptModal({ isOpen, onClose, onSubmitManual, isLoading, initialUrl = '' }) {
  const [transcript, setTranscript] = useState('');
  const [videoUrl, setVideoUrl] = useState(initialUrl);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (wordCount < 15) {
      setError('Please provide at least 15 words of transcript text to generate meaningful notes.');
      return;
    }
    setError('');
    onSubmitManual({ manualTranscript: transcript, url: videoUrl.trim() || undefined });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 8, 15, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '1.25rem',
      }}
      className="animate-fade-in"
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem',
          position: 'relative',
          background: '#0d1322',
          border: '1px solid #273553',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                padding: '0.5rem',
                borderRadius: '8px',
                display: 'flex',
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Manual Transcript Input</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Paste subtitles, speaker dialogue, or article text to generate notes.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.35rem' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Associated YouTube URL (Optional):
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                padding: '0.65rem 0.85rem',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Transcript / Captions Text:
              </label>
              <span style={{ fontSize: '0.8rem', color: wordCount >= 15 ? '#10b981' : '#f59e0b' }}>
                {wordCount} words {wordCount < 15 ? '(min 15 required)' : '✓'}
              </span>
            </div>
            <textarea
              rows={10}
              value={transcript}
              onChange={(e) => { setTranscript(e.target.value); setError(''); }}
              placeholder="Paste raw transcript here. Timestamps like [00:15] or 01:23 are automatically detected and preserved!"
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: error ? '1px solid #ef4444' : '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                padding: '0.85rem',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || wordCount < 15}
              className="btn-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Notes from Transcript</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
