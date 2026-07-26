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

