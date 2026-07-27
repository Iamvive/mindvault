import React, { useState } from 'react';

export default function SearchDrawer({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (Array.isArray(data)) setResults(data);
      })
      .catch(err => {
        setLoading(false);
        console.error(err);
      });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, right: 0, bottom: 0, left: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 1000
    }}>
      <div style={{
        width: '100%',
        maxWidth: '540px',
        background: 'var(--surface-card, #ffffff)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        padding: '24px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', letterSpacing: '-0.5px' }}>🔍 Instant FTS5 Memory Search</h3>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sub-millisecond full-text search across all stored transcripts</p>
          </div>
          <button onClick={onClose} className="secondary" style={{ padding: '6px 12px', borderRadius: '9999px' }}>✕</button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search keywords (e.g., 'SQLite', 'launch', 'plumber')..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '9999px',
              border: '1px solid var(--border-hairline)',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <button type="submit" className="primary" style={{ borderRadius: '9999px', padding: '10px 20px' }}>Search</button>
        </form>

        {/* Results Container */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>Searching memory vault...</div>
          ) : searched && results.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>No matching memories found for "{query}".</div>
          ) : (
            results.map((res, i) => (
              <div key={i} style={{
                padding: '12px 16px',
                borderRadius: '16px',
                background: 'var(--surface-canvas)',
                border: '1px solid var(--border-hairline)',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>📅 {res.date} [{res.time}]</span>
                  <span style={{ fontWeight: 600, color: 'var(--sg-primary)' }}>{res.speaker}</span>
                </div>
                <div style={{ fontSize: '0.92rem', color: 'var(--text-heading)', lineHeight: '1.4' }}>
                  "{res.content}"
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
