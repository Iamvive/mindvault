import { chromium } from 'playwright-core';
import http from 'node:http';

export async function checkCdpAvailable(host = '127.0.0.1', port = 9222) {
  return new Promise((resolve) => {
    const req = http.get(`http://${host}:${port}/json/version`, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

export async function connectToChrome(cdpUrl = 'http://127.0.0.1:9222') {
  const isAvailable = await checkCdpAvailable();
  if (!isAvailable) {
    throw new Error(
      `Chrome CDP not reachable at ${cdpUrl}.\nPlease launch Chrome with remote debugging:\n` +
      `  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-job-hunter-profile"`
    );
  }

  const browser = await chromium.connectOverCDP(cdpUrl);
  return browser;
}

export async function findOrCreateTab(browser, urlPattern, createUrl = null) {
  const contexts = browser.contexts();
  for (const context of contexts) {
    const pages = context.pages();
    for (const page of pages) {
      if (page.url().includes(urlPattern)) {
        return page;
      }
    }
  }

  // If tab not found and createUrl provided, open one in first context
  if (createUrl) {
    const context = contexts[0] || await browser.newContext();
    const newPage = await context.newPage();
    await newPage.goto(createUrl, { waitUntil: 'domcontentloaded' });
    return newPage;
  }

  return null;
}
