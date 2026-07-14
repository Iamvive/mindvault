import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { Database } from './database.js';
import { scrapeUrl } from './scraper.js';
import { enrichResourceMetadata } from './gemini.js';
import { initBot } from './bot.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

/**
 * REST API Endpoints
 */

// Get all resources with search, filtering, and sorting
app.get('/api/resources', (req, res) => {
  try {
    const { search, category, platform, sortBy, sortOrder } = req.query;
    const resources = Database.getAllResources(search, category, platform, sortBy, sortOrder);
    res.json(resources);
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

    // Scrape URL
    const meta = await scrapeUrl(url);

    // Enrich with Gemini
    const enriched = await enrichResourceMetadata(url, meta, user_notes);

    // Save to DB
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
    res.status(201).json(newResource);
  } catch (error) {
    console.error('Error adding resource:', error);
    res.status(500).json({ error: 'Failed to process resource' });
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
