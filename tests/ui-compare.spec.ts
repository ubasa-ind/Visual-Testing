import { test, expect, devices } from '@playwright/test';

const testDevices = [
  { name: 'iPhone-Layout', profile: devices['iPhone 14'] },
  { name: 'Android-Layout', profile: devices['Pixel 7'] }
];

const PROD_URL = 'https://your-production-site.com';
const STAGING_URL = 'https://your-staging-site.com';

test('Crawl and Compare all Sub-Links on Mobile', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(PROD_URL);

  // Automatically find all sub-links on the homepage
  const discoveredLinks = await page.evaluate((baseUrl) => {
    const anchors = Array.from(document.querySelectorAll('a'));
    return anchors
      .map(a => a.href)
      .filter(href => href.startsWith(baseUrl))
      .map(href => href.replace(baseUrl, ''));
  }, PROD_URL);

  const uniquePaths = [...new Set(discoveredLinks)];
  await context.close();

  // Loop through every discovered link and compare
  for (const device of testDevices) {
    for (const path of uniquePaths) {
      const mobileContext = await browser.newContext({ ...device.profile });
      const mobilePage = await mobileContext.newPage();

      // 1. Snapshot Production as the baseline truth
      await mobilePage.goto(`${PROD_URL}${path}`);
      
      // 2. Go to Staging and pixel-verify it against Prod
      await mobilePage.goto(`${STAGING_URL}${path}`);
      
      const safeFileName = path.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'homepage';
      
      // This line will fail the test and generate a visual red diff if they don't match!
      await expect(mobilePage).toHaveScreenshot(`${device.name}-${safeFileName}.png`, {
        maxDiffPixelRatio: 0.02 // Ignores minor 2% shifts (like loading spinners), flags real bugs
      });

      await mobileContext.close();
    }
  }
});
