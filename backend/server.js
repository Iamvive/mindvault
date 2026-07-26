import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

import { Database } from './database.js';
import { scrapeUrl } from './scraper.js';
import { enrichResourceMetadata, enrichDocumentMetadata, enrichGitHubRepoMetadata } from './gemini.js';
import { parseGitHubUrl, scrapeGitHubRepo } from './githubScraper.js';
import { initBot } from './bot.js';
import { startScheduler, runDailyIngestion } from './scheduler.js';
import { convertFileToMarkdown } from './markitdown-wrapper.js';
import { startAutoPruner } from './pruner.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB limit

app.use(cors());
app.use(express.json());

// Serve static uploads
app.use('/uploads', express.static(uploadDir));

// Optional Basic Authentication for public cloud deployments
app.use((req, res, next) => {
  const adminUser = process.env.DASHBOARD_USER;
  const adminPass = process.env.DASHBOARD_PASS;
  
  // If not configured, skip authentication (default for local dev)
  if (!adminUser || !adminPass) {
    return next();
  }

  const authHeader = req.headers.authorization || '';
  const [type, credentials] = authHeader.split(' ');

  if (type === 'Basic' && credentials) {
    const decoded = Buffer.from(credentials, 'base64').toString('utf8');
    const [user, pass] = decoded.split(':');
    if (user === adminUser && pass === adminPass) {
      return next();
    }
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="MindVault Dashboard"');
  return res.status(401).send('Authentication required.');
});

// Initialize Telegram bot
initBot();

// Start nightly scheduler & auto-pruner
startScheduler();
startAutoPruner();

/**
 * REST API Endpoints
 */

// Get all resources with search, filtering, and sorting
app.get('/api/resources', (req, res) => {
  try {
    const { search, category, platform, sortBy, sortOrder } = req.query;
    const resources = Database.getAllResources(search, category, platform, sortBy, sortOrder);
    
    // Attach github_details and calculate days_remaining for GitHub resources
    const enrichedResources = resources.map(resource => {
      if (resource.platform === 'GitHub') {
        const ghDetails = Database.getGitHubDetails(resource.id);
        const lastInteracted = resource.last_interacted_at ? new Date(resource.last_interacted_at).getTime() : new Date(resource.created_at).getTime();
        const daysElapsed = Math.floor((Date.now() - lastInteracted) / (86400 * 1000));
        const daysRemaining = Math.max(0, 14 - daysElapsed);

        return {
          ...resource,
          days_remaining: daysRemaining,
          github_details: ghDetails ? {
            ...ghDetails,
            use_cases: typeof ghDetails.use_cases === 'string' ? JSON.parse(ghDetails.use_cases) : ghDetails.use_cases,
            quickstart_playbook: typeof ghDetails.quickstart_playbook === 'string' ? JSON.parse(ghDetails.quickstart_playbook) : ghDetails.quickstart_playbook
          } : null
        };
      }
      return resource;
    });

    res.json(enrichedResources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to retrieve resources' });
  }
});

// Get a single resource
app.get('/api/resources/:id', (req, res) => {
  try {
    const resource = Database.getResourceById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    if (resource.platform === 'GitHub') {
      const ghDetails = Database.getGitHubDetails(resource.id);
      const lastInteracted = resource.last_interacted_at ? new Date(resource.last_interacted_at).getTime() : new Date(resource.created_at).getTime();
      const daysElapsed = Math.floor((Date.now() - lastInteracted) / (86400 * 1000));
      const daysRemaining = Math.max(0, 14 - daysElapsed);

      return res.json({
        ...resource,
        days_remaining: daysRemaining,
        github_details: ghDetails ? {
          ...ghDetails,
          use_cases: typeof ghDetails.use_cases === 'string' ? JSON.parse(ghDetails.use_cases) : ghDetails.use_cases,
          quickstart_playbook: typeof ghDetails.quickstart_playbook === 'string' ? JSON.parse(ghDetails.quickstart_playbook) : ghDetails.quickstart_playbook
        } : null
      });
    }
    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Manually add a resource (triggers scraping and Gemini analysis)
app.post('/api/resources', async (req, res) => {
  const { url, user_notes } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Check if URL already exists
    const existing = Database.getResourceByUrl(url);
    if (existing) {
      return res.status(409).json({ error: 'Resource already exists', existing });
    }

    // Check if URL is GitHub
    const isGitHub = parseGitHubUrl(url);
    let enriched;

    if (isGitHub) {
      const scrapedData = await scrapeGitHubRepo(url);
      enriched = await enrichGitHubRepoMetadata(url, scrapedData, user_notes);
      
      const id = Database.createResource({
        url,
        title: enriched.title,
        summary: enriched.summary,
        category: enriched.category,
        tags: enriched.tags.join(','),
        platform: 'GitHub',
        interest_score: enriched.interest_score,
        usefulness_score: enriched.usefulness_score,
        user_notes
      });

      Database.saveGitHubDetails(id, {
        repo_owner: isGitHub.owner,
        repo_name: isGitHub.repo,
        stars: scrapedData.stars,
        forks: scrapedData.forks,
        primary_language: scrapedData.primary_language,
        use_cases: enriched.use_cases,
        quickstart_playbook: enriched.quickstart_playbook,
        tech_stack_summary: enriched.tech_stack_summary
      });

      const newResource = Database.getResourceById(id);
      const ghDetails = Database.getGitHubDetails(id);
      return res.status(201).json({
        ...newResource,
        days_remaining: 14,
        github_details: {
          ...ghDetails,
          use_cases: enriched.use_cases,
          quickstart_playbook: enriched.quickstart_playbook
        }
      });
    } else {
      // Scrape standard URL
      const meta = await scrapeUrl(url);
      enriched = await enrichResourceMetadata(url, meta, user_notes);

      const id = Database.createResource({
        url,
        title: enriched.title,
        summary: enriched.summary,
        category: enriched.category,
        tags: enriched.tags.join(','),
        platform: enriched.platform,
        interest_score: enriched.interest_score,
        usefulness_score: enriched.usefulness_score,
        user_notes
      });

      const newResource = Database.getResourceById(id);
      return res.status(201).json(newResource);
    }
  } catch (error) {
    console.error('Error adding resource:', error);
    res.status(500).json({ error: 'Failed to process resource' });
  }
});

// Update interaction timestamp for 14-day auto-pruning reset
app.post('/api/resources/:id/interact', (req, res) => {
  try {
    const changes = Database.updateLastInteracted(req.params.id);
    if (changes === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json({ success: true, message: 'Interaction recorded, timer reset to 14 days.' });
  } catch (error) {
    console.error('Error updating interaction:', error);
    res.status(500).json({ error: 'Failed to record interaction' });
  }
});

// Toggle pin status (exempts from 14-day auto-pruning)
app.patch('/api/resources/:id/pin', (req, res) => {
  try {
    const { is_pinned } = req.body;
    const changes = Database.togglePin(req.params.id, is_pinned);
    if (changes === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    const updated = Database.getResourceById(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Error toggling pin status:', error);
    res.status(500).json({ error: 'Failed to update pin status' });
  }
});

// Upload and ingest a file resource (runs MarkItDown + Gemini)
app.post('/api/resources/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { user_notes } = req.body;
  const filePath = req.file.path;
  const originalName = req.file.originalname;

  try {
    // 1. Run markitdown CLI wrapper to convert file to Markdown
    const markdown = await convertFileToMarkdown(filePath);

    // 2. Enrich document metadata using Gemini
    const enriched = await enrichDocumentMetadata(originalName, markdown, user_notes);

    // 3. To maintain unique URL constraint, construct a relative URL path starting with /uploads
    const relativeUrl = `/uploads/${req.file.filename}`;

    // 4. Save to SQLite database
    const id = Database.createResource({
      url: relativeUrl,
      title: enriched.title,
      summary: enriched.summary,
      category: enriched.category,
      tags: enriched.tags.join(','),
      platform: enriched.platform,
      interest_score: enriched.interest_score,
      usefulness_score: enriched.usefulness_score,
      user_notes: user_notes || '',
      content: markdown,
      file_path: filePath
    });

    const newResource = Database.getResourceById(id);
    res.status(201).json(newResource);
  } catch (error) {
    console.error('Error in file upload ingestion:', error);
    // Cleanup physical file on upload failure
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupErr) {
      console.error('File cleanup failed:', cleanupErr);
    }
    res.status(500).json({ error: error.message || 'Failed to ingest and parse document' });
  }
});

// Update an existing resource (e.g. updating scores, category, or notes)
app.put('/api/resources/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Restrict what can be updated from frontend to valid fields
  const allowedFields = ['title', 'summary', 'category', 'tags', 'platform', 'interest_score', 'usefulness_score', 'user_notes'];
  const sanitizedUpdates = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      sanitizedUpdates[field] = updates[field];
    }
  }

  try {
    const changes = Database.updateResource(id, sanitizedUpdates);
    if (changes === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    const updatedResource = Database.getResourceById(id);
    res.json(updatedResource);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// Delete a resource
app.delete('/api/resources/:id', (req, res) => {
  const { id } = req.params;
  try {
    const changes = Database.deleteResource(id);
    if (changes === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json({ success: true, message: `Resource ${id} deleted` });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

// Get metrics for the dashboard
app.get('/api/stats', (req, res) => {
  try {
    const stats = Database.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to compute dashboard metrics' });
  }
});

// Manually trigger daily update scraper
app.post('/api/cron/run', async (req, res) => {
  try {
    const result = await runDailyIngestion();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error running manual cron:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve frontend build in production
const frontendBuildPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendBuildPath));

// Catch-all route to serve React's index.html in production
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('MindVault Backend Server is running. Dashboard build not found.');
    }
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🌐 [MindVault Backend] API server running at http://localhost:${PORT}`);
});
