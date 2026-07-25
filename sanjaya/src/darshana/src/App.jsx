import React, { useEffect, useState } from 'react';

export default function App() {
  const [scores, setScores] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [fullTranscript, setFullTranscript] = useState(null);
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  const fetchScores = (date) => {
    let url = '/api/scores';
    if (date) {
      url += `?date=${date}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => setScores(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchScores(selectedDate);
  }, [selectedDate]);

  const handleSync = () => {
    setLoading(true);
    fetch('/api/trigger-sync', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        fetchScores(selectedDate);
      })
      .catch(err => {
        setLoading(false);
        console.error(err);
      });
  };

  const handleFetchFullTranscript = () => {
    setLoadingTranscript(true);
    fetch(`/api/raw-transcript?date=${selectedDate}`)
      .then(res => {
        if (!res.ok) throw new Error("No raw transcript found for this date.");
        return res.json();
      })
      .then(data => {
        setLoadingTranscript(false);
        setFullTranscript(data);
      })
      .catch(err => {
        setLoadingTranscript(false);
        alert(err.message);
      });
  };

  const today = scores[0];
  const parsedMemories = today && today.key_memories ? JSON.parse(today.key_memories) : [];

  const studies = {
    cbt: {
      name: "Aaron Beck's Cognitive Distortions",
      desc: "Aaron Beck's Cognitive Behavioral Therapy (CBT) framework identifies automatic negative thoughts and logical fallacies. A higher score means your speech exhibits minimal cognitive distortions (healthy, objective communication) rather than catastrophizing, mind-reading, or black-and-white thinking.",
      tip: "To improve: Notice absolute words like 'always', 'never', or 'nothing' in your thoughts and conversations, and replace them with objective evidence."
    },
    gottman: {
      name: "John Gottman's Conversational Bids",
      desc: "Dr. John Gottman's relationship research focuses on 'bids for connection'—verbal attempts to connect. A higher score indicates that you are actively responding to others' bids ('turning toward' instead of 'turning away' or 'turning against') and raising constructive bids yourself.",
      tip: "To improve: Acknowledge others when they speak, even with a brief nod or validation statement, rather than changing the topic immediately."
    },
    rogers: {
      name: "Carl Rogers' Active Listening Scale",
      desc: "Carl Rogers pioneered humanistic psychology. His Active Listening Scale measures empathy, unconditional positive regard, and congruence. High active listening indicates repeating back blockers to ensure understanding, asking clarifying open-ended questions, and refraining from premature judgment.",
      tip: "To improve: Before proposing a solution, mirror back what you heard: 'It sounds like you are facing X constraint. Is that correct?'"
    },
    clarity: {
      name: "Linguistic Speech Economy",
      desc: "Measures speech efficiency, fluff-to-substance ratios, and filler word density (e.g., 'like', 'um', 'actually', 'you know'). A higher score represents clean, confident articulation that gets straight to the point.",
      tip: "To improve: Pause silently when you need time to think, instead of filling the silence with vocal placeholders."
    }
  };

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Sanjaya</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: '4px 0 0 0' }}>Divine Hearing & Behavioral Guidance</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Calendar Selector (Sadhana Style) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)' }}>Date:</span>
            <input 
              type="date" 
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                background: 'var(--surface-canvas)',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-full)',
                padding: '8px 16px',
                color: 'var(--text-heading)',
                fontWeight: '600',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <button 
            onClick={handleSync}
            disabled={loading}
            className="primary"
          >
            {loading ? 'Syncing...' : 'Sync Locket'}
          </button>
        </div>
      </header>

      {today ? (
        <div>
          {/* Sadhana Banner */}
          <div className="card sadhana-banner">
            <h3 style={{ margin: 0, color: 'var(--sg-primary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Tomorrow's Sadhana (1% Compound Goal)</h3>
            <p style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px', margin: '8px 0 0 0', lineHeight: '1.4' }}>
              {today.kaizen_target}
            </p>
          </div>

          {/* Daily Synthesis */}
          <div className="card">
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.5rem' }}>Daily Synthesis</h3>
            <p style={{ color: 'var(--text-body)', lineHeight: '1.6', margin: 0 }}>
              {today.summary}
            </p>
          </div>

          {/* Highlights Section */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Top 3 Highlights of the Day</h3>
              <button 
                onClick={handleFetchFullTranscript}
                disabled={loadingTranscript}
                className="secondary"
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                {loadingTranscript ? 'Opening Vault...' : 'View Full Daily Transcript →'}
              </button>
            </div>
            
            {parsedMemories.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {parsedMemories.map((mem, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      background: 'var(--surface-card)',
                      border: '1px solid var(--border-hairline)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-heading)' }}>{mem.title}</strong>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span className="pill-badge">{mem.time}</span>
                        {mem.environment && (
                          <span className="pill-badge" style={{ background: mem.environment === 'office' ? 'rgba(78, 120, 150, 0.08)' : 'rgba(78, 150, 90, 0.08)', color: 'var(--text-muted)' }}>
                            {mem.environment === 'office' ? '💼 Office' : '🏠 Personal'}
                          </span>
                        )}
                        {mem.duration && (
                          <span className="pill-badge" style={{ background: 'var(--border-hairline)', color: 'var(--text-muted)' }}>
                            ⏱️ {mem.duration}
                          </span>
                        )}
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                      {mem.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No highlighted memories parsed for this day.</p>
            )}
          </div>

          {/* Behavioral Metrics Grid */}
          <h3 style={{ fontSize: '1.3rem', marginBottom: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>Behavioral Metrics & Studies</h3>
          
          <div className="score-grid">
            <div className="score-card" onClick={() => setSelectedStudy('cbt')}>
              <p className="score-header">CBT Distortion</p>
              <div className="score-val">{today.cognitive_distortion.toFixed(1)}<span>/10</span></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Beck Cognitive Biases →</p>
            </div>

            <div className="score-card" onClick={() => setSelectedStudy('gottman')}>
              <p className="score-header">Conversational Bids</p>
              <div className="score-val">{today.conversational_connection.toFixed(1)}<span>/10</span></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Gottman Bidding Scale →</p>
            </div>

            <div className="score-card" onClick={() => setSelectedStudy('rogers')}>
              <p className="score-header">Active Listening</p>
              <div className="score-val">{today.active_listening.toFixed(1)}<span>/10</span></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Carl Rogers Scale →</p>
            </div>

            <div className="score-card" onClick={() => setSelectedStudy('clarity')}>
              <p className="score-header">Speech Economy</p>
              <div className="score-val">{today.speech_clarity.toFixed(1)}<span>/10</span></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Linguistic Clarity →</p>
            </div>
          </div>

          {/* Research Study Details Modal */}
          {selectedStudy && (
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
              }}
              onClick={() => setSelectedStudy(null)}
            >
              <div 
                style={{
                  background: 'var(--surface-canvas)',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '32px',
                  maxWidth: '550px',
                  width: '100%',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
                onClick={e => e.stopPropagation()}
              >
                <h3 style={{ marginTop: 0, fontSize: '1.4rem', color: 'var(--text-heading)' }}>{studies[selectedStudy].name}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>{studies[selectedStudy].desc}</p>
                
                <div style={{ background: 'var(--surface-card)', padding: '16px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--sg-primary)', marginTop: '20px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: 'var(--sg-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kaizen Micro-Action</h4>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>{studies[selectedStudy].tip}</p>
                </div>

                <button 
                  onClick={() => setSelectedStudy(null)}
                  className="secondary"
                  style={{ marginTop: '24px', width: '100%' }}
                >
                  Close Reference
                </button>
              </div>
            </div>
          )}

          {/* Full Daily Transcript Modal Drawer (Smriti Vault Fetcher) */}
          {fullTranscript && (
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
              }}
              onClick={() => setFullTranscript(null)}
            >
              <div 
                style={{
                  background: 'var(--surface-canvas)',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '32px',
                  maxWidth: '700px',
                  width: '100%',
                  maxHeight: '85vh',
                  overflowY: 'auto',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
                onClick={e => e.stopPropagation()}
              >
                <h3 style={{ marginTop: 0, fontSize: '1.6rem', color: 'var(--text-heading)' }}>Smriti Vault Details ({selectedDate})</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>All memories and conversations passively transcribed by your Neo 1 Locket.</p>
                
                {/* Individual Memories Summary Section */}
                {fullTranscript.memories && fullTranscript.memories.length > 0 && (
                  <div style={{ marginBottom: '32px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: 'var(--text-heading)', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '6px' }}>
                      Daily Memories ({fullTranscript.memories.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {fullTranscript.memories.map((mem, idx) => (
                        <div 
                          key={idx} 
                          style={{
                            background: 'var(--surface-card)',
                            border: '1px solid var(--border-hairline)',
                            borderRadius: 'var(--radius-md)',
                            padding: '16px 20px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '1rem', color: 'var(--text-heading)' }}>{mem.title}</strong>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <span className="pill-badge">{mem.time}</span>
                              <span className="pill-badge" style={{ background: mem.environment === 'office' ? 'rgba(78, 120, 150, 0.08)' : 'rgba(78, 150, 90, 0.08)', color: 'var(--text-muted)' }}>
                                {mem.environment === 'office' ? '💼 Office' : '🏠 Personal'}
                              </span>
                              <span className="pill-badge" style={{ background: 'var(--border-hairline)', color: 'var(--text-muted)' }}>⏱️ {mem.duration}</span>
                            </div>
                          </div>
                          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>{mem.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: 'var(--text-heading)', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '6px' }}>
                  Full Transcript Stream
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {fullTranscript.conversations && fullTranscript.conversations.map((conv, idx) => (
                    <div 
                      key={idx} 
                      style={{
                        padding: '12px 16px',
                        background: conv.speaker === 'User' ? 'rgba(230, 0, 35, 0.03)' : 'var(--surface-card)',
                        border: '1px solid var(--border-hairline)',
                        borderLeft: conv.speaker === 'User' ? '3px solid var(--sg-primary)' : '1px solid var(--border-hairline)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <strong>{conv.speaker}</strong>
                        <span>{conv.time || 'N/A'}</span>
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-body)', fontSize: '0.95rem', lineHeight: '1.5' }}>{conv.text}</p>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setFullTranscript(null)}
                  className="primary"
                  style={{ marginTop: '32px', width: '100%' }}
                >
                  Close Vault Log
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '24px' }}>No daily summaries found for {selectedDate}.</p>
          <button 
            onClick={handleSync}
            disabled={loading}
            className="primary"
          >
            {loading ? 'Initializing Sync...' : 'Sync Locket for Today'}
          </button>
        </div>
      )}
    </div>
  );
}
