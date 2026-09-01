const ICONS = {
  zap: '<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  bot: '<svg viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 8V4"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/><path d="M2 14h2M20 14h2"/></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 1-15.3 6.4L3 16"/><path d="M3 12a9 9 0 0 1 15.3-6.4L21 8"/><path d="M3 16v4h4"/><path d="M21 8V4h-4"/></svg>',
  rocket: '<svg viewBox="0 0 24 24"><path d="M12 2c3 2 5 6 5 10 0 2-1 4-2 5l-3 3-3-3c-1-1-2-3-2-5 0-4 2-8 5-10Z"/><circle cx="12" cy="10" r="1.5"/><path d="M8 17c-2 1-3 3-3 5 2 0 4-1 5-3"/><path d="M16 17c2 1 3 3 3 5-2 0-4-1-5-3"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/></svg>',
  dollarSign: '<svg viewBox="0 0 24 24"><path d="M12 2v20"/><path d="M17 6.5c0-1.9-2.2-3.5-5-3.5s-5 1.4-5 3.5S9.2 10 12 10s5 1.6 5 3.5-2.2 3.5-5 3.5-5-1.6-5-3.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  mapPin: '<svg viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  sparkles: '<svg viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m6 6 2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"/></svg>',
  checkCircle: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 5-5"/></svg>',
  inbox: '<svg viewBox="0 0 24 24"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13l3 7v7a2 2 0 0 1-2 2H4.5a2 2 0 0 1-2-2v-7l3-7Z"/></svg>',
  fileText: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6"/><path d="M9 17h6"/></svg>',
  code: '<svg viewBox="0 0 24 24"><path d="m8 6-6 6 6 6"/><path d="m16 6 6 6-6 6"/></svg>',
  briefcase: '<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
};

