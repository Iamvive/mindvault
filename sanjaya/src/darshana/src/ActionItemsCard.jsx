import React, { useEffect, useState } from 'react';

export default function ActionItemsCard() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const fetchItems = (cat) => {
    setLoading(true);
    fetch(`/api/action-items?category=${cat}`)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (Array.isArray(data)) setItems(data);
      })
      .catch(err => {
        setLoading(false);
        console.error(err);
      });
  };

  useEffect(() => {
    fetchItems(filter);
  }, [filter]);

  const handleToggle = (id) => {
    fetch(`/api/action-items/${id}/toggle`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setItems(prev => prev.map(item => item.id === id ? { ...item, status: data.item.status } : item));
        }
      })
      .catch(err => console.error(err));
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'promise_to_others':
        return <span style={{ background: 'rgba(230, 0, 35, 0.12)', color: 'var(--sg-primary)', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>Promise Made</span>;
      case 'followup_needed':
        return <span style={{ background: 'rgba(255, 170, 0, 0.12)', color: '#d97706', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>Follow-up</span>;
      default:
        return <span style={{ background: 'rgba(100, 116, 139, 0.12)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>TODO</span>;
    }
  };

  return (
    <div className="card" style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', letterSpacing: '-0.8px' }}>📌 Pending Action Items & Commitments</h3>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.88rem' }}>Extracted commitments, tasks, and follow-ups from daily speech</p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['all', 'todo', 'promise_to_others', 'followup_needed'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: '1px solid var(--border-hairline)',
                fontSize: '0.8rem',
                fontWeight: filter === cat ? 700 : 500,
                background: filter === cat ? 'var(--sg-primary)' : 'transparent',
                color: filter === cat ? '#ffffff' : 'var(--text-heading)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {cat === 'all' ? 'All' : cat === 'todo' ? 'TODOs' : cat === 'promise_to_others' ? 'Promises' : 'Follow-ups'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '16px 0' }}>Loading action items...</div>
      ) : items.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '16px 0', fontStyle: 'italic' }}>
          No pending action items recorded yet. Sync your Locket to extract spoken promises and tasks.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '16px',
                background: item.status === 'completed' ? 'rgba(0,0,0,0.02)' : 'var(--surface-canvas)',
                border: '1px solid var(--border-hairline)',
                opacity: item.status === 'completed' ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  checked={item.status === 'completed'}
                  onChange={() => handleToggle(item.id)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--sg-primary)' }}
                />
                <div>
                  <span style={{
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    textDecoration: item.status === 'completed' ? 'line-through' : 'none',
                    color: 'var(--text-heading)'
                  }}>
                    {item.task}
                  </span>
                  {item.context && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {item.time !== 'N/A' && `[${item.time}] `}{item.context} {item.assignee && item.assignee !== 'Self' && `• Assigned: ${item.assignee}`}
                    </div>
                  )}
                </div>
              </div>
              <div>{getCategoryBadge(item.category)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
