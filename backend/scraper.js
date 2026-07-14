import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';

// Standard User-Agent to mimic a regular desktop browser and avoid simple blockings
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Extracts platform name based on URL domain
 */
export function getPlatformName(urlString) {
  try {
    const parsedUrl = new URL(urlString);
    const hostname = parsedUrl.hostname.toLowerCase();
    
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'YouTube';
    }
    if (hostname.includes('instagram.com')) {
      return 'Instagram';
    }
    if (hostname.includes('github.com')) {
      return 'GitHub';
    }
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return 'X / Twitter';
    }
    if (hostname.includes('medium.com')) {
      return 'Medium';
    }
    if (hostname.includes('reddit.com')) {
      return 'Reddit';
    }
    if (hostname.includes('tiktok.com')) {
      return 'TikTok';
    }
    
    // Clean up generic domain name (e.g. google.com -> Google, dev.to -> Dev)
    const parts = hostname.replace('www.', '').split('.');
    if (parts.length > 0) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    return 'Web';
  } catch (error) {
    return 'Web';
  }
}

/**
 * Scrapes metadata from a URL.
 * Throws or returns placeholder values if blocked.
 */
export async function scrapeUrl(urlString) {
  const platform = getPlatformName(urlString);
  
  // Instagram, TikTok, and X/Twitter always require authentication or block simple scrapers
  if (['Instagram', 'TikTok', 'X / Twitter'].includes(platform)) {
    return {
      url: urlString,
      title: `${platform} Link`,
      description: '',
      image: '',
      platform,
      isBlocked: true
    };
  }

  try {
    const response = await axios.get(urlString, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 10000,
      maxRedirects: 5
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract Open Graph & Meta details
    const title = 
      $('meta[property="og:title"]').attr('content') || 
      $('meta[name="twitter:title"]').attr('content') || 
      $('title').text() || 
      '';

    const description = 
      $('meta[property="og:description"]').attr('content') || 
      $('meta[name="twitter:description"]').attr('content') || 
      $('meta[name="description"]').attr('content') || 
      '';

    const image = 
      $('meta[property="og:image"]').attr('content') || 
      $('meta[name="twitter:image"]').attr('content') || 
      '';

    const siteName = 
      $('meta[property="og:site_name"]').attr('content') || 
      platform;

    return {
      url: urlString,
      title: title.trim(),
      description: description.trim(),
      image: image.trim(),
      platform: siteName,
      isBlocked: false
    };
  } catch (error) {
    console.error(`Scraping failed for ${urlString}:`, error.message);
    
    // Return standard fallback model so we don't crash
    return {
      url: urlString,
      title: `Saved Link (${platform})`,
      description: '',
      image: '',
      platform,
      isBlocked: true // Mark as blocked so backend/bot knows to ask for user notes
    };
  }
}