function icon(name, extraClass) {
  return `<span class="icon${extraClass ? ' ' + extraClass : ''}">${ICONS[name] || ''}</span>`;
}

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
  const badgePillarGh = document.getElementById('badge-pillar-gh');
  const badgePillarLi = document.getElementById('badge-pillar-li');
  const badgePillarResume = document.getElementById('badge-pillar-resume');

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
      resumeFileName.innerText = `${file.name} (Extracting text...)`;
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
          resumeFileName.innerText = `${file.name} (Parsed & Active)`;
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
    resumeFileName.innerText = `${uploadedResumeName} (Saved & Active)`;
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
      } else if (targetTab === 'tab-cover-letter') {
        pageTitle.innerText = 'Master Cover Letter Studio & AI Improver';
        pageSubtitle.innerText = 'Upload, tailor, and use AI to craft human-sounding, metric-dense cover letters.';
        renderCoverLetterStudio();
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
      resumeFileName.innerText = `${uploadedResumeName} (Saved & Active)`;
      resumeFileInfo.style.display = 'block';
    }
  }

  fetchProfileData().then(prof => {
    if (prof) {
      btnScoreAll.click();
    }
  });

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
    snapshotModal.classList.remove('hidden');
    snapshotModal.style.display = 'flex';
  });

  btnCloseSnapshotModal.addEventListener('click', () => {
    snapshotModal.classList.add('hidden');
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
        snapshotModal.classList.add('hidden');
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

    btnSyncLinkedinSnapshot.textContent = 'Extracting from LinkedIn...';
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
      btnSyncLinkedinSnapshot.innerHTML = icon('zap') + ' Auto-Sync LinkedIn';
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
      <div style="background: var(--bg-app); border: 1px solid var(--border); border-radius: var(--radius-control); padding: 12px;">
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
        alert('Master Resume edits saved!');
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

  // --- COVER LETTER STUDIO CONTROLLERS ---
  const clUploadZone = document.getElementById('cover-letter-upload-zone');
  const clFileInput = document.getElementById('cover-letter-file-input');
  const clDropCta = document.getElementById('cl-drop-cta');
  const clFileInfo = document.getElementById('cl-file-info');
  const clFileName = document.getElementById('cl-file-name');
  const clTargetCompany = document.getElementById('cl-target-company');
  const clTargetRole = document.getElementById('cl-target-role');
  const clBodyEditor = document.getElementById('cl-body-editor');
  const clPreviewIframe = document.getElementById('cl-preview-iframe');
  const btnRefreshClPreview = document.getElementById('btn-refresh-cl-preview');
  const btnSaveCoverLetter = document.getElementById('btn-save-cover-letter');
  const btnCopyCoverLetter = document.getElementById('btn-copy-cover-letter');
  const btnAiImproveCl = document.getElementById('btn-ai-improve-cl');
  const btnDownloadCoverLetter = document.getElementById('btn-download-cover-letter');

  function renderCoverLetterStudio() {
    if (!loadedProfile) return;
    const p = loadedProfile;

    if (clBodyEditor && (!clBodyEditor.value || clBodyEditor.value.trim() === '')) {
      clBodyEditor.value = p.masterCoverLetter || `Dear Hiring Team,\n\nI am writing to express my strong interest in the ${clTargetRole.value || p.personal?.title || 'Senior Android Engineer'} position at ${clTargetCompany.value || 'your team'}. With over 7 years of engineering scalable, high-performance mobile applications, I specialize in Kotlin Multiplatform (KMP), clean architecture, and modular SDK integrations.\n\nCurrently at Porter, I engineered an in-house events SDK using KMP, matching Mixpanel performance while cutting infrastructure costs. I also integrated the Truecaller SDK to achieve 99.8% faster login speeds (slashing authentication time from 10s to 0.017s) and boosted signup conversion by 57%. Furthermore, by refactoring monolithic endpoints into microservices and optimizing device stability, my team reduced daily ANR incidents by 92%.\n\nI would welcome the opportunity to discuss how my technical expertise in Kotlin, KMP, modular SDK design, and mobile performance optimization can accelerate your mobile engineering goals.\n\nThank you for your time and consideration.\n\nSincerely,\n${p.personal?.name || 'Vivek Kumar'}`;
    }

    if (p.uploadedCoverLetterFileName && clFileName) {
      clDropCta.style.display = 'none';
      clFileName.innerText = `${p.uploadedCoverLetterFileName} (Active)`;
      clFileInfo.style.display = 'block';
    }

    updateCoverLetterPreview();
  }

  function updateCoverLetterPreview() {
    const comp = encodeURIComponent(clTargetCompany?.value || '');
    const role = encodeURIComponent(clTargetRole?.value || '');
    if (clPreviewIframe) {
      clPreviewIframe.src = `/api/cover-letter/preview-html?company=${comp}&role=${role}&t=${Date.now()}`;
    }
    if (btnDownloadCoverLetter) {
      btnDownloadCoverLetter.href = `/api/cover-letter/download-pdf?company=${comp}&role=${role}&t=${Date.now()}`;
    }
  }

  if (clUploadZone) {
    clUploadZone.addEventListener('click', () => clFileInput.click());
    clUploadZone.addEventListener('dragover', (e) => e.preventDefault());
    clUploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) handleCoverLetterUpload(e.dataTransfer.files[0]);
    });
  }

  if (clFileInput) {
    clFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) handleCoverLetterUpload(e.target.files[0]);
    });
  }

  function handleCoverLetterUpload(file) {
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const dataUrl = evt.target.result;
      clDropCta.style.display = 'none';
      clFileName.innerText = `${file.name} (Parsing text...)`;
      clFileInfo.style.display = 'block';

      try {
        const res = await fetch('/api/cover-letter/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, base64Data: dataUrl })
        });
        const data = await res.json();
        if (data.success) {
          loadedProfile = data.profile;
          clFileName.innerText = `${file.name} (Parsed & Active)`;
          clBodyEditor.value = data.coverLetterText || clBodyEditor.value;
          updateCoverLetterPreview();
        }
      } catch (err) {
        console.warn('Cover letter upload error:', err);
      }
    };
    reader.readAsDataURL(file);
  }

  if (clTargetCompany) clTargetCompany.addEventListener('input', updateCoverLetterPreview);
  if (clTargetRole) clTargetRole.addEventListener('input', updateCoverLetterPreview);
  if (btnRefreshClPreview) btnRefreshClPreview.addEventListener('click', updateCoverLetterPreview);

  if (btnSaveCoverLetter) {
    btnSaveCoverLetter.addEventListener('click', async () => {
      if (!loadedProfile) return;
      loadedProfile.masterCoverLetter = clBodyEditor.value;

      try {
        const res = await fetch('/api/profile/save-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assetType: 'cover-letter',
            data: { coverLetterText: clBodyEditor.value }
          })
        });
        const data = await res.json();
        if (data.success) {
          alert('Cover Letter saved persistently!');
          updateCoverLetterPreview();
        }
      } catch (e) {
        alert(`Save error: ${e.message}`);
      }
    });
  }

  if (btnCopyCoverLetter) {
    btnCopyCoverLetter.addEventListener('click', () => {
      navigator.clipboard.writeText(clBodyEditor.value);
      alert('Cover Letter copied to clipboard!');
    });
  }

  // Blob Download Handlers for 100% Reliable PDF Downloading
  const btnDownloadResume = document.getElementById('btn-download-ats-pdf');
  if (btnDownloadResume) {
    btnDownloadResume.addEventListener('click', async (e) => {
      e.preventDefault();
      const originalHTML = btnDownloadResume.innerHTML;
      btnDownloadResume.innerHTML = 'Compiling PDF...';
      try {
        const res = await fetch('/api/resume/download-pdf');
        if (!res.ok) throw new Error('PDF generation failed');
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Master_Resume_${(loadedProfile?.personal?.name || 'Vivek_Kumar').replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } catch (err) {
        window.location.href = '/api/resume/download-pdf';
      } finally {
        btnDownloadResume.innerHTML = originalHTML;
      }
    });
  }

  if (btnDownloadCoverLetter) {
    btnDownloadCoverLetter.addEventListener('click', async (e) => {
      e.preventDefault();
      const originalHTML = btnDownloadCoverLetter.innerHTML;
      btnDownloadCoverLetter.innerHTML = 'Compiling PDF...';
      try {
        const comp = encodeURIComponent(clTargetCompany?.value || '');
        const role = encodeURIComponent(clTargetRole?.value || '');
        const res = await fetch(`/api/cover-letter/download-pdf?company=${comp}&role=${role}`);
        if (!res.ok) throw new Error('Cover letter PDF failed');
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Cover_Letter_${(loadedProfile?.personal?.name || 'Vivek_Kumar').replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } catch (err) {
        window.location.href = '/api/cover-letter/download-pdf';
      } finally {
        btnDownloadCoverLetter.innerHTML = originalHTML;
      }
    });
  }

  if (btnAiImproveCl) {
    btnAiImproveCl.addEventListener('click', async () => {
      activePromptType = 'cover-letter';
      promptModalTitle.innerHTML = icon('bot') + ' Context-Rich Claude Prompt for Cover Letter';

      const payload = {
        masterCoverLetter: clBodyEditor.value,
        targetCompany: clTargetCompany.value || 'Target Tech Scale-up / Enterprise',
        targetRole: clTargetRole.value || 'Senior Android Engineer'
      };

      try {
        const res = await fetch('/api/prompts/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'cover-letter', payload })
        });
        const data = await res.json();
        promptTextDisplay.value = data.prompt;
        promptResponseDisplay.value = '';
        promptModal.style.display = 'flex';
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    });
  }

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
      <div style="background: var(--bg-app); border: 1px solid var(--border); border-radius: var(--radius-card); padding: 16px;">
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
        alert('Live Candidate Profile persistently saved!');
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
      promptModalTitle.innerHTML = icon('bot') + ` Context-Rich Claude Prompt for ${type.toUpperCase()}`;

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
      btnSendPromptCdp.innerHTML = icon('zap') + ' Send to Claude (CDP)';
      btnSendPromptCdp.disabled = false;
    }
  });

    if (btnApplyClaudeProfile) {
      btnApplyClaudeProfile.addEventListener('click', async () => {
        const text = promptResponseDisplay.value.trim();
        if (!text) {
          alert('Please paste Claude response or fetch via CDP first.');
          return;
        }

        try {
          const res = await fetch('/api/profile/apply-claude-output', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rawOutput: text, assetType: activePromptType })
          });
          const data = await res.json();
          if (data.success) {
            loadedProfile = data.profile;
            renderCandidateSnapshot(loadedProfile);
            prefillAssets(loadedProfile);
            renderLiveProfile();
            promptModal.classList.add('hidden');
            promptModal.style.display = 'none';
            alert('Live Candidate Profile successfully updated and persisted to disk!');
            btnScoreAll.click();
          } else {
            alert(`Update Error: ${data.error}`);
          }
        } catch (e) {
          alert(`Network error applying Claude update: ${e.message}`);
        }
      });
    }

  // Score All 3 Pillars
  btnScoreAll.addEventListener('click', async () => {
    autoSaveGitHub();
    autoSaveLinkedIn();

    btnScoreAll.textContent = 'Auditing 3 Pillars with AI...';
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

        scorecardResultsArea.classList.remove('hidden');
        scorecardResultsArea.style.display = 'block';
        scHeroScore.innerText = `${sc.overallScore}%`;
        scHeroGrade.innerText = `Grade ${sc.overallGrade}`;
        scOverallTitle.innerText = `Overall Readiness: ${sc.overallScore}/100 (Grade ${sc.overallGrade})`;
        scOverallSubtitle.innerText = sc.overallScore >= 85 ?
          'Your 3 assets (GitHub, LinkedIn, and Resume) are in the top tier for senior tech roles.' :
          'Good foundation with immediate actionable optimization opportunities across your 3 pillars.';

        if (sc.crossAssetInsights && sc.crossAssetInsights.length > 0) {
          scCrossInsights.innerHTML = `
            <strong class="text-sm font-semibold flex items-center gap-6">${icon('refresh', 'icon-sm')} Cross-Asset Alignment Gaps:</strong>
            <ul style="margin-left: 18px; font-size: 12px; color: var(--text-secondary); margin-top: 6px;">
              ${sc.crossAssetInsights.map(item => `<li>${item}</li>`).join('')}
            </ul>
          `;
        } else {
          scCrossInsights.innerHTML = `
            <div class="text-sm text-success flex items-center gap-6">
              ${icon('checkCircle', 'icon-sm')} <strong>High Consistency:</strong> Your GitHub projects, LinkedIn skills, and Resume experience are mutually aligned.
            </div>
          `;
        }

        // GitHub Pillar Breakdown
        const gh = sc.pillars.github;
        if (badgePillarGh && gh) {
          badgePillarGh.innerText = `${gh.score || 0}/100`;
          badgePillarGh.className = `status-badge ${gh.score >= 80 ? 'status-applied' : (gh.score >= 60 ? 'status-manual_review' : 'status-queued')} font-bold text-xs`;
        }
        if (gh && !gh.error) {
          cardGhBreakdown.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4 class="text-heading-sm flex items-center gap-6">${icon('code', 'icon-sm')} 1. GitHub Score</h4>
              <div class="ats-score-chip" style="padding: 4px 10px;">
                <span class="ats-val" style="font-size: 14px;">${gh.score}/100</span>
              </div>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">Grade ${gh.grade} • ${gh.publicRepos || 0} Public Repos</div>

            <div style="margin-bottom: 10px;">
              <strong class="text-xs text-success">Strengths:</strong>
              <ul style="margin-left: 16px; font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">
                ${(gh.strengths || []).slice(0, 2).map(s => `<li>${s}</li>`).join('')}
              </ul>
            </div>

            <button class="btn-pill btn-copy-gh-readme w-full mt-8" data-readme="${encodeURIComponent(gh.recommendedReadme || '')}">
              ${icon('copy', 'icon-sm')} Copy Profile README
            </button>
          `;
        } else {
          cardGhBreakdown.innerHTML = `<div style="font-size: 12px; color: var(--text-muted);">GitHub not scored or rate limited.</div>`;
        }

        // LinkedIn Pillar Breakdown
        const li = sc.pillars.linkedin;
        if (badgePillarLi && li) {
          badgePillarLi.innerText = `${li.score || 0}/100`;
          badgePillarLi.className = `status-badge ${li.score >= 80 ? 'status-applied' : (li.score >= 60 ? 'status-manual_review' : 'status-queued')} font-bold text-xs`;
        }
        if (li) {
          cardLiBreakdown.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4 class="text-heading-sm flex items-center gap-6">${icon('briefcase', 'icon-sm')} 2. LinkedIn Score</h4>
              <div class="ats-score-chip" style="padding: 4px 10px;">
                <span class="ats-val" style="font-size: 14px;">${li.score}/100</span>
              </div>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">Grade ${li.grade} • Recruiter SEO Index</div>

            <div style="margin-bottom: 10px;">
              <strong class="text-xs text-success">Strengths:</strong>
              <ul style="margin-left: 16px; font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">
                ${(li.strengths || []).slice(0, 2).map(s => `<li>${s}</li>`).join('')}
              </ul>
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
              <button class="btn-primary btn-apply-li-head" data-head="${encodeURIComponent(li.generatedHeadlines?.[0] || '')}" style="font-size: 11.5px; padding: 6px 12px;">
                ${icon('sparkles', 'icon-sm')} Apply Magnetic Headline
              </button>
              <button class="btn-secondary btn-apply-li-about" data-about="${encodeURIComponent(li.generatedAbout || '')}" style="font-size: 11.5px; padding: 6px 12px;">
                ${icon('sparkles', 'icon-sm')} Adopt High-Impact About Story
              </button>
            </div>
          `;
        }

        // Resume Pillar Breakdown
        const resPillar = sc.pillars.resume;
        if (badgePillarResume && resPillar) {
          badgePillarResume.innerText = `${resPillar.score || 0}/100`;
          badgePillarResume.className = `status-badge ${resPillar.score >= 80 ? 'status-applied' : (resPillar.score >= 60 ? 'status-manual_review' : 'status-queued')} font-bold text-xs`;
        }
        if (resPillar) {
          cardResumeBreakdown.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4 class="text-heading-sm flex items-center gap-6">${icon('fileText', 'icon-sm')} 3. Resume ATS Score</h4>
              <div class="ats-score-chip" style="padding: 4px 10px;">
                <span class="ats-val" style="font-size: 14px;">${resPillar.score}/100</span>
              </div>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">Grade ${resPillar.grade} • ${resPillar.metricsCount || 0} Metrics Found</div>

            <div style="margin-bottom: 10px;">
              <strong class="text-xs text-success">Strengths:</strong>
              <ul style="margin-left: 16px; font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">
                ${(resPillar.strengths || []).slice(0, 2).map(s => `<li>${s}</li>`).join('')}
              </ul>
            </div>

            <button class="btn-primary w-full mt-8" id="btn-goto-studio" style="font-size: 11.5px; padding: 6px 12px;">
              ${icon('fileText', 'icon-sm')} Open Resume Studio & PDF Viewer
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
      btnScoreAll.innerHTML = icon('zap') + ' Score My 3-Pillar Profile';
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
        <div class="job-card text-center" style="padding: 48px 20px;">
          <div class="icon icon-lg text-muted mb-8" style="justify-content: center;">${ICONS.inbox}</div>
          <h3 style="font-weight: 600; font-size: 15px;">Queue is Clean</h3>
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
              <span class="job-meta-platform">Platform: ${job.platform}</span>
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
            ${job.pdfPath ? `<a href="/${job.pdfPath}" target="_blank" class="btn-secondary no-underline">${icon('eye', 'icon-sm')} View PDF</a>` : ''}
            <button class="btn-secondary btn-dismiss-job" data-id="${job.id}">${icon('x', 'icon-sm')} Dismiss</button>
            <button class="btn-primary btn-apply-job" data-id="${job.id}">${icon('rocket', 'icon-sm')} Approve & Apply</button>
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
    btnBatchApply.textContent = 'Applying all...';
    btnBatchApply.disabled = true;
    await fetch('/api/jobs/batch-approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobIds: ids })
    });
    btnBatchApply.innerHTML = icon('rocket', 'icon-sm') + ' <span>Batch Apply All</span>';
    btnBatchApply.disabled = false;
    loadQueue();
  });

  // --- Instant JD Tailor & URL Fetcher ---
  const tailorUrlInput = document.getElementById('tailor-url-input');
  const btnTailorFetchUrl = document.getElementById('btn-tailor-fetch-url');
  const tailorFetchIcon = document.getElementById('tailor-fetch-icon');
  const tailorFetchText = document.getElementById('tailor-fetch-text');
  const tailorTitle = document.getElementById('tailor-title');
  const tailorCompany = document.getElementById('tailor-company');
  const tailorLocation = document.getElementById('tailor-location');
  const tailorPlatform = document.getElementById('tailor-platform');
  const tailorJd = document.getElementById('tailor-jd');
  const tailorJdLength = document.getElementById('tailor-jd-length');
  const tailorInsightsBar = document.getElementById('tailor-insights-bar');
  const tailorInsightsChips = document.getElementById('tailor-insights-chips');
  const btnClearTailorForm = document.getElementById('btn-clear-tailor-form');

  function updateJdWordCount() {
    if (!tailorJd || !tailorJdLength) return;
    const words = tailorJd.value.trim().split(/\s+/).filter(Boolean).length;
    tailorJdLength.innerText = `${words} words`;
  }

  if (tailorJd) {
    tailorJd.addEventListener('input', updateJdWordCount);
  }

  if (btnClearTailorForm) {
    btnClearTailorForm.addEventListener('click', () => {
      tailorForm.reset();
      if (tailorUrlInput) tailorUrlInput.value = '';
      if (tailorInsightsBar) tailorInsightsBar.style.display = 'none';
      updateJdWordCount();
    });
  }

  async function fetchJobDetailsFromUrl() {
    const url = tailorUrlInput ? tailorUrlInput.value.trim() : '';
    if (!url) {
      alert('Please paste a job opening link (e.g. LinkedIn, Naukri, Instahyre, Greenhouse, Lever, Ashby, or company career URL).');
      if (tailorUrlInput) tailorUrlInput.focus();
      return;
    }

    if (btnTailorFetchUrl) {
      btnTailorFetchUrl.disabled = true;
      if (tailorFetchIcon) tailorFetchIcon.innerHTML = ICONS.clock;
      if (tailorFetchText) tailorFetchText.innerText = 'Fetching via Chrome...';
    }

    try {
      const res = await fetch('/api/jobs/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();

      if (data.success && data.data) {
        const item = data.data;
        if (tailorTitle && item.title) {
          tailorTitle.value = item.title;
          tailorTitle.classList.add('field-highlight');
          setTimeout(() => tailorTitle.classList.remove('field-highlight'), 1500);
        }
        if (tailorCompany && item.company) {
          tailorCompany.value = item.company;
          tailorCompany.classList.add('field-highlight');
          setTimeout(() => tailorCompany.classList.remove('field-highlight'), 1500);
        }
        if (tailorLocation && item.location) {
          tailorLocation.value = item.location;
          tailorLocation.classList.add('field-highlight');
          setTimeout(() => tailorLocation.classList.remove('field-highlight'), 1500);
        }
        if (tailorPlatform && item.platform) {
          const opt = tailorPlatform.querySelector(`option[value="${item.platform}"]`);
          if (opt) tailorPlatform.value = item.platform;
          else tailorPlatform.value = 'custom';
        }
        if (tailorJd && item.jdText) {
          tailorJd.value = item.jdText;
          tailorJd.classList.add('field-highlight');
          setTimeout(() => tailorJd.classList.remove('field-highlight'), 1500);
          updateJdWordCount();
        }

        // Render Insight Badges
        if (tailorInsightsBar && tailorInsightsChips) {
          const chips = [];
          if (item.platform) chips.push(`<span class="insight-badge">🌐 ${item.platform.toUpperCase()}</span>`);
          if (item.location) chips.push(`<span class="insight-badge">📍 ${item.location}</span>`);
          if (item.experience) chips.push(`<span class="insight-badge">⏳ ${item.experience}</span>`);
          if (item.salary) chips.push(`<span class="insight-badge">💰 ${item.salary}</span>`);

          if (chips.length > 0) {
            tailorInsightsChips.innerHTML = `
              <strong style="color: var(--accent); font-size: 11px;">Extracted Insights:</strong>
              ${chips.join('')}
            `;
            tailorInsightsBar.classList.remove('hidden');
            tailorInsightsBar.style.display = 'block';
          }
        }
      } else {
        alert(`Extraction Notice: ${data.error || 'Could not auto-extract all details.'} You can manually fill or paste the description below.`);
      }
    } catch (err) {
      alert(`Network Error: ${err.message}. Please check connection.`);
    } finally {
      if (btnTailorFetchUrl) {
        btnTailorFetchUrl.disabled = false;
        if (tailorFetchIcon) tailorFetchIcon.innerHTML = ICONS.zap;
        if (tailorFetchText) tailorFetchText.innerText = 'Auto-Fetch Details';
      }
    }
  }

  if (btnTailorFetchUrl) {
    btnTailorFetchUrl.addEventListener('click', fetchJobDetailsFromUrl);
  }

  if (tailorUrlInput) {
    tailorUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        fetchJobDetailsFromUrl();
      }
    });
  }

  tailorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-tailor-submit');
    btn.textContent = 'Tailoring with AI...';
    btn.disabled = true;

    const payload = {
      title: document.getElementById('tailor-title').value,
      company: document.getElementById('tailor-company').value,
      location: document.getElementById('tailor-location')?.value || 'Remote',
      url: document.getElementById('tailor-url-input')?.value || '',
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
        if (tailorUrlInput) tailorUrlInput.value = '';
        if (tailorInsightsBar) tailorInsightsBar.style.display = 'none';
        alert(`Successfully generated tailored resume for ${payload.company}! Added to Approval Queue with ATS score: ${data.job.atsScore}%.`);
        document.getElementById('nav-queue-btn').click();
      } else {
        alert(`Error: ${data.error || 'Failed to tailor job'}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      btn.innerHTML = icon('sparkles', 'icon-sm') + ' <span>Tailor Resume & Queue Job</span>';
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
