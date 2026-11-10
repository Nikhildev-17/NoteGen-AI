import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';

const STAGES = [
  { label: 'Resolving YouTube URL & fetching metadata...', duration: 2000 },
  { label: 'Extracting subtitles & normalizing timestamps...', duration: 3500 },
  { label: 'Gemini AI generating structured notes & key takeaways...', duration: 5000 },
  { label: 'Finalizing formatting & saving study guide...', duration: 3000 },
];

export default function ProcessingState() {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStage((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-card animate-fade-in" style={{
      padding: '3rem 2rem',
      margin: '2rem 0',
      textAlign: 'center',
      border: '1px solid var(--border)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background accent */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '320px', height: '320px',
        background: 'radial-gradient(circle, rgba(22, 163, 74, 0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Spinner */}
      <div style={{
        width: '64px', height: '64px', margin: '0 auto 1.5rem auto',
        borderRadius: '50%',
        background: 'rgba(146, 64, 14, 0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1.5px solid rgba(146, 64, 14, 0.25)',
        boxShadow: '0 4px 16px rgba(146, 64, 14, 0.12)',
      }}>
        <Loader2 size={32} color="#92400E" className="animate-spin" />
      </div>

      <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--navy)' }}>
        Analyzing Video &amp; Synthesizing Notes
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', maxWidth: '520px', margin: '0 auto 2rem auto' }}>
        Please wait while Gemini processes the transcript into structured concepts, chapter breakdowns, and revision notes.
      </p>

      {/* Stage list */}
      <div style={{
        maxWidth: '460px', margin: '0 auto',
        display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left',
      }}>
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStage;
          const isCurrent = idx === currentStage;
          return (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.65rem 0.9rem', borderRadius: '10px',
              background: isCurrent ? 'rgba(146, 64, 14, 0.07)' : isDone ? 'rgba(22, 163, 74, 0.05)' : 'rgba(0,0,0,0.02)',
              border: isCurrent ? '1px solid rgba(146, 64, 14, 0.25)' : isDone ? '1px solid rgba(22, 163, 74, 0.2)' : '1px solid transparent',
              transition: 'all 0.3s ease',
            }}>
              {isDone
                ? <CheckCircle2 size={18} color="#16A34A" />
                : isCurrent
                  ? <Loader2 size={18} color="#92400E" className="animate-spin" />
                  : <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #D6D3D1' }} />
              }
              <span style={{
                fontSize: '0.875rem',
                fontWeight: isCurrent ? 600 : 400,
                color: isDone ? '#A8A29E' : isCurrent ? '#1C1917' : '#9CA3AF',
              }}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
