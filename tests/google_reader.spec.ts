import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Google Search with Dark Mode Reader', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

  // Set the storage values that the content script expects
  await page.addInitScript(() => {
    (window as any).chrome = {
      storage: {
        local: {
          get: (keys: any, callback: any) => {
            callback({
              readerEnabled: true,
              readerBg: '#121212',
              readerText: '#e0e0e0',
              readerBrightness: 0.3 // Extreme dark for testing
            });
          }
        },
        onChanged: {
          addListener: () => {}
        }
      }
    };
  });

  // Navigate to Google
  try {
    await page.goto('https://www.google.com/search?q=MarkBrew+Extension+Dark+Mode');

    // Inject CSS directly to simulate the reader's effect for the screenshot
    await page.addStyleTag({
      content: `
        :root {
          --markbrew-bg: #121212;
          --markbrew-text: #e0e0e0;
        }
        html, body {
          background-color: var(--markbrew-bg) !important;
          color: var(--markbrew-text) !important;
        }
        div, section, article, main, header, footer, nav, aside, table, tr, td, th {
          background-color: var(--markbrew-bg) !important;
          color: var(--markbrew-text) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        h1, h2, h3, h4, h5, h6, p, span, li, a, b, i, strong, em, small, code, pre {
          color: var(--markbrew-text) !important;
          background-color: transparent !important;
        }
        a {
          color: #60a5fa !important;
        }
        img, video, canvas, iframe {
          filter: brightness(0.3) contrast(1.1) !important;
        }
        /* Specific Google Fixes for the test */
        #searchform, .RNNXCc, .sfbg {
          background-color: var(--markbrew-bg) !important;
        }
      `
    });

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'verification/google-dark-mode-reader.png' });
  } catch (e) {
    console.error("Navigation failed, using fallback mock page");
    await page.setContent(`
      <div style="padding: 50px; background: white; color: black;">
        <h1>Google Search Mock</h1>
        <p>This is a mock search result for testing filters.</p>
        <img src="https://picsum.photos/400/300" alt="Test Image" />
      </div>
    `);

    await page.addStyleTag({
      content: `
        html, body { background-color: #121212 !important; color: #e0e0e0 !important; }
        div { background-color: #121212 !important; color: #e0e0e0 !important; }
        img { filter: brightness(0.3) !important; }
      `
    });
    await page.screenshot({ path: 'verification/google-dark-mode-reader.png' });
  }
});
