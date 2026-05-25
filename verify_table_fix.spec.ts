import { test, expect } from '@playwright/test';

test('verify table layout and hover actions', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Navigate to Tables view
  await page.click('button:has-text("Tables")');

  // Wait for table to be visible
  await expect(page.locator('table')).toBeVisible();

  // Verify no horizontal scroll on the table container
  const tableContainer = page.locator('.bg-base-100.rounded-2xl.border.border-base-300').nth(1); // The one containing the table
  const hasScrollbar = await tableContainer.evaluate((el) => el.scrollWidth > el.clientWidth);
  console.log(`Has horizontal scrollbar: ${hasScrollbar}`);

  // Capture screenshot of the table
  await page.screenshot({ path: '/home/jules/verification/table_hover_fix.png' });

  // Hover over the first row and verify actions appear
  const firstRow = page.locator('tbody tr').first();
  const actions = firstRow.locator('.flex.justify-end.gap-1');

  // Check initial state (should be hidden or at least have opacity 0)
  // Note: opacity-0 still exists in DOM, so we check CSS
  const opacityBefore = await actions.evaluate((el) => getComputedStyle(el).opacity);
  console.log(`Opacity before hover: ${opacityBefore}`);

  await firstRow.hover();

  const opacityAfter = await actions.evaluate((el) => getComputedStyle(el).opacity);
  console.log(`Opacity after hover: ${opacityAfter}`);

  // Capture screenshot with hover
  await page.screenshot({ path: '/home/jules/verification/table_hover_active.png' });

  expect(hasScrollbar).toBe(false);
  expect(parseFloat(opacityBefore)).toBe(0);
  expect(parseFloat(opacityAfter)).toBeGreaterThan(0);
});
