import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Bookmark, 
  TrendingUp, 
  Award, 
  Tag, 
  Layers, 
  Globe, 
  Star,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

export default function App() {
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    platforms: [],
    categories: [],
    avg_interest: 0,
    avg_usefulness: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Filtering & Sorting
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [activePlatform, setActivePlatform] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  // Add Resource state
  const [newUrl, setNewUrl] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Resource state
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editInterest, setEditInterest] = useState(5);
  const [editUsefulness, setEditUsefulness] = useState(5);

  // Trigger search after a debounce
  const debounceTimer = useRef(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    // Reload resources when filters/sorting change
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchResources();
    }, 150);

    return () => clearTimeout(debounceTimer.current);
  }, [search, activeCategory, activePlatform, sortBy, sortOrder]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (activeCategory) params.append('category', activeCategory);
      if (activePlatform) params.append('platform', activePlatform);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await fetch(`${API_BASE}/resources?${params.toString()}`);
      const data = await res.json();
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newUrl) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl, user_notes: newNotes })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to process resource');
      } else {
        setNewUrl('');
        setNewNotes('');
        setShowAddModal(false);
        fetchResources();
        fetchStats();
      }
    } catch (err) {
      console.error('Error adding resource:', err);
      alert('Network error adding resource.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      const res = await fetch(`${API_BASE}/resources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchResources();
        fetchStats();
      } else {
        alert('Failed to delete resource.');
      }
    } catch (err) {
      console.error('Error deleting resource:', err);
    }
  };

  const openEditModal = (resource) => {
    setSelectedResource(resource);
    setEditTitle(resource.title);
    setEditSummary(resource.summary || '');
    setEditCategory(resource.category || 'Other');
    setEditTags(resource.tags || '');
    setEditNotes(resource.user_notes || '');
    setEditInterest(resource.interest_score || 5);
    setEditUsefulness(resource.usefulness_score || 5);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedResource) return;

    try {
      const res = await fetch(`${API_BASE}/resources/${selectedResource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          summary: editSummary,
          category: editCategory,
          tags: editTags,
          user_notes: editNotes,
          interest_score: editInterest,
          usefulness_score: editUsefulness
        })
      });

      if (res.ok) {
        setShowEditModal(false);
        fetchResources();
        fetchStats();
      } else {
        alert('Failed to update resource.');
      }
    } catch (err) {
      console.error('Error updating resource:', err);
    }
  };

  const handleQuickScoreChange = async (id, fieldName, newScore) => {
    // Optimistic UI update
    setResources(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [fieldName]: newScore };
      }
      return item;
    }));

    try {
      const res = await fetch(`${API_BASE}/resources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [fieldName]: newScore })
      });
      
      if (!res.ok) {
        // Rollback on error
        fetchResources();
      } else {
        fetchStats();
      }
    } catch (err) {
      console.error('Error saving score:', err);
      fetchResources();
    }
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper to render platform badge colors & icon styles
  const getPlatformClass = (platform = 'Web') => {
    const plat = platform.toLowerCase();
    if (plat.includes('youtube')) return 'youtube';
    if (plat.includes('instagram')) return 'instagram';
    if (plat.includes('github')) return 'github';
    if (plat.includes('twitter') || plat.includes('x')) return 'twitter';
    if (plat.includes('medium')) return 'medium';
    return 'web';
  };

  const categoriesList = [
    'Tech & Coding',
    'Design & Creative',
    'Productivity & Life Hacks',
    'Business & Finance',
    'Health & Fitness',
    'Entertainment',
    'News & Articles',
    'Other'
  ];

  return (
    <div className="app-container">
      {/* Sidebar Section */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">
            <Bookmark size={20} color="#fff" />
          </div>
          <span className="logo-text">MindVault</span>
        </div>

        {/* Global Statistics Panel */}
        <div className="stats-panel">
          <div className="stat-item">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Resources Saved</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
            <div className="stat-item">
              <span className="stat-value" style={{ fontSize: '1.25rem' }}>⭐ {stats.avg_interest}</span>
              <span className="stat-label" style={{ fontSize: '0.65rem' }}>Avg Interest</span>
            </div>
            <div className="stat-item">
              <span className="stat-value" style={{ fontSize: '1.25rem' }}>🧠 {stats.avg_usefulness}</span>
              <span className="stat-label" style={{ fontSize: '0.65rem' }}>Avg Use</span>
            </div>
          </div>
        </div>

        {/* Categories Filtering List */}
        <div>
          <h4 className="sidebar-title">Categories</h4>
          <nav className="sidebar-menu">
            <a 
              className={`menu-item ${activeCategory === '' ? 'active' : ''}`}
              onClick={() => setActiveCategory('')}
            >
              <div className="menu-item-left">
                <FolderOpen size={16} />
                <span>All Categories</span>
              </div>
              <span className="menu-badge">{stats.total}</span>
            </a>
            {categoriesList.map(cat => {
              const catStat = stats.categories.find(c => c.category === cat);
              const count = catStat ? catStat.count : 0;
              return (
                <a 
                  key={cat}
                  className={`menu-item ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  <div className="menu-item-left">
                    <FolderOpen size={16} />
                    <span>{cat}</span>
                  </div>
                  <span className="menu-badge">{count}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Platforms Filtering List */}
        <div>
          <h4 className="sidebar-title">Platforms</h4>
          <nav className="sidebar-menu">
            <a 
              className={`menu-item ${activePlatform === '' ? 'active' : ''}`}
              onClick={() => setActivePlatform('')}
            >
              <div className="menu-item-left">
                <Globe size={16} />
                <span>All Platforms</span>
              </div>
            </a>
            {stats.platforms.map(p => (
              <a 
                key={p.platform}
                className={`menu-item ${activePlatform === p.platform ? 'active' : ''}`}
                onClick={() => setActivePlatform(p.platform)}
              >
                <div className="menu-item-left">
                  <Globe size={16} />
                  <span>{p.platform}</span>
                </div>
                <span className="menu-badge">{p.count}</span>
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Dashboard Space */}
      <main className="main-content">
        {/* Header toolbar */}
        <div className="header-container">
          <div className="search-bar-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by title, tags, notes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="actions-group">
            <select 
              className="sort-select" 
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
            >
              <option value="created_at-DESC">Newest First</option>
              <option value="created_at-ASC">Oldest First</option>
              <option value="interest_score-DESC">Highest Interest</option>
              <option value="usefulness_score-DESC">Highest Usefulness</option>
              <option value="title-ASC">Title (A-Z)</option>
            </select>

            <button 
              className="btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={18} />
              <span>Add Resource</span>
            </button>
          </div>
        </div>

        {/* Resources Rendering */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p style={{ color: 'var(--text-secondary)' }}>Retrieving resources...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="empty-state">
            <FolderOpen size={48} color="var(--text-muted)" />
            <h3 className="empty-title">No resources found</h3>
            <p className="empty-desc">
              {search || activeCategory || activePlatform 
                ? 'Try adjusting your search query or filters to find what you looking for.' 
                : 'Your Vault is empty! Add resources manually or share links with your Telegram bot.'}
            </p>
          </div>
        ) : (
          <div className="resource-grid">
            {resources.map((resource) => (
              <article 
                key={resource.id} 
                className="resource-card"
                onMouseMove={(e) => {
                  // Interactive card mouse border glow highlight
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                  e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
                }}
              >
                {/* Platform color bar */}
                <div className={`card-platform-bar ${getPlatformClass(resource.platform)}`}></div>

                {/* Card Header & Badges */}
                <div className="card-header">
                  <div className="card-badge-row">
                    <span className="badge-platform">{resource.platform}</span>
                    <span className="badge-category">{resource.category}</span>
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      className="action-btn"
                      onClick={() => openEditModal(resource)}
                      title="Edit resource"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(resource.id)}
                      title="Delete resource"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="card-title"
                >
                  {resource.title}
                  <ExternalLink size={12} style={{ marginLeft: '4px', display: 'inline-block' }} />
                </a>

                {/* Summary */}
                <p className="card-summary">{resource.summary}</p>

                {/* Tags */}
                {resource.tags && (
                  <div className="card-tags">
                    {resource.tags.split(',').filter(Boolean).map(tag => (
                      <span key={tag} className="tag-pill">#{tag.trim()}</span>
                    ))}
                  </div>
                )}

                {/* User notes / shared context */}
                {resource.user_notes && (
                  <div className="card-notes">
                    <span className="notes-label">Shared Context</span>
                    <span className="notes-content">"{resource.user_notes}"</span>
                  </div>
                )}

                {/* Interactive 1-10 Ratings */}
                <div className="card-scores-row">
                  {/* Interest Score */}
                  <div className="score-control">
                    <div className="score-header">
                      <span className="score-title">Interest</span>
                      <span className="score-num">{resource.interest_score}/10</span>
                    </div>
                    <div className="rating-bar">
                      {[...Array(10)].map((_, i) => {
                        const val = i + 1;
                        return (
                          <div 
                            key={val}
                            className={`rating-segment ${val <= resource.interest_score ? 'active' : ''}`}
                            onClick={() => handleQuickScoreChange(resource.id, 'interest_score', val)}
                            title={`Rate Interest: ${val}/10`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Usefulness Score */}
                  <div className="score-control usefulness">
                    <div className="score-header">
                      <span className="score-title">Usefulness</span>
                      <span className="score-num">{resource.usefulness_score}/10</span>
                    </div>
                    <div className="rating-bar">
                      {[...Array(10)].map((_, i) => {
                        const val = i + 1;
                        return (
                          <div 
                            key={val}
                            className={`rating-segment ${val <= resource.usefulness_score ? 'active' : ''}`}
                            onClick={() => handleQuickScoreChange(resource.id, 'usefulness_score', val)}
                            title={`Rate Usefulness: ${val}/10`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Manual Add Resource Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Ingest Resource Link</h3>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Resource URL</label>
                <input 
                  type="url" 
                  className="form-input" 
                  placeholder="https://example.com/useful-article"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Context / Notes (Optional)</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Add custom notes about why this is saved, or paste details if scraping gets blocked..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={15} className="spinner" style={{ animation: 'spin 1s linear infinite', border: 'none', borderTopColor: '#fff', width: '15px', height: '15px' }} />
                      <span>Ingesting...</span>
                    </>
                  ) : (
                    <span>Add to Vault</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Edit Resource Details</h3>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Resource Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="form-select"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="ai, learning, react"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Summary</label>
                <textarea 
                  className="form-textarea" 
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Context / Notes</label>
                <textarea 
                  className="form-textarea" 
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Notes about the resource..."
                />
              </div>

              <div className="form-scores-row">
                <div className="form-group">
                  <label className="form-label">Interest Score (1-10)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    className="form-input"
                    value={editInterest}
                    onChange={(e) => setEditInterest(parseInt(e.target.value) || 5)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Usefulness Score (1-10)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    className="form-input"
                    value={editUsefulness}
                    onChange={(e) => setEditUsefulness(parseInt(e.target.value) || 5)}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
