import { test, expect } from '@playwright/test';

test('verify bookshelf shadows and depth', async ({ page }) => {
  await page.goto('http://localhost:5181');

  // Wait for the app to load
  await page.waitForSelector('text=Dock');

  // Click on BookShelf in the sidebar
  await page.click('text=BookShelf');

  // Wait for the bookshelf view to render
  // BookmarkGallery with viewMode='bookshelf' should render shelves
  await page.waitForSelector('.space-y-24'); // The container for shelves in BookmarkGallery

  // Take a screenshot of the bookshelf
  await page.screenshot({ path: 'verification/bookshelf_check.png', fullPage: true });

  // Try to hover over a book to see the hover effect/shadow
  const firstBook = page.locator('.group\\/book').first();
  if (await firstBook.isVisible()) {
    await firstBook.hover();
    await page.screenshot({ path: 'verification/bookshelf_hover_check.png' });
  }
});
