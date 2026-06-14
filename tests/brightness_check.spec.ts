import { test, expect } from '@playwright/test';

test('Dark Mode Reader Brightness Filter Verification', async ({ page }) => {
  // Create a mock page with a bright image and text
  await page.setContent(`
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Dark Mode Reader Test</h1>
      <p>Testing the image brightness filter logic.</p>
      <div style="display: flex; gap: 20px;">
        <div>
          <h3>Original-ish (Simulated)</h3>
          <img src="https://picsum.photos/300/200" style="filter: none;" />
        </div>
        <div id="target-area">
          <h3>Filtered (Reader Mode)</h3>
          <img src="https://picsum.photos/300/200" id="filtered-img" />
        </div>
      </div>
    </div>
  `);

  // Apply the reader CSS with 30% brightness (very dark)
  const bgColor = '#1a1a1a';
  const textColor = '#e5e5e5';
  const brightness = 0.3;

  await page.addStyleTag({
    content: `
      #target-area {
        background-color: ${bgColor} !important;
        color: ${textColor} !important;
        padding: 10px;
        border-radius: 8px;
      }
      #filtered-img {
        filter: brightness(${brightness}) contrast(1.1) !important;
      }
    `
  });

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'verification/brightness-filter-check.png' });
});
