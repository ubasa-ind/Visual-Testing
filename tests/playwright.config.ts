import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: [['html', { open: 'never', outputFolder: 'playwright-report' }]],
  outputDir: 'test-results/',
  expect: {
    toHaveScreenshot: { 
      maxDiffPixelRatio: 0.05, // Relaxes threshold slightly for dynamic mobile elements
      animations: 'disabled'   // Disables moving elements so snapshots stay consistent
    },
  },
});
