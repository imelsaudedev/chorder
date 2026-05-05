import { test, expect } from '@playwright/test';
import { seedVisualBaseline } from './e2e-utils';

let seededIds: { 
  songId: number; 
  songSlug: string; 
  arrangementId: number | undefined; 
  serviceId: number; 
  serviceSlug: string; 
};

test.beforeAll(async () => {
  seededIds = await seedVisualBaseline();
});

test.describe('Visual Regression Suite', () => {
  // Utility to ensure we are not on an error page and the app is ready
  async function ensureAppReady(page: any) {
    await page.waitForLoadState('networkidle');
    // Ensure we don't see the Next.js 404/500 boundary
    await expect(page.locator('html')).not.toHaveId('__next_error__');
    await expect(page.getByText('This page could not be found')).not.toBeVisible();
    await expect(page.getByText('Internal Server Error')).not.toBeVisible();
    // Wait for the heading to be visible (h1 is present on all test pages)
    await page.waitForSelector('h1', { state: 'visible', timeout: 10000 });
  }

  test('Home page visual check', async ({ page }) => {
    await page.goto('/');
    await ensureAppReady(page);
    // Wait for the layout to finish rendering
    await page.waitForTimeout(500); 
    await expect(page).toHaveScreenshot('home-page.png', { fullPage: true });
  });

  test('Song List visual check', async ({ page }) => {
    await page.goto('/songs');
    await ensureAppReady(page);
    // Wait for data to load
    await expect(page.getByText('Visual Baseline Song')).toBeVisible();
    await expect(page).toHaveScreenshot('song-list.png', { fullPage: true });
  });

  test('Song View visual check', async ({ page }) => {
    await page.goto(`/songs/${seededIds.songSlug}`);
    await ensureAppReady(page);
    await expect(page.getByText('Visual Baseline Song')).toBeVisible();
    await expect(page.getByText('Standard Arrangement')).toBeVisible();
    await expect(page).toHaveScreenshot('song-view.png', { fullPage: true });
  });

  test('Song Edit visual check', async ({ page }) => {
    // Song Edit REQUIRES the arrangement search parameter
    await page.goto(`/songs/${seededIds.songSlug}/edit?arrangement=${seededIds.arrangementId}`);
    await ensureAppReady(page);
    // Wait for the form to populate (we wait for the title input or a short timeout)
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot('song-edit.png', { fullPage: true });
  });

  test('Service List visual check', async ({ page }) => {
    await page.goto('/services');
    await ensureAppReady(page);
    await expect(page.getByText('Visual Baseline Service')).toBeVisible();
    await expect(page).toHaveScreenshot('service-list.png', { fullPage: true });
  });

  test('Service View visual check', async ({ page }) => {
    await page.goto(`/services/${seededIds.serviceSlug}`);
    await ensureAppReady(page);
    await expect(page.getByText('Visual Baseline Service')).toBeVisible();
    await expect(page).toHaveScreenshot('service-view.png', { fullPage: true });
  });

  test('Service Edit/Planning visual check', async ({ page }) => {
    await page.goto(`/services/${seededIds.serviceSlug}/edit`);
    await ensureAppReady(page);
    await expect(page.getByLabel('Título')).toHaveValue('Visual Baseline Service');
    // Wait for the 3 seeded units to appear (they show the song title)
    await expect(page.getByText('Visual Baseline Song')).toHaveCount(3);
    await expect(page).toHaveScreenshot('service-edit.png', { fullPage: true });
  });
});
