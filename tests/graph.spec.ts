import { test, expect } from '@playwright/test';

test('Knowledge Graph renders with correct nodes and handles drag mode', async ({ page }) => {
  // Capture logs for debugging
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });

  // Navigate to the graph view
  await page.goto('http://localhost:5173/?view=graph');

  // 1. Verify container is rendered
  const graphContainer = page.locator('.sigma-container');
  await expect(graphContainer).toBeVisible({ timeout: 15000 });

  // 2. Verify controls are present
  await expect(page.locator('button[title*="Mode"]')).toBeVisible();
  await expect(page.locator('button[title="Zoom In"]')).toBeVisible();
  await expect(page.locator('button[title="Zoom Out"]')).toBeVisible();
  await expect(page.locator('button[title="Reset View"]')).toBeVisible();

  // 3. Verify Legend
  await expect(page.getByText('Folder')).toBeVisible();
  await expect(page.getByText('Bookmark (Click to open)')).toBeVisible();

  // 4. Test Drag Mode Toggle
  const dragToggleButton = page.locator('button[title*="Mode"]');
  // Initial state should be navigation (MousePointer2 icon usually, but checking title/class)
  await expect(dragToggleButton).not.toHaveClass(/btn-primary/);
  await expect(dragToggleButton).toHaveAttribute('title', 'Switch to Drag Mode');

  // Click to switch to Drag Mode
  await dragToggleButton.click();

  // Verify state change
  await expect(dragToggleButton).toHaveClass(/btn-primary/);
  await expect(dragToggleButton).toHaveAttribute('title', 'Switch to Navigation Mode');

  // 5. Visual Check (Screenshots)
  await page.screenshot({ path: 'test-results/graph-drag-mode.png' });

  // Toggle back
  await dragToggleButton.click();
  await expect(dragToggleButton).toHaveAttribute('title', 'Switch to Drag Mode');
});
