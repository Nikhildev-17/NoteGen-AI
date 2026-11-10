import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import UrlForm from './components/UrlForm';
import ManualTranscriptModal from './components/ManualTranscriptModal';
import ProcessingState from './components/ProcessingState';
import ResultsViewer from './components/ResultsViewer';
import HistoryDrawer from './components/HistoryDrawer';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import { api } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertCircle, FileText, Sparkles, Youtube, Layers } from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, openAuth } = useAuth();
  const [health, setHealth] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [failedUrlForFallback, setFailedUrlForFallback] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const refreshHistory = useCallback(async () => {
    if (!localStorage.getItem('notegen_token')) {
      setHistory([]);
      return;
    }
    try {
      const data = await api.getHistory();
      if (data?.data) {
        setHistory(data.data);
      }
    } catch (err) {
      console.warn('History fetch error:', err.message);
    }
  }, []);

  useEffect(() => {
    api.checkHealth()
      .then((data) => setHealth(data))
      .catch((err) => console.warn('Health check error:', err.message));

    refreshHistory();
  }, [refreshHistory, user]);

  const handleSummarizeUrl = async (url) => {
    if (!isAuthenticated) {
      openAuth('login');
      showToast('Please sign in first to generate and save notes.', 'info');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.summarizeVideo({ url });
      if (res.data) {
        setCurrentResult(res.data);
        showToast(res.cached ? 'Loaded cached summary from database!' : 'Generated study notes successfully!', 'success');
        refreshHistory();
      }
    } catch (err) {
      console.error('Summarize error:', err);
      const isManualPossible = err.details?.canUseManualFallback || err.message.toLowerCase().includes('transcript');

      setError({
        message: err.message || 'An error occurred during video processing.',
        canFallback: isManualPossible,
        url,
      });

      if (isManualPossible) {
        setFailedUrlForFallback(url);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarizeManual = async ({ manualTranscript, url }) => {
    if (!isAuthenticated) {
      openAuth('login');
      showToast('Please sign in first to generate and save notes.', 'info');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsManualModalOpen(false);

    try {
      const res = await api.summarizeVideo({ manualTranscript, url });
      if (res.data) {
        setCurrentResult(res.data);
        showToast('Generated notes from custom transcript!', 'success');
        refreshHistory();
      }
    } catch (err) {
      console.error('Manual summarize error:', err);
      setError({
        message: err.message || 'Failed to process manual transcript.',
        canFallback: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = async (idOrVideoId) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.getVideoById(idOrVideoId);
      if (res.data) {
        setCurrentResult(res.data);
        showToast('Opened saved notes from history!', 'info');
      }
    } catch (err) {
      console.error('Get by ID error:', err);
      showToast('Could not load saved notes: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistoryItem = async (id) => {
    try {
      await api.deleteVideo(id);
      showToast('Removed summary from history.', 'success');
      refreshHistory();
      if (currentResult && (currentResult._id === id || currentResult.videoId === id)) {
        setCurrentResult(null);
      }
    } catch (err) {
      showToast(err.message || 'Could not delete summary.', 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        health={health}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        historyCount={history.length}
      />

      <main className="container" style={{ flex: 1, paddingBottom: '3rem' }}>
        <UrlForm
          onSubmitUrl={handleSummarizeUrl}
          onOpenManualModal={() => {
            if (!isAuthenticated) {
              openAuth('login');
              showToast('Please sign in first to enter transcripts.', 'info');
            } else {
              setFailedUrlForFallback('');
              setIsManualModalOpen(true);
            }
          }}
          isLoading={isLoading}
        />

        {error && (
          <div
            className="animate-fade-in"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem 1.5rem',
              margin: '1.5rem 0',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
              <AlertCircle size={22} color="#f87171" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
              <div>
                <h4 style={{ color: '#f87171', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                  Processing Notice
                </h4>
                <p style={{ color: '#e2e8f0', fontSize: '0.875rem', lineHeight: 1.5 }}>
                  {error.message}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {error.canFallback && (
                <button
                  onClick={() => setIsManualModalOpen(true)}
                  className="btn-primary"
                  style={{ background: '#3b82f6', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  <FileText size={15} />
                  <span>Paste Transcript Manually</span>
                </button>
              )}
              <button
                onClick={() => setError(null)}
                className="btn-ghost"
                style={{ fontSize: '0.8rem' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {isLoading && <ProcessingState />}

        {!isLoading && currentResult && (
          <ResultsViewer
            data={currentResult}
            onShowToast={showToast}
          />
        )}

        {!isLoading && !currentResult && (
          <div
            style={{
              marginTop: '2rem',
              padding: '2.5rem 1.5rem',
              borderRadius: 'var(--radius-xl)',
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px dashed var(--border)',
              textAlign: 'center',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              How It Works
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '560px', margin: '0 auto 2rem auto' }}>
              Extract comprehensive academic study notes, chapter breakdowns, and terminology from any video in 3 steps:
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                maxWidth: '900px',
                margin: '0 auto',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                }}
              >
                <div
                  style={{
                    color: '#ef4444',
                    background: 'rgba(239, 68, 68, 0.1)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                  }}
                >
                  <Youtube size={20} />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>1. Paste Video URL</h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Sign in and enter any public YouTube video link, shorts, or direct video ID.
                </p>
              </div>

              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                }}
              >
                <div
                  style={{
                    color: '#3b82f6',
                    background: 'rgba(59, 130, 246, 0.1)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                  }}
                >
                  <Layers size={20} />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>2. Subtitle Processing</h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Captions are extracted and chunked with timestamp markers preserved.
                </p>
              </div>

              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                }}
              >
                <div
                  style={{
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.1)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                  }}
                >
                  <Sparkles size={20} />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>3. Gemini Synthesis</h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Generates structured takeaways, detailed notes, glossary, and revision guides saved directly to your account.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <ManualTranscriptModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSubmitManual={handleSummarizeManual}
        isLoading={isLoading}
        initialUrl={failedUrlForFallback}
      />

      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={history}
        onSelectVideo={handleSelectHistoryItem}
        onDeleteVideo={handleDeleteHistoryItem}
        onRefresh={refreshHistory}
        isLoading={isLoading}
        persistedHistoryAvailable={health?.database?.connected ?? true}
      />

      <AuthModal onShowToast={showToast} />
      <Toast toast={toast} onClose={() => setToast(null)} />

      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '1.5rem 0',
          textAlign: 'center',
          color: 'var(--text-dim)',
          fontSize: '0.825rem',
        }}
      >
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
          <span>YouTube AI Summarizer & Notes Generator • MERN Stack & Google Gemini</span>
          <span>Open Source Developer Portfolio Project</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
