import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY is not defined in the environment.');
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Enriches metadata using the Gemini 2.5 Flash model
 * @param {string} url - The resource URL
 * @param {object} scrapedMetadata - Scraping results (title, description, platform, isBlocked)
 * @param {string} userNotes - Optional user notes/context
 * @returns {Promise<object>} - Enriched metadata JSON
 */
export async function enrichResourceMetadata(url, scrapedMetadata = {}, userNotes = '') {
  if (!apiKey) {
    // Fallback if no API key is available
    return {
      title: scrapedMetadata.title || 'Untitled Resource',
      summary: scrapedMetadata.description || 'No summary available.',
      category: 'Other',
      tags: scrapedMetadata.platform ? [scrapedMetadata.platform.toLowerCase()] : [],
      platform: scrapedMetadata.platform || 'Web',
      interest_score: 5,
      usefulness_score: 5
    };
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });

  const systemInstruction = `You are a MindVault Resource Classifier. Analyze a web link and its metadata to produce a structured JSON object representing its organization.
If the metadata is sparse or blocked (e.g. for Instagram/X/TikTok), use the URL and user notes to infer the details.
Analyze the following inputs:
- URL: ${url}
- Platform (Scraped): ${scrapedMetadata.platform || 'Unknown'}
- Title (Scraped): ${scrapedMetadata.title || ''}
- Description (Scraped): ${scrapedMetadata.description || ''}
- User Notes: ${userNotes || '(None)'}

You must return a JSON object matching this schema:
{
  "title": "Clean, concise, and reader-friendly title. Strip redundant brand suffixes like '| YouTube' or '- Medium'.",
  "summary": "Concise 1-2 sentence summary of what this resource is and why it might be useful.",
  "category": "Choose exactly one of: 'Tech & Coding', 'Design & Creative', 'Productivity & Life Hacks', 'Business & Finance', 'Health & Fitness', 'Entertainment', 'News & Articles', 'Other'.",
  "tags": ["3 to 5 lowercase keyword tags, e.g. 'ai', 'css', 'react', 'cooking', 'personal-finance'"],
  "platform": "The platform name, e.g., 'YouTube', 'Instagram', 'GitHub', 'Medium', 'Reddit', 'X / Twitter', or 'Web'.",
  "interest_score": 5, // Integer between 1 and 10. Rate how interesting/engaging the resource is.
  "usefulness_score": 5 // Integer between 1 and 10. Rate how practical, actionable, or educational it is.
}`;

  try {
    const result = await model.generateContent(systemInstruction);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    
    return {
      title: parsed.title || scrapedMetadata.title || 'Untitled Resource',
      summary: parsed.summary || scrapedMetadata.description || '',
      category: parsed.category || 'Other',
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      platform: parsed.platform || scrapedMetadata.platform || 'Web',
      interest_score: Number.isInteger(parsed.interest_score) ? Math.max(1, Math.min(10, parsed.interest_score)) : 5,
      usefulness_score: Number.isInteger(parsed.usefulness_score) ? Math.max(1, Math.min(10, parsed.usefulness_score)) : 5
    };
  } catch (error) {
    console.error('Gemini metadata enrichment failed:', error);
    
    // Fail-safe fallback matching database structure
    return {
      title: scrapedMetadata.title || 'Untitled Resource',
      summary: scrapedMetadata.description || 'Failed to auto-generate summary.',
      category: 'Other',
      tags: scrapedMetadata.platform ? [scrapedMetadata.platform.toLowerCase()] : [],
      platform: scrapedMetadata.platform || 'Web',
      interest_score: 5,
      usefulness_score: 5
    };
  }
}

/**
 * Enriches metadata for a document/file using the Gemini 2.5 Flash model
 * @param {string} filename - The name of the document
 * @param {string} markdownContent - The parsed markdown content of the document
 * @param {string} userNotes - Optional user notes/context
 * @returns {Promise<object>} - Enriched metadata JSON
 */
