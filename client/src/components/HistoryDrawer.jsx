import React, { useState } from 'react';
import { X, History, Search, RefreshCw, Calendar, ArrowRight, Video, FileText, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HistoryDrawer({
  isOpen,
  onClose,
  history = [],
  onSelectVideo,
  onDeleteVideo,
  onRefresh,
  isLoading,
  persistedHistoryAvailable = true
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    const titleMatch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const channelMatch = item.authorName?.toLowerCase().includes(searchTerm.toLowerCase());
    const idMatch = item.videoId?.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || channelMatch || idMatch;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 8, 15, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 250,
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          background: '#0d1322',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                padding: '0.45rem',
                borderRadius: '8px',
                display: 'flex',
              }}
            >
              <History size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Processing History</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {history.length} saved {history.length === 1 ? 'summary' : 'summaries'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="btn-ghost"
              title="Refresh History"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button onClick={onClose} className="btn-ghost" title="Close Drawer">
              <X size={18} />
            </button>
          </div>
        </div>

        <div
          style={{
            padding: '0.75rem 1.25rem',
            background: 'rgba(59, 130, 246, 0.08)',
            borderBottom: '1px solid rgba(59, 130, 246, 0.15)',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-start',
            fontSize: '0.775rem',
            color: '#60a5fa',
          }}
        >
          <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <span>
            {user
              ? `Logged in as ${user.name}: Displaying summaries associated with your account.`
              : 'Sign in to save and manage your private study guide library.'}
          </span>
        </div>

        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 0.75rem',
            }}
          >
            <Search size={15} color="var(--text-dim)" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by video title or channel..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
              }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ color: 'var(--text-dim)' }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
          {!persistedHistoryAvailable && (
            <div
              style={{
                padding: '1rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              MongoDB is disconnected. Past history cannot be fetched.
            </div>
          )}

          {filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                }}
              >
                <Video size={24} color="#64748b" />
              </div>
              <h4 style={{ color: '#cbd5e1', fontWeight: 600, marginBottom: '0.35rem' }}>
                {searchTerm ? 'No matching summaries' : 'No history yet'}
              </h4>
              <p style={{ fontSize: '0.825rem' }}>
                {searchTerm
                  ? 'Try searching with a different keyword.'
                  : 'Paste a YouTube video URL above to generate your first AI study guide.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredHistory.map((item) => {
                const canDelete =
                  user &&
                  (user.role === 'admin' ||
                    (item.userId && item.userId.toString() === user.id.toString()));

                return (
                  <div
                    key={item._id || item.videoId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.85rem',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div
                      onClick={() => {
                        onSelectVideo(item.videoId || item._id);
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        gap: '0.85rem',
                        flex: 1,
                        cursor: 'pointer',
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: '90px',
                          height: '52px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          background: '#090d16',
                          flexShrink: 0,
                        }}
                      >
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            <FileText size={20} />
                          </div>
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#f8fafc',
                            lineHeight: 1.3,
                            marginBottom: '0.25rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.title}
                        </h4>

                        <span style={{ fontSize: '0.775rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>
                          {item.authorName || 'YouTube Creator'}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={11} /> {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                          </span>
                          {item.transcriptSource === 'manual-input' && (
                            <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                              Manual
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {canDelete && onDeleteVideo && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteVideo(item._id || item.videoId);
                          }}
                          className="btn-ghost"
                          title="Delete Summary"
                          style={{ color: '#ef4444', padding: '0.35rem' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                      <div
                        onClick={() => {
                          onSelectVideo(item.videoId || item._id);
                          onClose();
                        }}
                        style={{ cursor: 'pointer', color: 'var(--text-dim)' }}
                      >
                        <ArrowRight size={15} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
