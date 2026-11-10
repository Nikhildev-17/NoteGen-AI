import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCw, ChevronLeft, ChevronRight, Shuffle, CheckCircle,
  HelpCircle, Sparkles, Layers, BookOpen, Check, RefreshCw
} from 'lucide-react';

export default function FlashcardsDeck({ flashcards = [], title = 'Flashcards' }) {
  const [cards, setCards] = useState(flashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState(new Set());

  // Update cards when props change
  useEffect(() => {
    if (flashcards && flashcards.length > 0) {
      setCards(flashcards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setMasteredIds(new Set());
    }
  }, [flashcards]);

  const handleNext = useCallback(() => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  }, [cards.length]);

  const handlePrev = useCallback(() => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  }, [cards.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const toggleMastered = (index) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev]);

  if (!cards || cards.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Layers size={36} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
        <h3>No Flashcards Available</h3>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Flashcards could not be extracted for this video.</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const isMastered = masteredIds.has(currentIndex);
  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* Header controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)',
          }}>
            <Layers size={17} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Interactive Flashcards</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Card {currentIndex + 1} of {cards.length} • {masteredIds.size} Mastered
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleShuffle}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            title="Shuffle cards"
          >
            <Shuffle size={14} />
            <span>Shuffle</span>
          </button>
          <button
            onClick={() => { setMasteredIds(new Set()); setCurrentIndex(0); setIsFlipped(false); }}
            className="btn-ghost"
            style={{ fontSize: '0.8rem' }}
            title="Reset progress"
          >
            <RefreshCw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: '4px',
        background: 'var(--border)',
        borderRadius: '999px',
        overflow: 'hidden',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
          transition: 'width 0.25s ease',
        }} />
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        style={{
          perspective: '1200px',
          minHeight: '340px',
          cursor: 'pointer',
          userSelect: 'none',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          minHeight: '340px',
          transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}>
          {/* Card Front (Question) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            background: 'var(--bg-card)',
            border: isMastered ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-md)',
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>
                <HelpCircle size={12} /> QUESTION
              </span>
              {isMastered && (
                <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                  <Check size={12} /> Mastered
                </span>
              )}
            </div>

            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <p style={{
                fontSize: '1.3rem',
                fontWeight: 600,
                lineHeight: 1.5,
                color: 'var(--text-main)',
              }}>
                {currentCard.front}
              </p>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              color: 'var(--text-dim)',
              fontSize: '0.8rem',
            }}>
              <RotateCw size={13} />
              <span>Click or press <kbd style={{
                background: 'rgba(255,255,255,0.08)',
                padding: '0.15rem 0.35rem',
                borderRadius: '4px',
                fontFamily: 'inherit',
              }}>Space</kbd> to flip</span>
            </div>
          </div>

          {/* Card Back (Answer) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'var(--bg-card-secondary)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-lg)',
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                <Sparkles size={12} /> EXPLANATION & ANSWER
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Card {currentIndex + 1}
              </span>
            </div>

            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <p style={{
                fontSize: '1.15rem',
                fontWeight: 500,
                lineHeight: 1.6,
                color: 'var(--text-main)',
              }}>
                {currentCard.back}
              </p>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              color: 'var(--text-dim)',
              fontSize: '0.8rem',
            }}>
              <RotateCw size={13} />
              <span>Click or press <kbd style={{
                background: 'rgba(255,255,255,0.08)',
                padding: '0.15rem 0.35rem',
                borderRadius: '4px',
                fontFamily: 'inherit',
              }}>Space</kbd> to return</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Navigation & Mastery Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* Prev / Next buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handlePrev}
            className="btn-secondary"
            style={{ padding: '0.6rem 1rem' }}
            title="Previous card (Left Arrow)"
          >
            <ChevronLeft size={18} />
            <span>Previous</span>
          </button>
          <button
            onClick={handleNext}
            className="btn-secondary"
            style={{ padding: '0.6rem 1rem' }}
            title="Next card (Right Arrow)"
          >
            <span>Next</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Mark Mastered / Learning toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMastered(currentIndex);
          }}
          className={isMastered ? 'btn-secondary' : 'btn-primary'}
          style={{
            background: isMastered ? 'rgba(16, 185, 129, 0.15)' : undefined,
            color: isMastered ? '#34d399' : undefined,
            borderColor: isMastered ? 'rgba(16, 185, 129, 0.3)' : undefined,
          }}
        >
          <CheckCircle size={16} />
          <span>{isMastered ? 'Mastered ✓' : 'Mark as Mastered'}</span>
        </button>
      </div>
    </div>
  );
}
