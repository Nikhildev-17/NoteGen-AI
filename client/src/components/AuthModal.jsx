import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function AuthModal({ onShowToast }) {
  const { authModalOpen, authMode, openAuth, closeAuth, login, register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!authModalOpen) return null;

  const isLogin = authMode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
        onShowToast?.('Signed in successfully!', 'success');
      } else {
        if (!name.trim()) {
          setError('Please provide your name.');
          setIsSubmitting(false);
          return;
        }
        await register(name.trim(), email.trim(), password);
        onShowToast?.('Account created successfully!', 'success');
      }
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
        padding: '1.25rem',
      }}
      className="animate-fade-in"
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '2rem',
          background: '#0d1322',
          border: '1px solid #273553',
          position: 'relative',
        }}
      >
        <button
          onClick={closeAuth}
          className="btn-ghost"
          style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.4rem' }}
          title="Close"
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem auto',
            }}
          >
            <Lock size={22} />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {isLogin
              ? 'Sign in to access your personal study guides and history'
              : 'Sign up to automatically save notes to your personal dashboard'}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            padding: '0.25rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--border)',
          }}
        >
          <button
            type="button"
            onClick={() => { openAuth('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isLogin ? '#ffffff' : 'var(--text-muted)',
              background: isLogin ? '#3b82f6' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { openAuth('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: !isLogin ? '#ffffff' : 'var(--text-muted)',
              background: !isLogin ? '#3b82f6' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div
            className="animate-fade-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171',
              fontSize: '0.825rem',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 0.85rem',
                }}
              >
                <UserIcon size={16} color="var(--text-dim)" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.85rem',
              }}
            >
              <Mail size={16} color="var(--text-dim)" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Password
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.85rem',
              }}
            >
              <Lock size={16} color="var(--text-dim)" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
