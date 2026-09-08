import { test, expect, devices } from '@playwright/test';

// Define mobile layouts to check
const testDevices = [
  { name: 'iPhone-Layout', profile: devices['iPhone 14'] },
  { name: 'Android-Layout', profile: devices['Pixel 7'] }
];

const PROD_URL = 'https://www.harperenfoque.com/';
const STAGING_URL = 'https://dev-harperenfoque.pantheonsite.io/';

test('Crawl and Compare all Sub-Links on Mobile', async ({ browser }) => {
  // 1. Discover sub-links from production homepage
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(PROD_URL);

  const discoveredLinks = await page.evaluate((baseUrl) => {
    const anchors = Array.from(document.querySelectorAll('a'));
    return anchors
      .map(a => a.href)
      .filter(href => href.startsWith(baseUrl))
      .map(href => href.replace(baseUrl, ''));
  }, PROD_URL);

  const uniquePaths = [...new Set(discoveredLinks)];
  await context.close();

  // 2. Loop through every discovered sub-link and compare mobile UI layouts
  for (const device of testDevices) {
    for (const path of uniquePaths) {
      const mobileContext = await browser.newContext({ ...device.profile });
      const mobilePage = await mobileContext.newPage();

      // Go to Production & generate baseline snapshot
      await mobilePage.goto(`${PROD_URL}${path}`);
      
      // Go to Staging & perform the real-time pixel comparison
      await mobilePage.goto(`${STAGING_URL}${path}`);
      
      const safeFileName = path.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'homepage';
      
      // Soft assertion so the script keeps checking all other pages even if one fails
      await expect.soft(mobilePage).toHaveScreenshot(`${device.name}-${safeFileName}.png`);

      await mobileContext.close();
    }
  }
});
