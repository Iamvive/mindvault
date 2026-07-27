import React, { useEffect, useState } from 'react';

export default function WeaknessTracker({ selectedDate }) {
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/digest?date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        setDigest(data);
      })
      .catch(err => {
        setLoading(false);
        console.error(err);
      });
  }, [selectedDate]);

  if (loading) {
    return <div className="card" style={{ marginBottom: '32px' }}>Loading Second Brain insights...</div>;
  }

  if (!digest) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
      {/* Weakness & Growth Areas Card */}
      <div className="card" style={{ borderLeft: '4px solid var(--sg-primary)' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', letterSpacing: '-0.6px', color: 'var(--text-heading)' }}>
          ⚠️ Identified Weaknesses & Skill Growth
        </h3>
        
        {/* Identified Weaknesses */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
            Detected Speech / Thought Weaknesses
          </h4>
          {digest.weaknesses_identified && digest.weaknesses_identified.length > 0 ? (
            digest.weaknesses_identified.map((w, idx) => (
              <div key={idx} style={{ padding: '8px 12px', background: 'rgba(230, 0, 35, 0.06)', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '6px', color: 'var(--text-heading)' }}>
                • {w}
              </div>
            ))
          ) : (
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>No major cognitive or speech weaknesses detected today.</p>
          )}
        </div>

        {/* Growth Areas */}
        <div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
            Target Growth Areas
          </h4>
          {digest.growth_areas && digest.growth_areas.length > 0 ? (
            digest.growth_areas.map((g, idx) => (
              <div key={idx} style={{ padding: '8px 12px', background: 'var(--surface-canvas)', border: '1px solid var(--border-hairline)', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '6px', fontWeight: 500 }}>
                🚀 {g}
              </div>
            ))
          ) : (
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Maintain current active listening and speech clarity practice.</p>
          )}
        </div>
      </div>

      {/* Research-Backed Tip Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(230, 0, 35, 0.04) 0%, rgba(255, 255, 255, 0) 100%)', border: '1px solid rgba(230, 0, 35, 0.2)' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', letterSpacing: '-0.6px', color: 'var(--sg-primary)' }}>
          📚 Research-Backed Daily Sadhana Tip
        </h3>
        <p style={{ fontSize: '0.98rem', lineHeight: '1.6', color: 'var(--text-heading)', margin: 0, fontStyle: 'italic' }}>
          "{digest.research_tip || 'Carl Rogers Active Listening Scale: Mirroring key constraints before offering solutions builds high trust and alignment.'}"
        </p>

        {digest.key_takeaways && digest.key_takeaways.length > 0 && (
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-hairline)' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Key Takeaways Today</h4>
            {digest.key_takeaways.map((t, i) => (
              <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                ✓ {t}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
