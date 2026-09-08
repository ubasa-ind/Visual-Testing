import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: [['html', { open: 'never', outputFolder: 'playwright-report' }]],
  expect: {
    toHaveScreenshot: { 
      maxDiffPixelRatio: 0.05,
      animations: 'disabled'
    },
  },
});
