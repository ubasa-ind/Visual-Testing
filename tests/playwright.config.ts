import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  reporter: 'html',
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
});
