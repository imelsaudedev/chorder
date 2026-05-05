import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Force load .env.test before config starts to override shell DATABASE_URL
const envTestPath = path.resolve(process.cwd(), '.env.test');
if (fs.existsSync(envTestPath)) {
  const envConfig = fs.readFileSync(envTestPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const key = line.split('=')[0]; const value = line.substring(line.indexOf('=') + 1);
    if (key && value) {
      let finalValue = value.trim();
      if (key.trim() === 'DATABASE_URL') {
        finalValue = finalValue.replace('schema=public', 'schema=e2e');
      }
      process.env[key.trim()] = finalValue;
    }
  });
}

const testDbUrl = process.env.DATABASE_URL;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120000,
  /* Maximum pixel difference allowance for visual regression */
  expect: {
    timeout: 30000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      threshold: 0.2,
    },
  },
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry for stability against dev-mode compilation lags */
  retries: 2,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { host: '0.0.0.0', port: 9323 }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://127.0.0.1:3001',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Screenshot comparison settings */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers and devices */
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'tablet-ipad',
      use: { ...devices['iPad Pro 11'] },
    },
    {
      name: 'mobile-iphone',
      use: { ...devices['iPhone 14'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'next dev -H 127.0.0.1 -p 3001',
    url: 'http://127.0.0.1:3001',
    reuseExistingServer: false,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      DATABASE_URL: testDbUrl || '',
      NODE_ENV: 'test',
    },
  },
});
