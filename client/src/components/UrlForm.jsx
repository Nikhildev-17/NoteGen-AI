import React, { useState } from 'react';
import {
  Youtube,
  Sparkles,
  Clipboard,
  X,
  ArrowRight,
  Loader2,
  PlaySquare,
  Lock,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SAMPLES = [
  {
    label: 'Steve Jobs: Stanford',
    url: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc',
  },
  {
    label: 'Neural Networks',
    url: 'https://www.youtube.com/watch?v=aircAruvnKk',
  },
  {
    label: 'Science & Thinking',
    url: 'https://www.youtube.com/watch?v=UBVV8pch1dM',
  },
];

export default function UrlForm({
  onSubmitUrl,
  onOpenManualModal,
  isLoading,
}) {
  const { isAuthenticated, openAuth } = useAuth();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handlePaste = async () => {
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setError('');
      }
    } catch {
      setError('Clipboard access was blocked. You can paste the URL directly into the field.');
    }
  };

  const handleClear = () => {
    setUrl('');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      openAuth('login');
      return;
    }

    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a YouTube video URL.');
      return;
    }

    const ytRegex =
      /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/)|youtu\.be\/|[a-zA-Z0-9_-]{11})/;

    if (!ytRegex.test(trimmed)) {
      setError('Please provide a valid YouTube URL, such as https://youtube.com/watch?v=...');
      return;
    }

    setError('');
    onSubmitUrl(trimmed);
  };

  const handleSelectSample = (sampleUrl) => {
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }
    setUrl(sampleUrl);
    setError('');
    onSubmitUrl(sampleUrl);
  };

  return (
    <section className="url-section" style={{ padding: '2.5rem 0 1rem' }}>
      <div className="url-intro" style={{ maxWidth: '760px', margin: '0 auto 1.75rem', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            marginBottom: '0.75rem',
            color: '#3b82f6',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.1em',
          }}
        >
          <Sparkles size={14} />
          AI-POWERED YOUTUBE STUDY ASSISTANT
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: '0.75rem' }}>
          Turn YouTube Videos into <span style={{ color: '#3b82f6' }}>Master Study Notes</span>
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '620px', margin: '0 auto' }}>
          Extract comprehensive notes, key takeaways, chapter breakdowns, and terminology from lectures, talks, and tutorials.
        </p>
      </div>

      <div className="glass-card" style={{ maxWidth: '820px', margin: '0 auto', padding: '1.75rem', position: 'relative' }}>
        {!isAuthenticated && (
          <div
            className="animate-fade-in"
            style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Lock size={18} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: '#f8fafc' }}>
                  Sign in required to generate notes
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Please sign in or create an account to paste YouTube URLs and access your saved notes.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => openAuth('login')}
                className="btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                <LogIn size={15} />
                <span>Sign In First</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            YouTube Video Link:
          </label>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-input)',
              border: error ? '1px solid #ef4444' : '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.5rem',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ paddingLeft: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
              <Youtube size={24} />
            </div>

            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              onFocus={() => {
                if (!isAuthenticated) {
                  openAuth('login');
                }
              }}
              placeholder={
                isAuthenticated
                  ? 'Paste YouTube link (e.g. https://www.youtube.com/watch?v=...)'
                  : 'Sign in first to paste a YouTube link...'
              }
              disabled={isLoading}
              style={{
                flex: 1,
                minWidth: '220px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                padding: '0.5rem',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {url && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isLoading}
                  className="btn-ghost"
                  title="Clear input"
                >
                  <X size={16} />
                </button>
              )}

              <button
                type="button"
                onClick={handlePaste}
                disabled={isLoading}
                className="btn-ghost"
                title="Paste from clipboard"
              >
                <Clipboard size={15} /> Paste
              </button>

              <button
                type="submit"
                disabled={isLoading || (isAuthenticated && !url.trim())}
                className="btn-primary"
                style={{ whiteSpace: 'nowrap' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : !isAuthenticated ? (
                  <>
                    <Lock size={16} />
                    <span>Sign In to Generate</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate Notes</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="animate-fade-in" style={{ color: '#f87171', fontSize: '0.825rem', marginTop: '0.5rem', paddingLeft: '0.5rem' }}>
              {error}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.25rem',
              padding: '0 0.5rem',
              gap: '0.75rem',
              fontSize: '0.825rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>Try examples:</span>
              {SAMPLES.map((sample) => (
                <button
                  key={sample.url}
                  type="button"
                  onClick={() => handleSelectSample(sample.url)}
                  disabled={isLoading}
                  className="btn-ghost"
                  style={{
                    fontSize: '0.775rem',
                    padding: '0.2rem 0.55rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <PlaySquare size={12} color="#3b82f6" />
                  <span>{sample.label}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  openAuth('login');
                } else {
                  onOpenManualModal();
                }
              }}
              disabled={isLoading}
              className="btn-ghost"
              style={{ color: '#60a5fa', fontWeight: 600 }}
            >
              Have a transcript? Paste manually
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
