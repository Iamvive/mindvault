import React, { useState, useRef, useEffect } from 'react';

export default function ChatDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'sanjaya',
      text: 'Namaste! I am Sanjaya, your visionary narrator and behavioral guide. Ask me anything about your recorded memories, communication patterns, CBT biases, or Kaizen targets.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const newMessages = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: query, history: newMessages })
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        setMessages(prev => [...prev, { sender: 'sanjaya', text: data.answer || "No response generated." }]);
      })
      .catch(err => {
        setLoading(false);
        setMessages(prev => [...prev, { sender: 'sanjaya', text: "Error connecting to Sanjaya RAG engine: " + err.message }]);
      });
  };

  const quickPrompts = [
    "What were my top cognitive distortions this week?",
    "Summarize my work conversations yesterday",
    "What is my Kaizen 1% goal for tomorrow?",
    "How can I improve my Gottman bids for connection?"
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
      zIndex: 2000,
      display: 'flex',
      justifyContent: 'flex-end'
    }} onClick={onClose}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        height: '100%',
        background: 'var(--surface-canvas)',
        borderLeft: '1px solid var(--border-hairline)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.2)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Chat Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Sanjaya AI Assistant</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Memory Vault & Behavioral Mirror</p>
          </div>
          <button onClick={onClose} className="secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>✕ Close</button>
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-hairline)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="pill-badge"
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-hairline)',
                color: 'var(--text-body)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                padding: '6px 12px'
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message History */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '14px 18px',
                borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.sender === 'user' ? 'var(--sg-primary)' : 'var(--surface-card)',
                color: msg.sender === 'user' ? '#ffffff' : 'var(--text-body)',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-hairline)',
                lineHeight: '1.5',
                fontSize: '0.95rem'
              }}
            >
              <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '4px', fontWeight: 600 }}>
                {msg.sender === 'user' ? 'You' : 'Sanjaya'}
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', padding: '12px 16px', borderRadius: '18px', background: 'var(--surface-card)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Reflecting on memories...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ padding: '16px 20px', borderTop: '1px solid var(--border-hairline)', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Ask Sanjaya about your memories or behavior..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            style={{
              flex: 1,
              background: 'var(--surface-card)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-full)',
              padding: '10px 16px',
              color: 'var(--text-heading)',
              fontSize: '0.95rem'
            }}
          />
          <button type="submit" disabled={loading || !input.trim()} className="primary" style={{ padding: '10px 20px' }}>
            Send
          </button>
        </form>

      </div>
    </div>
  );
}