export async function enrichDocumentMetadata(filename, markdownContent, userNotes = '') {
  if (!apiKey) {
    return {
      title: filename || 'Untitled Document',
      summary: markdownContent ? markdownContent.slice(0, 150) + '...' : 'No summary available.',
      category: 'Other',
      tags: ['document'],
      platform: 'Document',
      interest_score: 5,
      usefulness_score: 5
    };
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });

  // Limit content length to prevent token overflow (e.g. 50k characters is plenty)
  const safeContent = markdownContent ? markdownContent.slice(0, 50000) : '';

  const systemInstruction = `You are a MindVault Resource Classifier. Analyze the contents of an ingested document (in Markdown format) to produce a structured JSON object representing its organization.
Analyze the following inputs:
- Filename: ${filename}
- Document Content (Markdown):
"""
${safeContent}
"""
- User Notes: ${userNotes || '(None)'}

You must return a JSON object matching this schema:
{
  "title": "Clean, concise, and reader-friendly title. Use the content to determine a relevant document title if the filename is generic.",
  "summary": "Concise 1-2 sentence summary of what this document is about and why it might be useful.",
  "category": "Choose exactly one of: 'Tech & Coding', 'Design & Creative', 'Productivity & Life Hacks', 'Business & Finance', 'Health & Fitness', 'Entertainment', 'News & Articles', 'Other'.",
  "tags": ["3 to 5 lowercase keyword tags related to the document's content, e.g., 'report', 'financials', 'specification', 'cheatsheet'"],
  "platform": "For documents, categorize as 'Document', or if it is a local file type specify like 'PDF Document', 'Spreadsheet', 'Presentation', 'Audio Transcript', 'Image Scan', etc.",
  "interest_score": 5, // Integer between 1 and 10. Rate how interesting/engaging the document is.
  "usefulness_score": 5 // Integer between 1 and 10. Rate how practical, actionable, or educational it is.
}`;

  try {
    const result = await model.generateContent(systemInstruction);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    
    return {
      title: parsed.title || filename || 'Untitled Document',
      summary: parsed.summary || '',
      category: parsed.category || 'Other',
      tags: Array.isArray(parsed.tags) ? parsed.tags : ['document'],
      platform: parsed.platform || 'Document',
      interest_score: Number.isInteger(parsed.interest_score) ? Math.max(1, Math.min(10, parsed.interest_score)) : 5,
      usefulness_score: Number.isInteger(parsed.usefulness_score) ? Math.max(1, Math.min(10, parsed.usefulness_score)) : 5
    };
  } catch (error) {
    console.error('Gemini document metadata enrichment failed:', error);
    
    return {
      title: filename || 'Untitled Document',
      summary: safeContent ? safeContent.slice(0, 150) + '...' : 'Failed to auto-generate summary.',
      category: 'Other',
      tags: ['document'],
      platform: 'Document',
      interest_score: 5,
      usefulness_score: 5
    };
  }
}

/**
 * Enriches metadata for a GitHub repository using Gemini 2.5 Flash
 * @param {string} url - GitHub URL
 * @param {object} scrapedData - Data from githubScraper
 * @param {string} userNotes - User context
 * @returns {Promise<object>} Enriched JSON
 */
