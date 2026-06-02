from playwright.sync_api import Page, expect, sync_playwright
import time

def test_bookshelf(page: Page):
    # Go to the local dev server
    page.goto("http://localhost:5181/")

    # Wait for the page to load
    page.wait_for_selector("text=MarkBrew")

    # Click on the BookShelf menu item
    # Since it's a new item, let's find it by text or icon.
    # The label should be 'BookShelf' in English or '本棚' in Japanese.
    # Default is likely English.
    bookshelf_link = page.get_by_role("button", name="BookShelf")
    if not bookshelf_link.is_visible():
        bookshelf_link = page.get_by_role("button", name="本棚")

    bookshelf_link.click()

    # Wait for the bookshelf view to render
    page.wait_for_selector("h3:has-text('Tech')") # Based on mock data

    # Take a screenshot
    page.screenshot(path="verification/bookshelf_initial.png")

    # Hover over a book to trigger the effect
    # The books are in a div with w-10 h-48
    books = page.locator(".group.perspective-1000")
    if books.count() > 0:
        books.first.hover()
        time.sleep(1) # Wait for animation
        page.screenshot(path="verification/bookshelf_hover.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 720})
        try:
            test_bookshelf(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
