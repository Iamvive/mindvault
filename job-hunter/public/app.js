document.addEventListener('DOMContentLoaded', () => {
  let allQueuedJobs = [];
  let currentFilter = 'all';

  // DOM Elements
  const navBtns = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');
  const cdpDot = document.getElementById('cdp-dot');
  const cdpText = document.getElementById('cdp-text');

  const statQueued = document.getElementById('stat-queued');
  const statApplied = document.getElementById('stat-applied');
  const statReview = document.getElementById('stat-review');
  const sidebarQueueCount = document.getElementById('sidebar-queue-count');

  const queueContainer = document.getElementById('queue-cards-container');
  const filterPills = document.querySelectorAll('.filter-pill');
  const btnBatchApply = document.getElementById('btn-batch-apply');

  const tailorForm = document.getElementById('tailor-form');
  const profileEditor = document.getElementById('profile-editor');
  const btnSaveProfile = document.getElementById('btn-save-profile');
  const historyTableBody = document.getElementById('history-table-body');

  const pdfModal = document.getElementById('pdf-modal');
  const modalPdfTitle = document.getElementById('modal-pdf-title');
  const pdfIframe = document.getElementById('pdf-iframe');
  const btnCloseModal = document.getElementById('btn-close-modal');

  const btnCopyLinkedin = document.getElementById('btn-copy-linkedin-prompt');
  const btnCopyGithub = document.getElementById('btn-copy-github-prompt');

  // Navigation Tabs
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-tab');
      document.getElementById(targetTab).classList.add('active');

      if (targetTab === 'tab-queue') {
        pageTitle.innerText = 'Approval Queue';
        pageSubtitle.innerText = 'Review ATS tailored resumes and approve 1-click applications.';
        loadQueue();
      } else if (targetTab === 'tab-tailor') {
        pageTitle.innerText = 'Instant JD Tailor';
        pageSubtitle.innerText = 'Paste any job description to generate a tailored ATS resume in seconds.';
      } else if (targetTab === 'tab-history') {
        pageTitle.innerText = 'Application Tracker';
        pageSubtitle.innerText = 'Track the live lifecycle of your submitted and queued job applications.';
        loadHistory();
      } else if (targetTab === 'tab-profile') {
        pageTitle.innerText = 'Master Profile & Global Audit';
        pageSubtitle.innerText = 'Edit your single source of truth and optimize LinkedIn / GitHub presence.';
        loadProfile();
      }
    });
  });

  // Filter Buttons
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-filter');
      renderQueue();
    });
  });

  // Load Status & Stats
  async function loadStatus() {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();

      if (data.cdpConnected) {
        cdpDot.className = 'status-dot connected';
        cdpText.innerText = 'Chrome CDP Connected (Port 9222)';
      } else {
        cdpDot.className = 'status-dot';
        cdpText.innerText = 'CDP Standby (Local Mode)';
      }

      statQueued.innerText = data.queuedCount || 0;
      statApplied.innerText = data.appliedCount || 0;
      statReview.innerText = data.manualReviewCount || 0;
      sidebarQueueCount.innerText = data.queuedCount || 0;
    } catch (e) {
      console.warn('Status error:', e);
    }
  }

  // Load Queue
  async function loadQueue() {
    try {
      const res = await fetch('/api/jobs?status=queued');
      allQueuedJobs = await res.json();
      renderQueue();
      loadStatus();
    } catch (e) {
      queueContainer.innerHTML = `<div class="job-card">Failed to load queue. Please ensure backend is running.</div>`;
    }
  }

  function renderQueue() {
    let filtered = allQueuedJobs;
    if (currentFilter === 'high-ats') {
      filtered = allQueuedJobs.filter(j => (j.atsScore || 0) >= 85);
    } else if (currentFilter === 'instahyre') {
      filtered = allQueuedJobs.filter(j => j.platform === 'instahyre');
    } else if (currentFilter === 'linkedin') {
      filtered = allQueuedJobs.filter(j => j.platform === 'linkedin');
    }

    if (filtered.length === 0) {
      queueContainer.innerHTML = `
        <div class="job-card" style="text-align: center; padding: 48px 20px;">
          <div style="font-size: 32px; margin-bottom: 8px;">🎉</div>
          <h3 style="font-weight: 700; font-size: 16px;">Queue is Clean!</h3>
          <p style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">
            No applications waiting for review. Paste a new JD in "Instant JD Tailor" or run daily discovery.
          </p>
        </div>
      `;
      return;
    }

    queueContainer.innerHTML = filtered.map(job => {
      const matching = Array.isArray(job.matchingKeywords) ? job.matchingKeywords :
        (typeof job.matchingKeywords === 'string' ? JSON.parse(job.matchingKeywords || '[]') : []);

      const kwHtml = matching.slice(0, 6).map(kw => `<span class="kw-chip matched">✓ ${kw}</span>`).join('');

      return `
        <div class="job-card" data-id="${job.id}">
          <div class="job-card-top">
            <div>
              <div class="job-meta-title">${job.title}</div>
              <div class="job-meta-company">${job.company} • <span class="job-meta-location">${job.location || 'Remote'}</span></div>
              <span style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Platform: ${job.platform}</span>
            </div>
            <div class="ats-score-chip">
              <div class="ats-val">${job.atsScore || 85}%</div>
              <div class="ats-tag">ATS Match</div>
            </div>
          </div>

          <div class="job-summary-preview">
            <strong>Tailored Summary:</strong> ${job.tailoredSummary || 'Tailored application summary generated from Master Profile.'}
          </div>

          ${kwHtml ? `<div class="keywords-row">${kwHtml}</div>` : ''}

          <div class="job-card-actions">
            ${job.pdfPath ? `<button class="btn-secondary btn-preview-pdf" data-pdf="${job.pdfPath}" data-title="${job.company} - ${job.title}">👁️ Preview PDF</button>` : ''}
            <button class="btn-secondary btn-dismiss-job" data-id="${job.id}">❌ Dismiss</button>
            <button class="btn-primary btn-apply-job" data-id="${job.id}">🚀 Approve & Apply</button>
          </div>
        </div>
      `;
    }).join('');

    // Attach card event listeners
    document.querySelectorAll('.btn-preview-pdf').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pdf = e.currentTarget.getAttribute('data-pdf');
        const title = e.currentTarget.getAttribute('data-title');
        modalPdfTitle.innerText = `Tailored Resume: ${title}`;
        pdfIframe.src = `/${pdf}`;
        pdfModal.style.display = 'flex';
      });
    });

    document.querySelectorAll('.btn-dismiss-job').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        await fetch(`/api/jobs/${id}/dismiss`, { method: 'POST' });
        loadQueue();
      });
    });

    document.querySelectorAll('.btn-apply-job').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        e.currentTarget.innerText = 'Submitting...';
        e.currentTarget.disabled = true;
        try {
          await fetch(`/api/jobs/${id}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dryRun: false })
          });
        } catch (err) {
          console.error(err);
        }
        loadQueue();
      });
    });
  }

  // Batch Apply All
  btnBatchApply.addEventListener('click', async () => {
    if (allQueuedJobs.length === 0) return;
    const ids = allQueuedJobs.map(j => j.id);
    btnBatchApply.innerText = 'Applying all...';
    btnBatchApply.disabled = true;
    await fetch('/api/jobs/batch-approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobIds: ids })
    });
    btnBatchApply.innerText = '🚀 Batch Apply All';
    btnBatchApply.disabled = false;
    loadQueue();
  });

  // Modal Close
  btnCloseModal.addEventListener('click', () => {
    pdfModal.style.display = 'none';
    pdfIframe.src = '';
  });

  // Tailor New Form Submit
  tailorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-tailor-submit');
    btn.innerText = 'Tailoring with AI...';
    btn.disabled = true;

    const payload = {
      title: document.getElementById('tailor-title').value,
      company: document.getElementById('tailor-company').value,
      platform: document.getElementById('tailor-platform').value,
      jdText: document.getElementById('tailor-jd').value
    };

    try {
      const res = await fetch('/api/jobs/tailor-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        tailorForm.reset();
        alert(`Successfully generated tailored resume for ${payload.company}! Added to Approval Queue with ATS score: ${data.job.atsScore}%.`);
        document.getElementById('nav-queue-btn').click();
      } else {
        alert(`Error: ${data.error || 'Failed to tailor job'}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      btn.innerText = '✨ Tailor Resume & Queue Job';
      btn.disabled = false;
    }
  });

  // Load History
  async function loadHistory() {
    try {
      const res = await fetch('/api/jobs');
      const jobs = await res.json();
      historyTableBody.innerHTML = jobs.map(job => {
        return `
          <tr>
            <td>
              <strong>${job.title}</strong><br>
              <span style="color: var(--text-muted); font-size: 11px;">${job.company}</span>
            </td>
            <td style="text-transform: capitalize;">${job.platform}</td>
            <td><strong>${job.atsScore || 0}%</strong></td>
            <td><span class="status-badge status-${job.status}">${job.status}</span></td>
            <td style="font-size: 11px; color: var(--text-secondary);">${job.notes || (job.submittedAt ? `Submitted: ${new Date(job.submittedAt).toLocaleDateString()}` : '—')}</td>
          </tr>
        `;
      }).join('');
    } catch (e) {
      console.warn(e);
    }
  }

  // Load Profile
  async function loadProfile() {
    try {
      const res = await fetch('/api/profile');
      const profile = await res.json();
      profileEditor.value = JSON.stringify(profile, null, 2);
    } catch (e) {
      console.warn(e);
    }
  }

  btnSaveProfile.addEventListener('click', async () => {
    try {
      const parsed = JSON.parse(profileEditor.value);
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      alert('Master profile saved successfully!');
    } catch (err) {
      alert(`Invalid JSON: ${err.message}`);
    }
  });

  // Copy Prompts
  btnCopyLinkedin.addEventListener('click', () => {
    const prompt = `Review my current profile against top Senior/Lead Engineer profiles. Give me 3 high-impact headlines with Boolean keywords, an engaging About section with impact metrics, and 5 top skills to highlight.`;
    navigator.clipboard.writeText(prompt);
    alert('LinkedIn audit prompt copied to clipboard!');
  });

  btnCopyGithub.addEventListener('click', () => {
    const prompt = `Write a clean GitHub Profile README.md for my username highlighting my top 3 distributed systems projects, live demos, tech stack icons, and engineering philosophy.`;
    navigator.clipboard.writeText(prompt);
    alert('GitHub showcase prompt copied to clipboard!');
  });

  // Initial Load
  loadStatus();
  loadQueue();
});
