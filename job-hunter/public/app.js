document.addEventListener('DOMContentLoaded', () => {
  let allQueuedJobs = [];
  let currentFilter = 'all';
  let loadedProfile = null;
  let liScore = 0;
  let ghScore = 0;

  // DOM Elements
  const navBtns = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');
  const cdpDot = document.getElementById('cdp-dot');
  const cdpText = document.getElementById('cdp-text');

  const statQueued = document.getElementById('stat-queued');
  const statApplied = document.getElementById('stat-applied');
  const statBrandScore = document.getElementById('stat-brand-score');
  const sidebarQueueCount = document.getElementById('sidebar-queue-count');

  const queueContainer = document.getElementById('queue-cards-container');
  const filterPills = document.querySelectorAll('.filter-pill');
  const btnBatchApply = document.getElementById('btn-batch-apply');

  const tailorForm = document.getElementById('tailor-form');
  const profileEditor = document.getElementById('profile-editor');
  const btnSaveProfile = document.getElementById('btn-save-profile');
  const historyTableBody = document.getElementById('history-table-body');

  const linkedinAuditForm = document.getElementById('linkedin-audit-form');
  const liAuditResult = document.getElementById('li-audit-result');
  const btnLiLoadMaster = document.getElementById('btn-li-load-master');
  const liUrl = document.getElementById('li-url');
  const liHeadline = document.getElementById('li-headline');
  const liAbout = document.getElementById('li-about');

  const githubAuditForm = document.getElementById('github-audit-form');
  const ghAuditResult = document.getElementById('gh-audit-result');
  const btnGhLoadMaster = document.getElementById('btn-gh-load-master');
  const ghUsername = document.getElementById('gh-username');
  const btnRunFullAudit = document.getElementById('btn-run-full-audit');

  const pdfModal = document.getElementById('pdf-modal');
  const modalPdfTitle = document.getElementById('modal-pdf-title');
  const pdfIframe = document.getElementById('pdf-iframe');
  const btnCloseModal = document.getElementById('btn-close-modal');

  function updateBrandHealth() {
    if (liScore > 0 && ghScore > 0) {
      const avg = Math.round((liScore + ghScore) / 2);
      statBrandScore.innerText = `${avg}%`;
    } else if (liScore > 0) {
      statBrandScore.innerText = `${liScore}%`;
    } else if (ghScore > 0) {
      statBrandScore.innerText = `${ghScore}%`;
    }
  }

  // Navigation Tabs
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-tab');
      document.getElementById(targetTab).classList.add('active');

      if (targetTab === 'tab-auditor') {
        pageTitle.innerText = 'Profile Rater & Fixer';
        pageSubtitle.innerText = 'Standalone evaluation for your LinkedIn & GitHub presence — zero JD required.';
      } else if (targetTab === 'tab-queue') {
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
        pageTitle.innerText = 'Master Profile JSON';
        pageSubtitle.innerText = 'Edit your single source of truth used for generating all ATS resumes.';
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
      sidebarQueueCount.innerText = data.queuedCount || 0;
    } catch (e) {
      console.warn('Status error:', e);
    }
  }

  // Load Master Profile
  async function fetchProfileData() {
    try {
      const res = await fetch('/api/profile');
      loadedProfile = await res.json();
      return loadedProfile;
    } catch (e) {
      console.warn(e);
      return null;
    }
  }

  // Auto pre-fill on first load if inputs are empty
  fetchProfileData().then(prof => {
    if (prof) {
      if (!liUrl.value && prof.personal?.linkedin) liUrl.value = prof.personal.linkedin;
      if (!liHeadline.value && prof.personal?.title) liHeadline.value = prof.personal.title;
      if (!liAbout.value && prof.summary) liAbout.value = prof.summary;
      if (!ghUsername.value && prof.personal?.github) ghUsername.value = prof.personal.github;
    }
  });

  // Run Both Audits
  btnRunFullAudit.addEventListener('click', () => {
    document.getElementById('btn-audit-li').click();
    document.getElementById('btn-audit-gh').click();
  });

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

  // Pre-fill from Master Profile
  btnLiLoadMaster.addEventListener('click', async () => {
    const prof = await fetchProfileData();
    if (prof) {
      liUrl.value = prof.personal?.linkedin || '';
      liHeadline.value = prof.personal?.title || '';
      liAbout.value = prof.summary || '';
      document.getElementById('btn-audit-li').click();
    }
  });

  btnGhLoadMaster.addEventListener('click', async () => {
    const prof = await fetchProfileData();
    if (prof) {
      ghUsername.value = prof.personal?.github || '';
      document.getElementById('btn-audit-gh').click();
    }
  });

  // LinkedIn Audit Form
  linkedinAuditForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-audit-li');
    btn.innerText = 'Analyzing...';
    btn.disabled = true;

    const payload = {
      headline: liHeadline.value,
      about: liAbout.value,
      profileUrl: liUrl.value
    };

    try {
      const res = await fetch('/api/audit/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        const audit = data.audit;
        liScore = audit.score;
        updateBrandHealth();
        renderLinkedInAudit(audit);
      }
    } catch (err) {
      alert(`Audit failed: ${err.message}`);
    } finally {
      btn.innerText = '⚡ Rate LinkedIn Profile';
      btn.disabled = false;
    }
  });

  function renderLinkedInAudit(audit) {
    liAuditResult.style.display = 'block';
    liAuditResult.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: var(--bg-sidebar); padding: 12px 16px; border-radius: var(--radius-card);">
        <div>
          <div style="font-weight: 700; font-size: 16px;">LinkedIn Health: Grade ${audit.grade}</div>
          <span style="font-size: 12px; color: var(--text-muted);">${audit.score >= 85 ? '🌟 Recruiter SEO Optimized' : '⚠️ Has optimization opportunities'}</span>
        </div>
        <div class="ats-score-chip">
          <span class="ats-val">${audit.score}/100</span>
          <span class="ats-tag">Recruiter Score</span>
        </div>
      </div>

      <div style="margin-bottom: 14px;">
        <strong style="font-size: 12px; color: #065f46;">✅ Profile Strengths:</strong>
        <ul style="margin-left: 18px; font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
          ${audit.strengths.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>

      ${audit.improvements.length > 0 ? `
        <div style="margin-bottom: 16px;">
          <strong style="font-size: 12px; color: var(--sg-primary);">🛠️ Actionable Gaps & 1-Click Fixes:</strong>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
            ${audit.improvements.map((imp, idx) => `
              <div style="background: var(--bg-app); border: 1px solid var(--border-light); padding: 10px 14px; border-radius: var(--radius-card); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 600; font-size: 13px;">${imp.title}</div>
                  <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">${imp.description}</div>
                </div>
                <button class="btn-primary btn-apply-li-fix" data-type="${imp.replacementType}" data-idx="${idx}" style="font-size: 11px; padding: 5px 12px;">
                  ✨ ${imp.actionLabel}
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border-light);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 13px;">✨ Recommended Magnetic Headlines:</strong>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          ${audit.generatedHeadlines.map((h, idx) => `
            <div style="font-size: 12px; background: var(--bg-sidebar); padding: 10px 14px; border-radius: var(--radius-card); border: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center;">
              <span>${h}</span>
              <button class="btn-secondary btn-apply-headline-direct" data-headline="${encodeURIComponent(h)}" style="font-size: 11px; padding: 4px 10px; margin-left: 10px;">
                Apply
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border-light);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 13px;">📝 Optimized About Story Rewrite:</strong>
          <button class="btn-pill" id="btn-copy-about-story">📋 Copy Story</button>
        </div>
        <textarea id="li-generated-about-text" readonly rows="7" style="width: 100%; margin-top: 8px; font-size: 12px; background: var(--bg-sidebar); border: 1px solid var(--border-light); border-radius: var(--radius-card); padding: 10px;">${audit.generatedAbout}</textarea>
        <button class="btn-primary" id="btn-apply-about-story" style="margin-top: 8px; font-size: 12px; width: 100%;">
          ✨ Adopt This About Story & Re-Rate
        </button>
      </div>
    `;

    document.querySelectorAll('.btn-apply-headline-direct').forEach(b => {
      b.addEventListener('click', (e) => {
        const text = decodeURIComponent(e.currentTarget.getAttribute('data-headline'));
        liHeadline.value = text;
        document.getElementById('btn-audit-li').click();
      });
    });

    document.querySelectorAll('.btn-apply-li-fix').forEach(b => {
      b.addEventListener('click', (e) => {
        const type = e.currentTarget.getAttribute('data-type');
        if (type === 'headline' && audit.generatedHeadlines.length > 0) {
          liHeadline.value = audit.generatedHeadlines[0];
        } else if ((type === 'about' || type === 'metrics' || type === 'keywords') && audit.generatedAbout) {
          liAbout.value = audit.generatedAbout;
        }
        document.getElementById('btn-audit-li').click();
      });
    });

    const btnCopyStory = document.getElementById('btn-copy-about-story');
    if (btnCopyStory) {
      btnCopyStory.addEventListener('click', () => {
        navigator.clipboard.writeText(audit.generatedAbout);
        alert('Optimized About Section copied to clipboard!');
      });
    }

    const btnApplyAboutStory = document.getElementById('btn-apply-about-story');
    if (btnApplyAboutStory) {
      btnApplyAboutStory.addEventListener('click', () => {
        liAbout.value = audit.generatedAbout;
        document.getElementById('btn-audit-li').click();
      });
    }
  }

  // GitHub Audit Form
  githubAuditForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-audit-gh');
    btn.innerText = 'Auditing Repos...';
    btn.disabled = true;

    const usernameOrUrl = ghUsername.value;

    try {
      const res = await fetch('/api/audit/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrUrl })
      });
      const data = await res.json();
      if (data.success) {
        const audit = data.audit;
        ghScore = audit.score;
        updateBrandHealth();
        renderGitHubAudit(audit);
      } else {
        alert(data.error || 'Failed to audit GitHub profile');
      }
    } catch (err) {
      alert(`GitHub audit error: ${err.message}`);
    } finally {
      btn.innerText = '⚡ Rate GitHub Profile';
      btn.disabled = false;
    }
  });

  function renderGitHubAudit(audit) {
    ghAuditResult.style.display = 'block';
    ghAuditResult.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: var(--bg-sidebar); padding: 12px 16px; border-radius: var(--radius-card);">
        <div style="display: flex; align-items: center; gap: 10px;">
          ${audit.avatarUrl ? `<img src="${audit.avatarUrl}" style="width: 36px; height: 36px; border-radius: 50%;">` : ''}
          <div>
            <div style="font-weight: 700; font-size: 15px;">${audit.name} (Grade ${audit.grade})</div>
            <span style="font-size: 11px; color: var(--text-muted);">${audit.publicRepos} Public Repos • ${audit.followers} Followers</span>
          </div>
        </div>
        <div class="ats-score-chip">
          <span class="ats-val">${audit.score}/100</span>
          <span class="ats-tag">Presence Score</span>
        </div>
      </div>

      <div style="margin-bottom: 14px;">
        <strong style="font-size: 12px; color: #065f46;">✅ Strengths:</strong>
        <ul style="margin-left: 18px; font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
          ${audit.strengths.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>

      ${audit.improvements.length > 0 ? `
        <div style="margin-bottom: 14px;">
          <strong style="font-size: 12px; color: var(--sg-primary);">⚠️ Gaps to Fix:</strong>
          <ul style="margin-left: 18px; font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
            ${audit.improvements.map(imp => `<li>${imp}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border-light);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 13px;">📄 Suggested Profile README:</strong>
          <button class="btn-pill" id="btn-copy-gh-readme">📋 Copy README</button>
        </div>
        <textarea readonly rows="8" style="width: 100%; margin-top: 8px; font-size: 11.5px; font-family: monospace; background: var(--bg-sidebar); border: 1px solid var(--border-light); border-radius: var(--radius-card); padding: 10px;">${audit.recommendedReadme}</textarea>
      </div>
    `;

    document.getElementById('btn-copy-gh-readme').addEventListener('click', () => {
      navigator.clipboard.writeText(audit.recommendedReadme);
      alert('GitHub Profile README markdown copied to clipboard!');
    });
  }

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

  // Initial Load
  loadStatus();
  loadQueue();
});
