import React, { useState } from 'react';

import {

  ExternalLink, Copy, Check, Bookmark, Clock, ListChecks,

  BookOpen, Hash, Zap, Download, Printer, Share2, Youtube, Sparkles, Layers

} from 'lucide-react';

import FlashcardsDeck from './FlashcardsDeck';



export default function ResultsViewer({ data, onCopyText, onShowToast }) {

  const [activeTab, setActiveTab] = useState('all');

  const [copiedSection, setCopiedSection] = useState(null);



  if (!data) return null;



  const {

    videoId,

    videoUrl,

    title,

    authorName,

    thumbnailUrl,

    transcriptSource,

    wordCount,

    summary,

    createdAt,

  } = data;



  const notes = summary || {};

  const overview = notes.overview || '';

  const keyTakeaways = notes.keyTakeaways || [];

  const structuredNotes = notes.structuredNotes || [];

  const terminology = notes.terminology || [];

  const chapters = notes.chapters || [];

  const revisionSummary = notes.revisionSummary || '';



  // Extract flashcards with automated fallback for existing records

  const rawFlashcards = notes.flashcards || [];

  const flashcards = rawFlashcards.length > 0

    ? rawFlashcards

    : [

        ...terminology.map((t) => ({ front: `What is "${t.term}"?`, back: t.definition })),

        ...keyTakeaways.slice(0, 5).map((k, i) => ({ front: `Key Concept #${i + 1}: What is the core insight?`, back: k })),

      ];



  const handleCopySection = (sectionName, text) => {

    navigator.clipboard.writeText(text);

    setCopiedSection(sectionName);

    onShowToast?.(`Copied ${sectionName} to clipboard!`, 'success');

    setTimeout(() => setCopiedSection(null), 2000);

  };



  const generateFullMarkdown = () => {

    let md = `# ${title || 'Video Notes'}\n\n`;

    if (authorName) md += `**Creator:** ${authorName}\n`;

    if (videoUrl) md += `**Video URL:** ${videoUrl}\n`;

    md += `**Date:** ${new Date(createdAt || Date.now()).toLocaleDateString()}\n\n`;

    md += `---\n\n## 📋 Overview\n\n${overview}\n\n`;



    if (keyTakeaways.length > 0) {

      md += `## 🎯 Key Takeaways\n\n`;

      keyTakeaways.forEach((t) => { md += `- ${t}\n`; });

      md += `\n`;

    }



    if (structuredNotes.length > 0) {

      md += `## 📚 Detailed Notes\n\n`;

      structuredNotes.forEach((note) => {

        md += `### ${note.topic}\n\n${note.summary}\n\n`;

        if (note.details && note.details.length > 0) {

          note.details.forEach((d) => { md += `* ${d}\n`; });

          md += `\n`;

        }

      });

    }



    if (terminology.length > 0) {

      md += `## 💡 Terminology & Key Concepts\n\n`;

      terminology.forEach((t) => {

        md += `- **${t.term}**: ${t.definition}\n`;

      });

      md += `\n`;

    }



    if (chapters.length > 0) {

      md += `## ⏱️ Chapters & Timestamps\n\n`;

      chapters.forEach((ch) => {

        md += `- **[${ch.timestamp}]** ${ch.title}: ${ch.summary}\n`;

      });

      md += `\n`;

    }



    if (flashcards.length > 0) {

      md += `## 🃏 Flashcards & Review Questions\n\n`;

      flashcards.forEach((fc, idx) => {

        md += `**Q${idx + 1}: ${fc.front}**\n> A: ${fc.back}\n\n`;

      });

    }



    if (revisionSummary) {

      md += `## ⚡ Quick Revision Summary\n\n${revisionSummary}\n\n`;

    }



    return md;

  };



  const handleCopyAll = () => {

    const md = generateFullMarkdown();

    handleCopySection('Full Notes (Markdown)', md);

  };



  const handleDownloadMarkdown = () => {

    const md = generateFullMarkdown();

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;

    link.download = `${(title || 'video-notes').replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;

    link.click();

    URL.revokeObjectURL(url);

    onShowToast?.('Downloaded notes markdown file!', 'success');

  };



  const handlePrint = () => {

    window.print();

  };



  // Convert timestamp MM:SS or HH:MM:SS to seconds for YouTube jump link

  const timestampToSeconds = (ts) => {

    if (!ts) return 0;

    const parts = ts.replace(/[\[\]]/g, '').split(':').map(Number);

    if (parts.length === 3) {

      return (parts[0] * 3600) + (parts[1] * 60) + parts[2];

    }

    if (parts.length === 2) {

      return (parts[0] * 60) + parts[1];

    }

    return 0;

  };



  return (

    <div className="animate-fade-in" style={{ margin: '2rem 0' }}>

      {/* Video Header Card */}

      <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', position: 'relative' }}>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>

          {thumbnailUrl && (

            <div style={{

              width: '180px',

              height: '102px',

              borderRadius: 'var(--radius-md)',

              overflow: 'hidden',

              flexShrink: 0,

              background: '#0e1422',

              border: '1px solid var(--border)',

            }}>

              <img

                src={thumbnailUrl}

                alt={title}

                style={{ width: '100%', height: '100%', objectFit: 'cover' }}

                onError={(e) => { e.target.style.display = 'none'; }}

              />

            </div>

          )}



          <div style={{ flex: 1, minWidth: '260px' }}>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>

              <span className={`badge ${transcriptSource === 'manual-input' ? 'badge-amber' : 'badge-green'}`}>

                {transcriptSource === 'manual-input' ? 'Manual Transcript' : 'YouTube Captions'}

              </span>

              {wordCount > 0 && (

                <span className="badge badge-blue">

                  {wordCount.toLocaleString()} words analyzed

                </span>

              )}

            </div>



            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '0.4rem' }}>

              {title}

            </h1>



            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>

              Channel: <strong style={{ color: 'var(--text-main)' }}>{authorName || 'YouTube Creator'}</strong>

              {createdAt && ` • Generated on ${new Date(createdAt).toLocaleDateString()}`}

            </p>

          </div>



          {/* Action buttons */}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>

            {videoUrl && videoUrl.startsWith('http') && (

              <a

                href={videoUrl}

                target="_blank"

                rel="noreferrer"

                className="btn-secondary"

                title="Watch on YouTube"

              >

                <Youtube size={16} color="#ef4444" />

                <span>Watch</span>

                <ExternalLink size={13} />

              </a>

            )}

            <button onClick={handleCopyAll} className="btn-secondary" title="Copy complete notes in Markdown">

              {copiedSection === 'Full Notes (Markdown)' ? <Check size={16} color="#10b981" /> : <Copy size={16} />}

              <span>Copy All</span>

            </button>

            <button onClick={handleDownloadMarkdown} className="btn-secondary" title="Export as Markdown file">

              <Download size={16} />

              <span>Export .MD</span>

            </button>

            <button onClick={handlePrint} className="btn-secondary" title="Print or save as PDF">

              <Printer size={16} />

            </button>

          </div>

        </div>

      </div>



      {/* Tabs navigation */}

      <div style={{

        display: 'flex',

        gap: '0.5rem',

        overflowX: 'auto',

        paddingBottom: '0.5rem',

        marginBottom: '1.25rem',

        borderBottom: '1px solid var(--border)',

      }}>

        {[

          { id: 'all', label: 'All Sections', icon: <Bookmark size={15} /> },

          { id: 'flashcards', label: `Flashcards (${flashcards.length})`, icon: <Layers size={15} /> },

          { id: 'overview', label: 'Overview', icon: <Sparkles size={15} /> },

          { id: 'takeaways', label: `Key Takeaways (${keyTakeaways.length})`, icon: <ListChecks size={15} /> },

          { id: 'notes', label: `Topic Notes (${structuredNotes.length})`, icon: <BookOpen size={15} /> },

          { id: 'terms', label: `Terminology (${terminology.length})`, icon: <Hash size={15} /> },

          { id: 'chapters', label: `Chapters (${chapters.length})`, icon: <Clock size={15} /> },

          { id: 'revision', label: 'Quick Revision', icon: <Zap size={15} /> },

        ].map((tab) => (

          <button

            key={tab.id}

            onClick={() => setActiveTab(tab.id)}

            className="btn-ghost"

            style={{

              padding: '0.5rem 0.95rem',

              borderRadius: 'var(--radius-md)',

              fontWeight: 600,

              fontSize: '0.875rem',

              color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-muted)',

              background: activeTab === tab.id ? 'var(--navy)' : 'transparent',

              border: activeTab === tab.id ? '1px solid var(--navy)' : '1px solid transparent',

              boxShadow: activeTab === tab.id ? '0 2px 8px rgba(41, 60, 112, 0.18)' : 'none',

              whiteSpace: 'nowrap',

            }}

          >

            {tab.icon}

            <span>{tab.label}</span>

          </button>

        ))}

      </div>



      {/* SECTION: Interactive Flashcards */}

      {(activeTab === 'all' || activeTab === 'flashcards') && flashcards.length > 0 && (

        <section className="glass-card animate-fade-in" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>

          <FlashcardsDeck flashcards={flashcards} title={title} />

        </section>

      )}



      {/* SECTION 1: Overview */}

      {(activeTab === 'all' || activeTab === 'overview') && (

        <section className="glass-card animate-fade-in" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

              <div style={{ color: 'var(--navy-light)' }}><Sparkles size={20} /></div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Executive Overview</h2>

            </div>

            <button

              onClick={() => handleCopySection('Overview', overview)}

              className="btn-ghost"

              title="Copy overview"

            >

              {copiedSection === 'Overview' ? <Check size={15} color="#10b981" /> : <Copy size={15} />}

              <span>Copy</span>

            </button>

          </div>

          <div style={{ color: 'var(--text-main)', fontSize: '0.975rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>

            {overview}

          </div>

        </section>

      )}



      {/* SECTION 2: Key Takeaways */}

      {(activeTab === 'all' || activeTab === 'takeaways') && keyTakeaways.length > 0 && (

        <section className="glass-card animate-fade-in" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

              <div style={{ color: 'var(--accent-green)' }}><ListChecks size={20} /></div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Key Takeaways</h2>

            </div>

            <button

              onClick={() => handleCopySection('Key Takeaways', keyTakeaways.map((t) => `• ${t}`).join('\n'))}

              className="btn-ghost"

              title="Copy takeaways"

            >

              {copiedSection === 'Key Takeaways' ? <Check size={15} color="#10b981" /> : <Copy size={15} />}

              <span>Copy</span>

            </button>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.85rem' }}>

            {keyTakeaways.map((takeaway, idx) => (

              <div

                key={idx}

                style={{

                  background: '#FFFFFF',

                  border: '1px solid var(--border)',

                  borderRadius: 'var(--radius-md)',

                  padding: '1rem',

                  display: 'flex',

                  gap: '0.75rem',

                  alignItems: 'flex-start',

                }}

              >

                <div style={{

                  background: 'rgba(39, 131, 95, 0.12)',

                  color: 'var(--accent-green)',

                  width: '24px',

                  height: '24px',

                  borderRadius: '50%',

                  display: 'flex',

                  alignItems: 'center',

                  justifyContent: 'center',

                  fontSize: '0.75rem',

                  fontWeight: 700,

                  flexShrink: 0,

                  marginTop: '0.1rem',

                }}>

                  {idx + 1}

                </div>

                <p style={{ fontSize: '0.925rem', color: 'var(--text-main)', lineHeight: 1.5 }}>

                  {takeaway}

                </p>

              </div>

            ))}

          </div>

        </section>

      )}



      {/* SECTION 3: Detailed Notes by Topic */}

      {(activeTab === 'all' || activeTab === 'notes') && structuredNotes.length > 0 && (

        <section className="glass-card animate-fade-in" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

              <div style={{ color: 'var(--navy-light)' }}><BookOpen size={20} /></div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Structured Topic Notes</h2>

            </div>

            <button

              onClick={() => handleCopySection('Detailed Notes', structuredNotes.map((n) => `### ${n.topic}\n${n.summary}\n${n.details?.map((d) => `* ${d}`).join('\n')}`).join('\n\n'))}

              className="btn-ghost"

              title="Copy notes"

            >

              {copiedSection === 'Detailed Notes' ? <Check size={15} color="#10b981" /> : <Copy size={15} />}

              <span>Copy</span>

            </button>

          </div>



          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {structuredNotes.map((note, idx) => (

              <div

                key={idx}

                style={{

                  background: 'var(--bg-input)',

                  border: '1px solid var(--border)',

                  borderRadius: 'var(--radius-lg)',

                  padding: '1.25rem',

                }}

              >

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)' }}>

                    {note.topic}

                  </h3>

                  <button

                    onClick={() => handleCopySection(note.topic, `${note.topic}\n${note.summary}\n${note.details?.join('\n')}`)}

                    className="btn-ghost"

                    style={{ fontSize: '0.75rem' }}

                  >

                    <Copy size={13} />

                  </button>

                </div>



                <p style={{ color: 'var(--text-main)', fontSize: '0.925rem', marginBottom: '0.75rem', lineHeight: 1.6 }}>

                  {note.summary}

                </p>



                {note.details && note.details.length > 0 && (

                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>

                    {note.details.map((detail, dIdx) => (

                      <li key={dIdx} style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>

                        {detail}

                      </li>

                    ))}

                  </ul>

                )}

              </div>

            ))}

          </div>

        </section>

      )}



      {/* SECTION 4: Important Terminology & Definitions */}

      {(activeTab === 'all' || activeTab === 'terms') && terminology.length > 0 && (

        <section className="glass-card animate-fade-in" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

              <div style={{ color: 'var(--primary)' }}><Hash size={20} /></div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Terminology & Core Definitions</h2>

            </div>

            <button

              onClick={() => handleCopySection('Terminology', terminology.map((t) => `${t.term}: ${t.definition}`).join('\n'))}

              className="btn-ghost"

              title="Copy terminology"

            >

              {copiedSection === 'Terminology' ? <Check size={15} color="#10b981" /> : <Copy size={15} />}

              <span>Copy</span>

            </button>

          </div>



          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>

            {terminology.map((t, idx) => (

              <div

                key={idx}

                style={{

                  background: 'var(--bg-input)',

                  border: '1px solid var(--border)',

                  borderRadius: 'var(--radius-md)',

                  padding: '1rem',

                }}

              >

                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.35rem' }}>

                  {t.term}

                </h4>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5 }}>

                  {t.definition}

                </p>

              </div>

            ))}

          </div>

        </section>

      )}



      {/* SECTION 5: Chapters & Timestamps */}

      {(activeTab === 'all' || activeTab === 'chapters') && chapters.length > 0 && (

        <section className="glass-card animate-fade-in" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

              <div style={{ color: 'var(--navy-light)' }}><Clock size={20} /></div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Chapters & Timestamps</h2>

            </div>

            <button

              onClick={() => handleCopySection('Chapters', chapters.map((c) => `[${c.timestamp}] ${c.title} - ${c.summary}`).join('\n'))}

              className="btn-ghost"

              title="Copy chapters"

            >

              {copiedSection === 'Chapters' ? <Check size={15} color="#10b981" /> : <Copy size={15} />}

              <span>Copy</span>

            </button>

          </div>



          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>

            {chapters.map((ch, idx) => {

              const seconds = timestampToSeconds(ch.timestamp);

              const ytJumpUrl = videoId && videoId.length === 11

                ? `https\://www.youtube.com/watch?v=${videoId}&t=${seconds}s`

                : null;



              return (

                <div

                  key={idx}

                  style={{

                    display: 'flex',

                    flexWrap: 'wrap',

                    alignItems: 'center',

                    gap: '1rem',

                    padding: '0.75rem 1rem',

                    background: 'var(--bg-input)',

                    border: '1px solid var(--border)',

                    borderRadius: 'var(--radius-md)',

                  }}

                >

                  {ytJumpUrl ? (

                    <a

                      href={ytJumpUrl}

                      target="_blank"

                      rel="noreferrer"

                      className="badge badge-blue"

                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '0.25rem 0.5rem', cursor: 'pointer' }}

                      title="Jump to this exact time in video"

                    >

                      <Clock size={12} /> {ch.timestamp} <ExternalLink size={10} />

                    </a>

                  ) : (

                    <span className="badge badge-blue" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>

                      {ch.timestamp}

                    </span>

                  )}



                  <div style={{ flex: 1, minWidth: '200px' }}>

                    <strong style={{ fontSize: '0.925rem', color: 'var(--text-main)', display: 'block' }}>

                      {ch.title}

                    </strong>

                    {ch.summary && (

                      <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>

                        {ch.summary}

                      </span>

                    )}

                  </div>

                </div>

              );

            })}

          </div>

        </section>

      )}



      {/* SECTION 6: Quick Revision Summary */}

      {(activeTab === 'all' || activeTab === 'revision') && revisionSummary && (

        <section className="glass-card animate-fade-in" style={{

          padding: '1.75rem',

          marginBottom: '1.5rem',

          background: '#FFFFFF',

          border: '1px solid var(--border)',

        }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

              <div style={{ color: 'var(--primary)' }}><Zap size={20} /></div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Quick Revision Cheat-Sheet</h2>

            </div>

            <button

              onClick={() => handleCopySection('Revision Summary', revisionSummary)}

              className="btn-ghost"

              title="Copy revision summary"

            >

              {copiedSection === 'Revision Summary' ? <Check size={15} color="#10b981" /> : <Copy size={15} />}

              <span>Copy</span>

            </button>

          </div>

          <div style={{

            background: 'var(--bg-card-secondary)',

            border: '1px dashed var(--border-strong)',

            borderRadius: 'var(--radius-md)',

            padding: '1.25rem',

            color: 'var(--text-main)',

            fontSize: '0.925rem',

            lineHeight: 1.65,

            whiteSpace: 'pre-line',

          }}>

            {revisionSummary}

          </div>

        </section>

      )}

    </div>

  );

}
