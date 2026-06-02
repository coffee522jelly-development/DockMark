from playwright.sync_api import Page, expect, sync_playwright
import time

def test_table_dropdown(page: Page):
    # Go to the local dev server
    page.goto("http://localhost:5181/")

    # Wait for the page to load
    page.wait_for_selector("text=MarkBrew")

    # Click on the Table menu item
    table_link = page.get_by_role("button", name="Tables")
    if not table_link.is_visible():
        table_link = page.get_by_role("button", name="テーブル")

    table_link.click()

    # Wait for table to load
    page.wait_for_selector("table")

    # Check the select element
    select = page.locator("select").first
    expect(select).to_be_visible()

    # Verify classes
    class_name = select.get_attribute("class")
    print(f"Select classes: {class_name}")
    assert "bg-base-100" in class_name
    assert "select-bordered" in class_name

    # Take screenshot
    page.screenshot(path="verification/table_dropdown.png")

    # Click the select to see options
    select.click()
    time.sleep(1)
    page.screenshot(path="verification/table_dropdown_open.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 720})
        try:
            test_table_dropdown(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/table_dropdown_error.png")
        finally:
            browser.close()
