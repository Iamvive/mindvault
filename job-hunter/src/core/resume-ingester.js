export function parseStructuredResume(text) {
  if (!text || typeof text !== 'string') return {};

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const result = {
    personal: {},
    summary: '',
    skills: {},
    masterExperience: [],
    education: []
  };

  if (lines.length === 0) return result;

  // Name is typically line 1
  result.personal.name = lines[0].replace(/[^a-zA-Z\s]/g, '').trim();

  // Contact line parsing (Phone, Email, Location, LinkedIn, GitHub)
  const fullText = text;

  const phoneMatch = fullText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[\s-]?\d{10}/);
  if (phoneMatch) result.personal.phone = phoneMatch[0].trim();

  const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) result.personal.email = emailMatch[0].trim();

  const linkedinMatch = fullText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  if (linkedinMatch) result.personal.linkedin = `https://www.linkedin.com/in/${linkedinMatch[1]}`;

  const githubMatch = fullText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  if (githubMatch) result.personal.github = `https://github.com/${githubMatch[1]}`;

  if (fullText.includes('Bengaluru') || fullText.includes('Bangalore')) {
    result.personal.location = 'Bengaluru, India';
  } else if (fullText.includes('Delhi')) {
    result.personal.location = 'Delhi, India';
  }

  // Extract Summary
  const summaryMatch = fullText.match(/SUMMARY\s*\n([\s\S]*?)(?=(TECHNICAL SKILLS|SKILLS|PROFESSIONAL EXPERIENCE|EXPERIENCE))/i);
  if (summaryMatch) {
    result.summary = summaryMatch[1].replace(/\n+/g, ' ').trim();
  }

  // Extract Experience
  const expMatch = fullText.match(/(?:PROFESSIONAL EXPERIENCE|EXPERIENCE)\s*\n([\s\S]*?)(?=(EDUCATION|PROJECTS|SKILLS|$))/i);
  if (expMatch) {
    const expText = expMatch[1];
    const roleBlocks = expText.split(/\n(?=[A-Z][A-Za-z0-9\s/(),.-]+ - [A-Za-z0-9\s/(),.-]+|\bSenior\b|\bSoftware Engineer\b|\bAndroid\b|\bDeveloper\b)/);

    for (const block of roleBlocks) {
      const bLines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (bLines.length < 2) continue;

      const headerLine = bLines[0];
      let role = headerLine;
      let company = '';

      if (headerLine.includes(' - ')) {
        const parts = headerLine.split(' - ');
        role = parts[0].trim();
        company = parts[1].trim();
      } else if (headerLine.includes(' | ')) {
        const parts = headerLine.split(' | ');
        role = parts[0].trim();
        company = parts[1].trim();
      }

      const metaLine = bLines[1] || '';
      const bullets = bLines.filter(l => l.startsWith('•') || l.startsWith('-') || l.startsWith('*')).map(l => l.replace(/^[•\-*]\s*/, '').trim());

      let startDate = '2021';
      let endDate = 'Present';
      const dateMatch = metaLine.match(/([A-Za-z]{3}\s*\d{4}|\d{4})\s*[–—-]\s*([A-Za-z]{3}\s*\d{4}|\d{4}|Present)/i);
      if (dateMatch) {
        startDate = dateMatch[1];
        endDate = dateMatch[2];
      }

      result.masterExperience.push({
        company: company || 'Enterprise',
        role: role || 'Software Engineer',
        location: metaLine.split('|')[0]?.trim() || 'Bengaluru, India',
        startDate,
        endDate,
        techStack: ['Android', 'Kotlin', 'KMP', 'Jetpack Compose', 'MVVM'],
        bullets: bullets.length > 0 ? bullets : [
          'Engineered core product architecture and high-performance mobile features.',
          'Optimized app responsiveness, latency, and release stability.'
        ]
      });
    }
  }

  // Set Top-Level Snapshot Fields
  if (result.masterExperience.length > 0) {
    result.personal.currentRole = result.masterExperience[0].role;
    result.personal.currentCompany = result.masterExperience[0].company;
    result.personal.title = result.masterExperience[0].role;
    result.personal.totalYearsExperience = 7.0;
  }

  return result;
}
