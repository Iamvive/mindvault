import React, { useEffect, useState } from 'react';

export default function App() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState(null);

  const fetchScores = () => {
    fetch('/api/scores')
      .then(res => res.json())
      .then(data => setScores(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const handleSync = () => {
    setLoading(true);
    fetch('/api/trigger-sync', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        fetchScores();
      })
      .catch(err => {
        setLoading(false);
        console.error(err);
      });
  };

  const today = scores[0];

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
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Sanjaya</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: '4px 0 0 0' }}>Divine Hearing & Behavioral Guidance</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={loading}
          style={{
            background: 'var(--sg-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '9999px',
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(230, 0, 35, 0.2)',
            transition: 'opacity 0.2s ease',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Syncing...' : 'Sync Locket'}
        </button>
      </header>

      {today ? (
        <div>
          <div className="card sadhana-banner">
            <h3 style={{ margin: 0, color: 'var(--sg-primary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Tomorrow's Sadhana (1% Compound Goal)</h3>
            <p style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px', margin: '8px 0 0 0', lineHeight: '1.4' }}>
              {today.kaizen_target}
            </p>
          </div>

          <div className="card">
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.5rem' }}>Daily Synthesis ({today.date})</h3>
            <p style={{ color: 'var(--text-primary)', lineHeight: '1.6', margin: 0 }}>
              {today.summary}
            </p>
          </div>

          <h3 style={{ fontSize: '1.3rem', marginBottom: '16px', color: 'var(--text-muted)' }}>Behavioral Metrics & Studies</h3>
          
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

          {selectedStudy && (
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.8)',
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
                  background: '#121214',
                  border: '1px solid var(--border-color)',
                  borderRadius: '24px',
                  padding: '32px',
                  maxWidth: '550px',
                  width: '100%',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                }}
                onClick={e => e.stopPropagation()}
              >
                <h3 style={{ marginTop: 0, fontSize: '1.4rem', color: 'var(--text-primary)' }}>{studies[selectedStudy].name}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>{studies[selectedStudy].desc}</p>
                
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', borderLeft: '3px solid var(--sg-primary)', marginTop: '20px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: 'var(--sg-primary)', textTransform: 'uppercase' }}>Kaizen Micro-Action</h4>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>{studies[selectedStudy].tip}</p>
                </div>

                <button 
                  onClick={() => setSelectedStudy(null)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '9999px',
                    padding: '10px 20px',
                    marginTop: '24px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    width: '100%'
                  }}
                >
                  Close Reference
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '24px' }}>No daily summaries have been sync'd yet.</p>
          <button 
            onClick={handleSync}
            disabled={loading}
            style={{
              background: 'var(--sg-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '9999px',
              padding: '14px 28px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Initializing Sync...' : 'Run Initial Sync'}
          </button>
        </div>
      )}
    </div>
  );
}
