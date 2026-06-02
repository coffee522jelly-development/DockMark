import { test, expect } from '@playwright/test';

test('verify bookmark table view folder dropdown', async ({ page }) => {
  await page.goto('http://localhost:5181');

  // Navigate to Bookmarks
  await page.click('text=Bookmarks');

  // Switch to Table view
  await page.click('text=Tables');

  // Wait for table to load
  await page.waitForSelector('table');

  // Check the select element
  const select = page.locator('select').first();
  await expect(select).toBeVisible();

  // Verify classes
  const className = await select.getAttribute('class');
  expect(className).toContain('bg-base-100');
  expect(className).toContain('select-bordered');

  // Take screenshot
  await page.screenshot({ path: 'verification/table_dropdown.png' });

  // Click the select to see options
  await select.click();
  await page.screenshot({ path: 'verification/table_dropdown_open.png' });
});