export async function enrichGitHubRepoMetadata(url, scrapedData = {}, userNotes = '') {
  if (!apiKey) {
    return {
      title: scrapedData.title || 'GitHub Repository',
      summary: scrapedData.description || 'No summary available.',
      category: 'Tech & Coding',
      tags: ['github', scrapedData.primary_language ? scrapedData.primary_language.toLowerCase() : 'coding'],
      platform: 'GitHub',
      interest_score: 8,
      usefulness_score: 8,
      use_cases: [
        'Explore codebase for project inspiration',
        'Test local execution via setup commands',
        'Extract reusable utilities & patterns'
      ],
      quickstart_playbook: {
        prerequisites: 'Node.js / Git',
        commands: [`git clone ${url}`, 'cd ' + (scrapedData.repo || 'repo'), 'npm install'],
        one_liner: `git clone ${url}`
      },
      tech_stack_summary: `Primary language: ${scrapedData.primary_language || 'Software'}`
    };
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });

  const prompt = `You are a Senior Software Architect inspecting a GitHub repository for a developer's personal vault (MindVault).
Analyze the repository details and README snippet to produce structured use-cases and setup playbooks.

User's Existing Tech Stack Context: Node.js, Express, SQLite, React, Telegram Bot, AI Agents, Python.

Repository Data:
- URL: ${url}
- Name: ${scrapedData.owner}/${scrapedData.repo}
- Primary Language: ${scrapedData.primary_language}
- Stars: ${scrapedData.stars} | Forks: ${scrapedData.forks}
- Description: ${scrapedData.description}
- User Notes: ${userNotes || '(None)'}
- README Snippet:
${scrapedData.readme}

Return a JSON object matching this EXACT schema:
{
  "title": "${scrapedData.owner}/${scrapedData.repo}: Clean repository name & tagline",
  "summary": "1-2 sentence core value proposition of what this repository does",
  "category": "Tech & Coding",
  "tags": ["github", "language-name", "topic-1", "topic-2"],
  "platform": "GitHub",
  "interest_score": 8, // Integer 1-10
  "usefulness_score": 8, // Integer 1-10
  "use_cases": [
    "Use-Case 1: Specific integration idea for the user's projects (MindVault, Telegram bot, React, AI tools)",
    "Use-Case 2: Practical local developer workflow or testing application",
    "Use-Case 3: Architectural pattern, design decision, or code snippet worth saving"
  ],
  "quickstart_playbook": {
    "prerequisites": "Prerequisites list (e.g. Node 18+, Docker, Python 3.10)",
    "commands": [
      "git clone ${url}",
      "cd ${scrapedData.repo}",
      "npm install"
    ],
    "one_liner": "docker run command or one-liner if applicable, else git clone command"
  },
  "tech_stack_summary": "1-2 sentence overview of core dependencies and framework choice"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    return {
      title: parsed.title || `${scrapedData.owner}/${scrapedData.repo}`,
      summary: parsed.summary || scrapedData.description || '',
      category: 'Tech & Coding',
      tags: Array.isArray(parsed.tags) ? parsed.tags : ['github'],
      platform: 'GitHub',
      interest_score: Number.isInteger(parsed.interest_score) ? Math.max(1, Math.min(10, parsed.interest_score)) : 8,
      usefulness_score: Number.isInteger(parsed.usefulness_score) ? Math.max(1, Math.min(10, parsed.usefulness_score)) : 8,
      use_cases: Array.isArray(parsed.use_cases) ? parsed.use_cases : [
        'Explore codebase for project inspiration',
        'Test local execution via setup commands',
        'Extract reusable utilities & patterns'
      ],
      quickstart_playbook: parsed.quickstart_playbook || {
        prerequisites: 'Git',
        commands: [`git clone ${url}`],
        one_liner: `git clone ${url}`
      },
      tech_stack_summary: parsed.tech_stack_summary || `Primary language: ${scrapedData.primary_language}`
    };
  } catch (error) {
    console.error('Gemini GitHub enrichment failed:', error);
    return {
      title: `${scrapedData.owner}/${scrapedData.repo}`,
      summary: scrapedData.description || 'GitHub repository',
      category: 'Tech & Coding',
      tags: ['github'],
      platform: 'GitHub',
      interest_score: 7,
      usefulness_score: 7,
      use_cases: ['Inspect repo codebase', 'Test locally'],
      quickstart_playbook: { prerequisites: 'Git', commands: [`git clone ${url}`], one_liner: `git clone ${url}` },
      tech_stack_summary: `Primary language: ${scrapedData.primary_language}`
    };
  }
}

