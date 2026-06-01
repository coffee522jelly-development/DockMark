import { test, expect } from '@playwright/test';

test('verify graph view custom rendering', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Navigate to Graph
  const graphLink = page.locator('nav >> text=Graph');
  await graphLink.click();

  // Wait for graph to load
  await page.waitForSelector('canvas');

  // Wait for engine to stop (loading spinner disappears)
  await page.waitForSelector('.loading-spinner', { state: 'detached', timeout: 10000 });

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'verification/graph_view.png', fullPage: true });
});
