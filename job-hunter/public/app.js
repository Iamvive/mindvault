document.addEventListener('DOMContentLoaded', () => {
  let allQueuedJobs = [];
  let currentFilter = 'all';
  let loadedProfile = null;
  let currentResumeMode = 'upload';
  let uploadedResumeText = '';
  let uploadedResumeName = '';
  let activePromptType = 'linkedin';

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

  // 3-Pillar Scorecard Elements
  const scGithub = document.getElementById('sc-github');
  const scLinkedinUrl = document.getElementById('sc-linkedin-url');
  const scLinkedinHeadline = document.getElementById('sc-linkedin-headline');
  const scLinkedinAbout = document.getElementById('sc-linkedin-about');

  const btnResumeModes = document.querySelectorAll('.btn-resume-mode');
  const resumeUploadZone = document.getElementById('resume-upload-zone');
  const resumePasteZone = document.getElementById('resume-paste-zone');
  const resumeMasterZone = document.getElementById('resume-master-zone');
  const resumeFileInput = document.getElementById('resume-file-input');
  const dropZoneCta = document.getElementById('drop-zone-cta');
  const resumeFileInfo = document.getElementById('resume-file-info');
  const resumeFileName = document.getElementById('resume-file-name');
  const btnRemoveResume = document.getElementById('btn-remove-resume');
  const scResumeText = document.getElementById('sc-resume-text');

  const btnPrefillAll = document.getElementById('btn-prefill-all');
  const btnScoreAll = document.getElementById('btn-score-all');

  const scorecardResultsArea = document.getElementById('scorecard-results-area');
  const scOverallTitle = document.getElementById('sc-overall-title');
  const scOverallSubtitle = document.getElementById('sc-overall-subtitle');
  const scHeroScore = document.getElementById('sc-hero-score');
  const scHeroGrade = document.getElementById('sc-hero-grade');
  const scCrossInsights = document.getElementById('sc-cross-insights');

  const cardGhBreakdown = document.getElementById('card-gh-breakdown');
  const cardLiBreakdown = document.getElementById('card-li-breakdown');
  const cardResumeBreakdown = document.getElementById('card-resume-breakdown');

  // Prompt Modal Elements
  const promptModal = document.getElementById('prompt-modal');
  const promptModalTitle = document.getElementById('prompt-modal-title');
  const btnClosePromptModal = document.getElementById('btn-close-prompt-modal');
  const promptTextDisplay = document.getElementById('prompt-text-display');
  const promptResponseDisplay = document.getElementById('prompt-response-display');
  const btnCopyGeneratedPrompt = document.getElementById('btn-copy-generated-prompt');
  const btnSendPromptCdp = document.getElementById('btn-send-prompt-cdp');
  const btnPersistAssetChanges = document.getElementById('btn-persist-asset-changes');

  const pdfModal = document.getElementById('pdf-modal');
  const modalPdfTitle = document.getElementById('modal-pdf-title');
  const pdfIframe = document.getElementById('pdf-iframe');
  const btnCloseModal = document.getElementById('btn-close-modal');

  // Resume Mode Switcher
  btnResumeModes.forEach(btn => {
    btn.addEventListener('click', () => {
      btnResumeModes.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentResumeMode = btn.getAttribute('data-mode');

      resumeUploadZone.style.display = currentResumeMode === 'upload' ? 'block' : 'none';
      resumePasteZone.style.display = currentResumeMode === 'paste' ? 'block' : 'none';
      resumeMasterZone.style.display = currentResumeMode === 'master' ? 'block' : 'none';
    });
  });

  // Resume Drop Zone
  resumeUploadZone.addEventListener('click', (e) => {
    if (e.target !== btnRemoveResume) {
      resumeFileInput.click();
    }
  });

  resumeUploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    resumeUploadZone.classList.add('dragover');
  });

  resumeUploadZone.addEventListener('dragleave', () => {
    resumeUploadZone.classList.remove('dragover');
  });

  resumeUploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    resumeUploadZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleResumeFile(e.dataTransfer.files[0]);
    }
  });

  resumeFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleResumeFile(e.target.files[0]);
    }
  });

  btnRemoveResume.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadedResumeText = '';
    uploadedResumeName = '';
    resumeFileInput.value = '';
    dropZoneCta.style.display = 'block';
    resumeFileInfo.style.display = 'none';
  });

  function handleResumeFile(file) {
    uploadedResumeName = file.name;
    const reader = new FileReader();

    reader.onload = (evt) => {
      uploadedResumeText = evt.target.result;
      dropZoneCta.style.display = 'none';
      resumeFileName.innerText = `📄 ${file.name} (${Math.round(file.size / 1024)} KB)`;
      resumeFileInfo.style.display = 'block';
    };

    reader.readAsText(file);
  }

  // Navigation Tabs
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-tab');
      document.getElementById(targetTab).classList.add('active');

      if (targetTab === 'tab-scorecard') {
        pageTitle.innerText = 'My Profile & 3-Pillar AI Scorecard';
        pageSubtitle.innerText = 'Unified career readiness evaluation across GitHub, LinkedIn, and Resume — zero JD required.';
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

  function prefillAssets(prof) {
    if (!prof) return;
    if (prof.personal?.github) scGithub.value = prof.personal.github;
    if (prof.personal?.linkedin) scLinkedinUrl.value = prof.personal.linkedin;
    if (prof.personal?.title) scLinkedinHeadline.value = prof.personal.title;
    if (prof.summary) scLinkedinAbout.value = prof.summary;
  }

  // Auto pre-fill on start
  fetchProfileData().then(prof => {
    if (prof) prefillAssets(prof);
  });

  btnPrefillAll.addEventListener('click', async () => {
    const prof = await fetchProfileData();
    if (prof) {
      prefillAssets(prof);
      alert('Pre-filled GitHub, LinkedIn, and Master Resume from saved profile!');
    }
  });

  // Generate Prompt Buttons
  document.querySelectorAll('.btn-gen-prompt').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const type = e.currentTarget.getAttribute('data-type');
      activePromptType = type;
      promptModalTitle.innerText = `🤖 Claude Prompt for ${type.toUpperCase()}`;

      let payload = {};
      const prof = loadedProfile || await fetchProfileData();

      if (type === 'linkedin') {
        payload = {
          url: scLinkedinUrl.value || prof?.personal?.linkedin,
          headline: scLinkedinHeadline.value || prof?.personal?.title,
          about: scLinkedinAbout.value || prof?.summary
        };
      } else if (type === 'github') {
        payload = {
          username: scGithub.value || prof?.personal?.github,
          bio: prof?.personal?.title || prof?.summary
        };
      } else if (type === 'resume') {
        if (currentResumeMode === 'upload' && uploadedResumeText) {
          payload = { rawText: uploadedResumeText };
        } else if (currentResumeMode === 'paste' && scResumeText.value.trim()) {
          payload = { rawText: scResumeText.value.trim() };
        } else {
          payload = prof || {};
        }
      }

      try {
        const res = await fetch('/api/prompts/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, payload })
        });
        const data = await res.json();
        promptTextDisplay.value = data.prompt;
        promptResponseDisplay.value = '';
        promptModal.style.display = 'flex';
      } catch (err) {
        alert(`Error generating prompt: ${err.message}`);
      }
    });
  });

  btnClosePromptModal.addEventListener('click', () => {
    promptModal.style.display = 'none';
  });

  btnCopyGeneratedPrompt.addEventListener('click', () => {
    navigator.clipboard.writeText(promptTextDisplay.value);
    alert('Claude prompt copied to clipboard!');
  });

  btnSendPromptCdp.addEventListener('click', async () => {
    btnSendPromptCdp.innerText = 'Dispatching to Claude in Chrome...';
    btnSendPromptCdp.disabled = true;

    try {
      const res = await fetch('/api/prompts/send-claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptTextDisplay.value })
      });
      const data = await res.json();
      if (data.success) {
        promptResponseDisplay.value = data.response;
        alert('Received response from Claude!');
      } else {
        alert(data.error || 'Failed to dispatch to Claude');
      }
    } catch (err) {
      alert(`Error sending to Claude: ${err.message}`);
    } finally {
      btnSendPromptCdp.innerText = '⚡ Send to Claude (CDP)';
      btnSendPromptCdp.disabled = false;
    }
  });

  // Save & Persist Asset Changes
  btnPersistAssetChanges.addEventListener('click', async () => {
    const responseText = promptResponseDisplay.value.trim();
    if (!responseText) {
      alert('Please paste Claude’s response or make changes in the Response box first.');
      return;
    }

    let assetData = {};
    if (activePromptType === 'linkedin') {
      assetData = {
        url: scLinkedinUrl.value,
        about: responseText
      };
    } else if (activePromptType === 'github') {
      assetData = {
        username: scGithub.value
      };
    } else if (activePromptType === 'resume') {
      assetData = {
        summary: responseText
      };
    }

    try {
      const res = await fetch('/api/profile/save-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetType: activePromptType, data: assetData })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Changes persistently saved to master_profile.json!`);
        promptModal.style.display = 'none';
        fetchProfileData();
      }
    } catch (err) {
      alert(`Save error: ${err.message}`);
    }
  });

  // Score All 3 Pillars
  btnScoreAll.addEventListener('click', async () => {
    btnScoreAll.innerText = 'Auditing 3 Pillars with AI...';
    btnScoreAll.disabled = true;

    let resumeData = null;
    if (currentResumeMode === 'upload' && uploadedResumeText) {
      resumeData = { text: uploadedResumeText, filename: uploadedResumeName };
    } else if (currentResumeMode === 'paste' && scResumeText.value.trim()) {
      resumeData = { text: scResumeText.value.trim() };
    } else {
      resumeData = loadedProfile || await fetchProfileData();
    }

    const payload = {
      githubUsernameOrUrl: scGithub.value.trim(),
      linkedinUrl: scLinkedinUrl.value.trim(),
      linkedinHeadline: scLinkedinHeadline.value.trim(),
      linkedinAbout: scLinkedinAbout.value.trim(),
      resumeData
    };

    try {
      const res = await fetch('/api/audit/full-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        const sc = data.scorecard;
        statBrandScore.innerText = `${sc.overallScore}%`;

        // Render Hero
        scorecardResultsArea.style.display = 'block';
        scHeroScore.innerText = `${sc.overallScore}%`;
        scHeroGrade.innerText = `Grade ${sc.overallGrade}`;
        scOverallTitle.innerText = `Overall Readiness: ${sc.overallScore}/100 (Grade ${sc.overallGrade})`;
        scOverallSubtitle.innerText = sc.overallScore >= 85 ?
          'Your 3 assets (GitHub, LinkedIn, and Resume) are in the top tier for senior tech roles.' :
          'Good foundation with immediate actionable optimization opportunities across your 3 pillars.';

        // Render Cross Insights
        if (sc.crossAssetInsights && sc.crossAssetInsights.length > 0) {
          scCrossInsights.innerHTML = `
            <strong style="font-size: 12px; color: var(--text-primary);">🔄 Cross-Asset Alignment Gaps:</strong>
            <ul style="margin-left: 18px; font-size: 12px; color: var(--text-secondary); margin-top: 6px;">
              ${sc.crossAssetInsights.map(item => `<li>${item}</li>`).join('')}
            </ul>
          `;
        } else {
          scCrossInsights.innerHTML = `
            <div style="font-size: 12px; color: #065f46;">
              ✅ <strong>High Consistency:</strong> Your GitHub projects, LinkedIn skills, and Resume experience are mutually aligned.
            </div>
          `;
        }

        // 1. Render GitHub Pillar
        const gh = sc.pillars.github;
        if (gh && !gh.error) {
          cardGhBreakdown.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4 style="font-size: 15px; font-weight: 700;">💻 1. GitHub Score</h4>
              <div class="ats-score-chip" style="padding: 4px 10px;">
                <span class="ats-val" style="font-size: 14px;">${gh.score}/100</span>
              </div>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">Grade ${gh.grade} • ${gh.publicRepos || 0} Public Repos</div>

            <div style="margin-bottom: 10px;">
              <strong style="font-size: 11.5px; color: #065f46;">Strengths:</strong>
              <ul style="margin-left: 16px; font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">
                ${(gh.strengths || []).slice(0, 2).map(s => `<li>${s}</li>`).join('')}
              </ul>
            </div>

            ${(gh.improvements || []).length > 0 ? `
              <div style="margin-bottom: 12px;">
                <strong style="font-size: 11.5px; color: var(--sg-primary);">Fixes:</strong>
                <ul style="margin-left: 16px; font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">
                  ${gh.improvements.slice(0, 2).map(i => `<li>${i}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            <button class="btn-pill btn-copy-gh-readme" data-readme="${encodeURIComponent(gh.recommendedReadme || '')}" style="width: 100%; margin-top: 8px;">
              📋 Copy Profile README
            </button>
          `;
        } else {
          cardGhBreakdown.innerHTML = `<div style="font-size: 12px; color: var(--text-muted);">GitHub not scored or rate limited.</div>`;
        }

        // 2. Render LinkedIn Pillar
        const li = sc.pillars.linkedin;
        if (li) {
          cardLiBreakdown.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4 style="font-size: 15px; font-weight: 700;">👔 2. LinkedIn Score</h4>
              <div class="ats-score-chip" style="padding: 4px 10px;">
                <span class="ats-val" style="font-size: 14px;">${li.score}/100</span>
              </div>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">Grade ${li.grade} • Recruiter SEO Index</div>

            <div style="margin-bottom: 10px;">
              <strong style="font-size: 11.5px; color: #065f46;">Strengths:</strong>
              <ul style="margin-left: 16px; font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">
                ${(li.strengths || []).slice(0, 2).map(s => `<li>${s}</li>`).join('')}
              </ul>
            </div>

            ${(li.improvements || []).length > 0 ? `
              <div style="margin-bottom: 12px;">
                <strong style="font-size: 11.5px; color: var(--sg-primary);">Fixes:</strong>
                <ul style="margin-left: 16px; font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">
                  ${li.improvements.slice(0, 2).map(i => `<li>${typeof i === 'object' ? i.title : i}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
              <button class="btn-primary btn-apply-li-head" data-head="${encodeURIComponent(li.generatedHeadlines?.[0] || '')}" style="font-size: 11.5px; padding: 6px 12px;">
                ✨ Apply Magnetic Headline
              </button>
              <button class="btn-secondary btn-apply-li-about" data-about="${encodeURIComponent(li.generatedAbout || '')}" style="font-size: 11.5px; padding: 6px 12px;">
                ✨ Adopt High-Impact About Story
              </button>
            </div>
          `;
        }

        // 3. Render Resume Pillar
        const resPillar = sc.pillars.resume;
        if (resPillar) {
          cardResumeBreakdown.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4 style="font-size: 15px; font-weight: 700;">📄 3. Resume ATS Score</h4>
              <div class="ats-score-chip" style="padding: 4px 10px;">
                <span class="ats-val" style="font-size: 14px;">${resPillar.score}/100</span>
              </div>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">Grade ${resPillar.grade} • ${resPillar.metricsCount || 0} Metrics Found</div>

            <div style="margin-bottom: 10px;">
              <strong style="font-size: 11.5px; color: #065f46;">Strengths:</strong>
              <ul style="margin-left: 16px; font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">
                ${(resPillar.strengths || []).slice(0, 2).map(s => `<li>${s}</li>`).join('')}
              </ul>
            </div>

            ${(resPillar.improvements || []).length > 0 ? `
              <div style="margin-bottom: 12px;">
                <strong style="font-size: 11.5px; color: var(--sg-primary);">Fixes:</strong>
                <ul style="margin-left: 16px; font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">
                  ${resPillar.improvements.slice(0, 2).map(i => `<li>${i}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            <button class="btn-primary" id="btn-goto-tailor" style="width: 100%; margin-top: 8px; font-size: 11.5px; padding: 6px 12px;">
              ✨ Generate ATS Single-Page PDF
            </button>
          `;
        }

        // Attach dynamic button listeners
        document.querySelectorAll('.btn-copy-gh-readme').forEach(b => {
          b.addEventListener('click', (e) => {
            const readme = decodeURIComponent(e.currentTarget.getAttribute('data-readme'));
            navigator.clipboard.writeText(readme);
            alert('Profile README copied to clipboard!');
          });
        });

        document.querySelectorAll('.btn-apply-li-head').forEach(b => {
          b.addEventListener('click', (e) => {
            const head = decodeURIComponent(e.currentTarget.getAttribute('data-head'));
            scLinkedinHeadline.value = head;
            btnScoreAll.click();
          });
        });

        document.querySelectorAll('.btn-apply-li-about').forEach(b => {
          b.addEventListener('click', (e) => {
            const about = decodeURIComponent(e.currentTarget.getAttribute('data-about'));
            scLinkedinAbout.value = about;
            btnScoreAll.click();
          });
        });

        const btnGotoTailor = document.getElementById('btn-goto-tailor');
        if (btnGotoTailor) {
          btnGotoTailor.addEventListener('click', () => {
            document.getElementById('nav-tailor-btn').click();
          });
        }

        scorecardResultsArea.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      alert(`Scorecard Error: ${err.message}`);
    } finally {
      btnScoreAll.innerText = '⚡ Score My 3-Pillar Profile';
      btnScoreAll.disabled = false;
    }
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
