document.addEventListener('DOMContentLoaded', () => {
  let allQueuedJobs = [];
  let currentFilter = 'all';
  let loadedProfile = null;
  let currentResumeMode = 'upload';
  let uploadedResumeText = localStorage.getItem('mindhunt_resume_text') || '';
  let uploadedResumeName = localStorage.getItem('mindhunt_resume_name') || '';
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
  const historyTableBody = document.getElementById('history-table-body');

  // Candidate Snapshot Elements
  const snapRole = document.getElementById('snap-role');
  const snapCompany = document.getElementById('snap-company');
  const snapYoe = document.getElementById('snap-yoe');
  const snapTarget = document.getElementById('snap-target');
  const snapLocation = document.getElementById('snap-location');
  const btnEditSnapshot = document.getElementById('btn-edit-snapshot');
  const btnSyncLinkedinSnapshot = document.getElementById('btn-sync-linkedin-snapshot');

  // Snapshot Modal Elements
  const snapshotModal = document.getElementById('snapshot-modal');
  const btnCloseSnapshotModal = document.getElementById('btn-close-snapshot-modal');
  const editSnapRole = document.getElementById('edit-snap-role');
  const editSnapCompany = document.getElementById('edit-snap-company');
  const editSnapYoe = document.getElementById('edit-snap-yoe');
  const editSnapTarget = document.getElementById('edit-snap-target');
  const editSnapLocation = document.getElementById('edit-snap-location');
  const btnSaveSnapshotModal = document.getElementById('btn-save-snapshot-modal');

  // Resume Studio Elements
  const studioName = document.getElementById('studio-name');
  const studioTitle = document.getElementById('studio-title');
  const studioEmail = document.getElementById('studio-email');
  const studioPhone = document.getElementById('studio-phone');
  const studioLocation = document.getElementById('studio-location');
  const studioSummary = document.getElementById('studio-summary');
  const studioExperienceList = document.getElementById('studio-experience-list');
  const studioPreviewIframe = document.getElementById('studio-preview-iframe');
  const btnRefreshPreview = document.getElementById('btn-refresh-preview');
  const btnSaveStudioEdits = document.getElementById('btn-save-studio-edits');
  const btnCopyPlainResume = document.getElementById('btn-copy-plain-resume');

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

  // Live Candidate Profile Elements
  const liveProfName = document.getElementById('live-prof-name');
  const liveProfTitle = document.getElementById('live-prof-title');
  const liveProfSummary = document.getElementById('live-prof-summary');
  const liveProfExperienceContainer = document.getElementById('live-prof-experience-container');
  const liveProfSkillsContainer = document.getElementById('live-prof-skills-container');
  const liveProfLinkedin = document.getElementById('live-prof-linkedin');
  const liveProfGithub = document.getElementById('live-prof-github');
  const btnSaveLiveProfile = document.getElementById('btn-save-live-profile');
  const btnReloadLiveProfile = document.getElementById('btn-reload-live-profile');

  // Prompt Modal Elements
  const promptModal = document.getElementById('prompt-modal');
  const promptModalTitle = document.getElementById('prompt-modal-title');
  const btnClosePromptModal = document.getElementById('btn-close-prompt-modal');
  const promptTextDisplay = document.getElementById('prompt-text-display');
  const promptResponseDisplay = document.getElementById('prompt-response-display');
  const btnCopyGeneratedPrompt = document.getElementById('btn-copy-generated-prompt');
  const btnSendPromptCdp = document.getElementById('btn-send-prompt-cdp');
  const btnApplyClaudeProfile = document.getElementById('btn-apply-claude-profile');

  // --- AUTOMATED PERSISTENCE FOR 3 PILLARS ---
  function autoSaveGitHub() {
    const val = scGithub.value.trim();
    if (!val) return;
    localStorage.setItem('mindhunt_gh', val);
    fetch('/api/profile/save-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetType: 'github', data: { username: val } })
    }).then(() => {
      if (loadedProfile?.personal) loadedProfile.personal.github = val;
      if (liveProfGithub) liveProfGithub.value = val;
    }).catch(console.warn);
  }

  function autoSaveLinkedIn() {
    const val = scLinkedinUrl.value.trim();
    if (!val) return;
    localStorage.setItem('mindhunt_li', val);
    fetch('/api/profile/save-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetType: 'linkedin', data: { url: val } })
    }).then(() => {
      if (loadedProfile?.personal) loadedProfile.personal.linkedin = val;
      if (liveProfLinkedin) liveProfLinkedin.value = val;
    }).catch(console.warn);
  }

  scGithub.addEventListener('change', autoSaveGitHub);
  scGithub.addEventListener('blur', autoSaveGitHub);
  scLinkedinUrl.addEventListener('change', autoSaveLinkedIn);
  scLinkedinUrl.addEventListener('blur', autoSaveLinkedIn);

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
    localStorage.removeItem('mindhunt_resume_text');
    localStorage.removeItem('mindhunt_resume_name');
    resumeFileInput.value = '';
    dropZoneCta.style.display = 'block';
    resumeFileInfo.style.display = 'none';

    fetch('/api/profile/save-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetType: 'resume', data: { filename: '', text: '' } })
    });
  });

  function handleResumeFile(file) {
    uploadedResumeName = file.name;
    const reader = new FileReader();

    reader.onload = async (evt) => {
      const dataUrl = evt.target.result;

      dropZoneCta.style.display = 'none';
      resumeFileName.innerText = `📄 ${file.name} (Extracting text...)`;
      resumeFileInfo.style.display = 'block';

      try {
        const res = await fetch('/api/resume/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            base64Data: dataUrl
          })
        });
        const data = await res.json();
        if (data.success) {
          uploadedResumeText = data.profile?.uploadedResumeText || '';
          localStorage.setItem('mindhunt_resume_text', uploadedResumeText);
          localStorage.setItem('mindhunt_resume_name', file.name);
          resumeFileName.innerText = `📄 ${file.name} (Parsed & Active)`;
        }
      } catch (err) {
        console.warn('PDF parse error:', err);
      }
    };

    reader.readAsDataURL(file);
  }

  // Restore saved resume if present
  if (uploadedResumeName) {
    dropZoneCta.style.display = 'none';
    resumeFileName.innerText = `📄 ${uploadedResumeName} (Saved & Active)`;
    resumeFileInfo.style.display = 'block';
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
      } else if (targetTab === 'tab-resume-studio') {
        pageTitle.innerText = 'Master ATS Resume Studio & PDF Viewer';
        pageSubtitle.innerText = 'Live single-column ATS preview, real-time section editor, and instant PDF download.';
        renderResumeStudio();
      } else if (targetTab === 'tab-live-profile') {
        pageTitle.innerText = 'Live Candidate Profile Workspace';
        pageSubtitle.innerText = 'The persistent, evolving source of truth for your applications and audits.';
        renderLiveProfile();
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

  // Load Master Profile & Snapshot
  async function fetchProfileData() {
    try {
      const res = await fetch('/api/profile');
      loadedProfile = await res.json();
      renderCandidateSnapshot(loadedProfile);
      prefillAssets(loadedProfile);
      return loadedProfile;
    } catch (e) {
      console.warn(e);
      return null;
    }
  }

  function renderCandidateSnapshot(p) {
    if (!p) return;
    const pers = p.personal || {};
    snapRole.innerText = pers.currentRole || pers.title || 'Senior Software Engineer';
    snapCompany.innerText = pers.currentCompany ? `at ${pers.currentCompany}` : 'Tech Company';
    snapYoe.innerText = `${pers.totalYearsExperience || 6.0} Years Experience`;
    snapTarget.innerText = pers.targetSeniority || 'Staff / Lead Engineer';
    snapLocation.innerText = pers.location || 'Remote / Hybrid';
  }

  function prefillAssets(prof) {
    if (!prof) return;
    const cachedGh = localStorage.getItem('mindhunt_gh');
    const cachedLi = localStorage.getItem('mindhunt_li');

    if (scGithub) scGithub.value = cachedGh || prof.personal?.github || '';
    if (scLinkedinUrl) scLinkedinUrl.value = cachedLi || prof.personal?.linkedin || '';
    if (scLinkedinHeadline) scLinkedinHeadline.value = prof.personal?.title || '';
    if (scLinkedinAbout) scLinkedinAbout.value = prof.summary || '';

    if (prof.uploadedResumeFileName) {
      uploadedResumeName = prof.uploadedResumeFileName;
      uploadedResumeText = prof.uploadedResumeText || '';
      dropZoneCta.style.display = 'none';
      resumeFileName.innerText = `📄 ${uploadedResumeName} (Saved & Active)`;
      resumeFileInfo.style.display = 'block';
    }
  }

  fetchProfileData();

  btnPrefillAll.addEventListener('click', async () => {
    const prof = await fetchProfileData();
    if (prof) {
      prefillAssets(prof);
      alert('Pre-filled GitHub, LinkedIn, and Master Resume from saved profile!');
    }
  });

  // Snapshot Edit Handlers
  btnEditSnapshot.addEventListener('click', () => {
    if (!loadedProfile) return;
    const pers = loadedProfile.personal || {};
    editSnapRole.value = pers.currentRole || pers.title || '';
    editSnapCompany.value = pers.currentCompany || '';
    editSnapYoe.value = pers.totalYearsExperience || 6.0;
    editSnapTarget.value = pers.targetSeniority || 'Staff / Lead Software Engineer';
    editSnapLocation.value = pers.location || 'Bengaluru, India';
    snapshotModal.style.display = 'flex';
  });

  btnCloseSnapshotModal.addEventListener('click', () => {
    snapshotModal.style.display = 'none';
  });

  btnSaveSnapshotModal.addEventListener('click', async () => {
    const payload = {
      currentRole: editSnapRole.value,
      currentCompany: editSnapCompany.value,
      totalYearsExperience: parseFloat(editSnapYoe.value) || 5.0,
      targetSeniority: editSnapTarget.value,
      location: editSnapLocation.value
    };

    try {
      const res = await fetch('/api/profile/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        loadedProfile = data.profile;
        renderCandidateSnapshot(loadedProfile);
        snapshotModal.style.display = 'none';
        alert('Candidate Snapshot saved persistently!');
      }
    } catch (err) {
      alert(`Save error: ${err.message}`);
    }
  });

  // Auto-Sync Snapshot from LinkedIn
  btnSyncLinkedinSnapshot.addEventListener('click', async () => {
    const url = scLinkedinUrl.value || loadedProfile?.personal?.linkedin;
    if (!url) {
      alert('Please enter your LinkedIn Profile URL in Pillar 2 first.');
      return;
    }

    btnSyncLinkedinSnapshot.innerText = 'Extracting from LinkedIn...';
    btnSyncLinkedinSnapshot.disabled = true;

    try {
      const res = await fetch('/api/profile/extract-linkedin-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl: url })
      });
      const data = await res.json();
      if (data.success) {
        loadedProfile = data.profile;
        renderCandidateSnapshot(loadedProfile);
        alert(`Successfully extracted experience from LinkedIn! Total YoE calculated: ${data.profile.personal.totalYearsExperience} yrs.`);
      }
    } catch (e) {
      alert(`LinkedIn sync error: ${e.message}`);
    } finally {
      btnSyncLinkedinSnapshot.innerText = '⚡ Auto-Sync LinkedIn';
      btnSyncLinkedinSnapshot.disabled = false;
    }
  });

  // Render Resume Studio
  function renderResumeStudio() {
    if (!loadedProfile) return;
    const p = loadedProfile;
    const pers = p.personal || {};

    studioName.value = pers.name || '';
    studioTitle.value = pers.title || '';
    studioEmail.value = pers.email || '';
    studioPhone.value = pers.phone || '';
    studioLocation.value = pers.location || '';
    studioSummary.value = p.summary || '';

    const expList = p.masterExperience || [];
    studioExperienceList.innerHTML = expList.map((exp, idx) => `
      <div style="background: var(--bg-app); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 12px;">
        <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px;">${exp.role} | ${exp.company}</div>
        <textarea class="studio-exp-bullets code-editor" data-idx="${idx}" rows="${Math.max(3, (exp.bullets || []).length * 2)}" style="font-family: inherit; font-size: 11.5px;">${(exp.bullets || []).join('\n')}</textarea>
      </div>
    `).join('');

    studioPreviewIframe.src = '/api/resume/preview-html?' + Date.now();
  }

  btnRefreshPreview.addEventListener('click', () => {
    studioPreviewIframe.src = '/api/resume/preview-html?' + Date.now();
  });

  btnSaveStudioEdits.addEventListener('click', async () => {
    if (!loadedProfile) return;

    loadedProfile.personal.name = studioName.value;
    loadedProfile.personal.title = studioTitle.value;
    loadedProfile.personal.email = studioEmail.value;
    loadedProfile.personal.phone = studioPhone.value;
    loadedProfile.personal.location = studioLocation.value;
    loadedProfile.summary = studioSummary.value;

    document.querySelectorAll('.studio-exp-bullets').forEach(t => {
      const idx = parseInt(t.getAttribute('data-idx'), 10);
      const lines = t.value.split('\n').map(l => l.trim()).filter(Boolean);
      if (loadedProfile.masterExperience[idx]) {
        loadedProfile.masterExperience[idx].bullets = lines;
      }
    });

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loadedProfile)
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Master Resume edits saved!');
        btnRefreshPreview.click();
      }
    } catch (e) {
      alert(`Save error: ${e.message}`);
    }
  });

  btnCopyPlainResume.addEventListener('click', () => {
    if (!loadedProfile) return;
    const p = loadedProfile;
    const pers = p.personal || {};

    let text = `${pers.name}\n${pers.title}\n${pers.email} | ${pers.phone} | ${pers.location}\n\nSUMMARY\n${p.summary}\n\nEXPERIENCE\n`;
    for (const exp of p.masterExperience || []) {
      text += `\n${exp.role} | ${exp.company} (${exp.startDate} - ${exp.endDate})\n`;
      for (const b of exp.bullets || []) {
        text += `• ${b}\n`;
      }
    }

    navigator.clipboard.writeText(text);
    alert('Plain text resume copied to clipboard!');
  });

  // Render Live Candidate Profile Workspace
  function renderLiveProfile() {
    if (!loadedProfile) return;
    const p = loadedProfile;

    liveProfName.innerText = p.personal?.name || 'Candidate Profile';
    liveProfTitle.innerText = p.personal?.title || 'Senior Software Engineer';
    liveProfSummary.value = p.summary || '';
    liveProfLinkedin.value = p.personal?.linkedin || '';
    liveProfGithub.value = p.personal?.github || '';

    const expList = p.masterExperience || [];
    liveProfExperienceContainer.innerHTML = expList.map((exp, idx) => `
      <div style="background: var(--bg-app); border: 1px solid var(--border-light); border-radius: var(--radius-card); padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div>
            <strong style="font-size: 14px; color: var(--text-primary);">${exp.role}</strong> • <span style="font-weight: 600; color: var(--text-secondary);">${exp.company}</span>
            <div style="font-size: 11px; color: var(--text-muted);">${exp.startDate} - ${exp.endDate || 'Present'} • ${exp.location || 'Remote'}</div>
          </div>
        </div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 6px;">
          <textarea class="exp-bullet-editor code-editor" data-index="${idx}" rows="${Math.max(3, (exp.bullets || []).length * 2)}" style="font-family: inherit; font-size: 12px; line-height: 1.5;">${(exp.bullets || []).join('\n')}</textarea>
        </div>
      </div>
    `).join('');

    const skills = p.skills || {};
    const allSkills = [
      ...(skills.languages || []),
      ...(skills.frameworks || []),
      ...(skills.cloudAndDevops || []),
      ...(skills.databases || [])
    ];

    liveProfSkillsContainer.innerHTML = `
      <div class="keywords-row" style="margin-top: 4px;">
        ${allSkills.map(s => `<span class="kw-chip matched" style="font-size: 12px; padding: 4px 10px;">${s}</span>`).join('')}
      </div>
    `;
  }

  btnSaveLiveProfile.addEventListener('click', async () => {
    if (!loadedProfile) return;

    loadedProfile.summary = liveProfSummary.value;
    loadedProfile.personal.linkedin = liveProfLinkedin.value;
    loadedProfile.personal.github = liveProfGithub.value;

    document.querySelectorAll('.exp-bullet-editor').forEach(textarea => {
      const idx = parseInt(textarea.getAttribute('data-index'), 10);
      const lines = textarea.value.split('\n').map(l => l.trim()).filter(Boolean);
      if (loadedProfile.masterExperience[idx]) {
        loadedProfile.masterExperience[idx].bullets = lines;
      }
    });

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loadedProfile)
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Live Candidate Profile persistently saved!');
        renderLiveProfile();
      }
    } catch (e) {
      alert(`Save Error: ${e.message}`);
    }
  });

  btnReloadLiveProfile.addEventListener('click', async () => {
    await fetchProfileData();
    renderLiveProfile();
    alert('Refreshed profile data!');
  });

  // Generate Prompt Buttons
  document.querySelectorAll('.btn-gen-prompt').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const type = e.currentTarget.getAttribute('data-type');
      activePromptType = type;
      promptModalTitle.innerText = `🤖 Context-Rich Claude Prompt for ${type.toUpperCase()}`;

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
        promptResponseDisplay.value = typeof data.response === 'object' ? JSON.stringify(data.response, null, 2) : data.response;
        alert('Received response from Claude! Click "Apply Updates to My Live Profile" to persist.');
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

  // Apply Claude Output to Live Platform Profile
  btnApplyClaudeProfile.addEventListener('click', async () => {
    const rawOutput = promptResponseDisplay.value.trim();
    if (!rawOutput) {
      alert('Please paste Claude’s response or click "Send to Claude (CDP)" first.');
      return;
    }

    try {
      const res = await fetch('/api/profile/apply-claude-output', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawOutput, assetType: activePromptType })
      });
      const data = await res.json();
      if (data.success) {
        alert('🎉 Live Candidate Profile persistently updated on MindHunt platform!');
        loadedProfile = data.profile;
        renderCandidateSnapshot(loadedProfile);
        renderLiveProfile();
        promptModal.style.display = 'none';
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`Update Error: ${err.message}`);
    }
  });

  // Score All 3 Pillars
  btnScoreAll.addEventListener('click', async () => {
    autoSaveGitHub();
    autoSaveLinkedIn();

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

        scorecardResultsArea.style.display = 'block';
        scHeroScore.innerText = `${sc.overallScore}%`;
        scHeroGrade.innerText = `Grade ${sc.overallGrade}`;
        scOverallTitle.innerText = `Overall Readiness: ${sc.overallScore}/100 (Grade ${sc.overallGrade})`;
        scOverallSubtitle.innerText = sc.overallScore >= 85 ?
          'Your 3 assets (GitHub, LinkedIn, and Resume) are in the top tier for senior tech roles.' :
          'Good foundation with immediate actionable optimization opportunities across your 3 pillars.';

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

        // GitHub Pillar Breakdown
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

            <button class="btn-pill btn-copy-gh-readme" data-readme="${encodeURIComponent(gh.recommendedReadme || '')}" style="width: 100%; margin-top: 8px;">
              📋 Copy Profile README
            </button>
          `;
        } else {
          cardGhBreakdown.innerHTML = `<div style="font-size: 12px; color: var(--text-muted);">GitHub not scored or rate limited.</div>`;
        }

        // LinkedIn Pillar Breakdown
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

        // Resume Pillar Breakdown
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

            <button class="btn-primary" id="btn-goto-studio" style="width: 100%; margin-top: 8px; font-size: 11.5px; padding: 6px 12px;">
              📄 Open Resume Studio & PDF Viewer
            </button>
          `;
        }

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

        const btnGotoStudio = document.getElementById('btn-goto-studio');
        if (btnGotoStudio) {
          btnGotoStudio.addEventListener('click', () => {
            document.getElementById('nav-resume-studio-btn').click();
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
            ${job.pdfPath ? `<a href="/${job.pdfPath}" target="_blank" class="btn-secondary" style="text-decoration:none;">👁️ View PDF</a>` : ''}
            <button class="btn-secondary btn-dismiss-job" data-id="${job.id}">❌ Dismiss</button>
            <button class="btn-primary btn-apply-job" data-id="${job.id}">🚀 Approve & Apply</button>
          </div>
        </div>
      `;
    }).join('');

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

  // Initial Load
  loadStatus();
  loadQueue();
});
