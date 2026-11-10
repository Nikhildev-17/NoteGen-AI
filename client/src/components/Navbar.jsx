import React from 'react';
import { Youtube, Sparkles, History, Database, Cpu, LogIn, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ health, onOpenHistory, historyCount }) {
  const { user, isAuthenticated, logout, openAuth } = useAuth();
  const isDbReady = health?.database?.connected;
  const isGeminiReady = health?.geminiConfigured;

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            }}
          >
            <Youtube size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
                NoteGen<span style={{ color: '#3b82f6' }}>AI</span>
              </span>
              <span className="badge badge-blue" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                <Sparkles size={10} /> MERN
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>
              YouTube AI Summarizer & Notes Generator
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
            }}
            className="status-pill"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: isDbReady ? '#10b981' : '#f59e0b' }}>
              <Database size={12} /> {isDbReady ? 'DB Online' : 'DB Offline'}
            </span>
            <span style={{ color: 'var(--border)' }}>|</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: isGeminiReady ? '#3b82f6' : '#f59e0b' }}>
              <Cpu size={12} /> {isGeminiReady ? 'Gemini Ready' : 'Key Needed'}
            </span>
          </div>

          <button
            onClick={onOpenHistory}
            className="btn-secondary"
            title="View Saved Video Summaries"
            style={{ position: 'relative' }}
          >
            <History size={16} color="#94a3b8" />
            <span>History</span>
            {historyCount > 0 && (
              <span
                style={{
                  background: '#3b82f6',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.45rem',
                  borderRadius: '9999px',
                  marginLeft: '0.2rem',
                }}
              >
                {historyCount}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: 'var(--bg-card-secondary)',
                  border: '1px solid var(--border)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#3b82f6',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {user.name}
                </span>
                {user.role === 'admin' && (
                  <span className="badge badge-purple" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                    <Shield size={10} /> Admin
                  </span>
                )}
              </div>
              <button
                onClick={logout}
                className="btn-ghost"
                title="Sign Out"
                style={{ padding: '0.45rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                onClick={() => openAuth('login')}
                className="btn-ghost"
                style={{ fontWeight: 600, fontSize: '0.85rem' }}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => openAuth('register')}
                className="btn-primary"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.825rem' }}
              >
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @media (min-width: 768px) {
          .status-pill { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
