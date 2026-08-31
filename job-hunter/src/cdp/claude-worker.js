export function formatTailorPrompt(jdText, masterProfile) {
  return `
You are an expert Executive Resume Writer and ATS Optimization Specialist.
Your task is to tailor the candidate's resume for the Job Description below.

CRITICAL INSTRUCTIONS:
1. ONLY use factual experience, achievements, and metrics from the candidate's Master Profile. NEVER invent or hallucinate past roles or false claims.
2. Select and re-order the strongest 3-4 bullet points per role that best demonstrate mastery of the required JD skills.
3. Compute an honest ATS Match Score (0-100) based on tech stack alignment.
4. Output STRICT, VALID JSON ONLY. Do not wrap in markdown or commentary, or wrap in \`\`\`json block.

---
JOB DESCRIPTION:
${jdText}

---
CANDIDATE MASTER PROFILE:
${JSON.stringify(masterProfile, null, 2)}

---
OUTPUT JSON SCHEMA:
{
  "atsScore": 92,
  "matchingKeywords": ["Go", "Kafka", "PostgreSQL", "Distributed Systems"],
  "missingKeywords": ["GraphQL"],
  "tailoredSummary": "2-3 line punchy summary targeting this specific role using JD vocabulary",
  "experience": [
    {
      "company": "Company Name",
      "role": "Role Title",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM / Present",
      "bullets": [
        "Tailored high-impact bullet starting with strong action verb and metric"
      ]
    }
  ],
  "skills": {
    "languages": ["..."],
    "frameworks": ["..."],
    "cloudAndDevops": ["..."],
    "databases": ["..."],
    "architecture": ["..."]
  },
  "screeningAnswers": {
    "notice_period": "30 days",
    "relevant_experience_years": "6",
    "why_interested": "1-sentence tailored explanation"
  }
}
`.trim();
}

export function parseClaudeResponse(rawText) {
  if (!rawText) throw new Error('Empty response from Claude');

  // Try direct parse first
  try {
    return JSON.parse(rawText.trim());
  } catch (e) {
    // Extract from ```json ``` or ``` ``` block
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1].trim());
    }

    // Try finding outer curly braces
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = rawText.substring(firstBrace, lastBrace + 1);
      return JSON.parse(candidate);
    }

    throw new Error(`Failed to parse structured JSON from Claude response: ${rawText.slice(0, 200)}...`);
  }
}

export async function promptClaudeSession(claudePage, promptText, timeoutMs = 60000) {
  // Check if page is on Claude
  if (!claudePage.url().includes('claude.ai')) {
    await claudePage.goto('https://claude.ai/new', { waitUntil: 'domcontentloaded' });
  }

  // Find input area (Claude uses contenteditable div or textarea)
  const inputSelector = 'div[contenteditable="true"], textarea[placeholder*="How can Claude help"]';
  await claudePage.waitForSelector(inputSelector, { timeout: 15000 });

  // Focus and insert prompt text
  await claudePage.focus(inputSelector);
  await claudePage.fill(inputSelector, promptText);
  await claudePage.keyboard.press('Enter');

  // Wait for the stop generating button to disappear or response to settle
  // Claude typically has a stop response button or shows streaming state
  await claudePage.waitForTimeout(3000);

  // Poll for assistant message completion
  const startTime = Date.now();
  let lastText = '';
  let stableCount = 0;

  while (Date.now() - startTime < timeoutMs) {
    // Select the last assistant message
    const messages = await claudePage.$$eval('.font-claude-message, [data-testid="assistant-message"]', (nodes) =>
      nodes.map(n => n.innerText)
    );

    const currentText = messages.length > 0 ? messages[messages.length - 1] : '';

    if (currentText && currentText === lastText) {
      stableCount++;
      if (stableCount >= 3) {
        // Text has stabilized for ~3 seconds
        return currentText;
      }
    } else {
      stableCount = 0;
      lastText = currentText;
    }

    await claudePage.waitForTimeout(1000);
  }

  return lastText;
}

export async function tailorResumeWithClaude(claudePage, jdText, masterProfile) {
  const prompt = formatTailorPrompt(jdText, masterProfile);
  const rawResponse = await promptClaudeSession(claudePage, prompt);
  const parsed = parseClaudeResponse(rawResponse);
  return {
    ...masterProfile,
    ...parsed,
    personal: masterProfile.personal,
    education: masterProfile.education,
    projects: masterProfile.projects
  };
}
