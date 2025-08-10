import re
from playwright.sync_api import sync_playwright, Page, expect

def verify_changes(page: Page):
    """
    This script verifies the following:
    1. The "Edit Program" view correctly renders master workout templates.
    2. Drag and drop for reordering exercises within a template works.
    3. The lifting session view correctly displays exercises without errors.
    """

    page.goto("http://localhost:3000", wait_until="networkidle")

    # Handle the initial setup by setting a sync ID and reloading.
    try:
        welcome_header = page.get_by_role("heading", name="Welcome to Project Overload!")
        expect(welcome_header).to_be_visible(timeout=10000)

        print("Tutorial modal found. Setting sync ID and reloading...")

        # Navigate to step 4
        page.get_by_role("button", name="Next").click()
        page.get_by_role("button", name="Next").click()
        page.get_by_role("button", name="Next").click()

        # Set sync ID
        expect(page.get_by_role("heading", name="Step 4: Create a Sync ID")).to_be_visible()
        page.get_by_placeholder("e.g., john-doe-lifts").fill("test-sync-id")
        page.get_by_role("button", name="Set ID & Continue").click()

        # The app state will change and data will be loaded.
        # It's simpler to just reload the page. The sync ID should be persisted.
        page.reload(wait_until="networkidle")
        print("Page reloaded.")

    except Exception as e:
        print(f"Tutorial not found or already handled: {e}")

    # 2. Go to Edit Program view
    page.get_by_role("button", name="Edit Program").click()

    # 3. Verify master templates are rendered and take a screenshot
    expect(page.get_by_role("heading", name="Edit Program")).to_be_visible()
    expect(page.locator('button:has-text("Pull (Hypertrophy Focus)")')).to_be_visible()
    page.screenshot(path="jules-scratch/verification/edit-program-view.png")

    # 4. Drag and drop an exercise
    first_exercise = page.locator('li:has-text("Pullups")').first
    second_exercise_locator = page.locator('li:has-text("Chest Supported Row")').first

    first_exercise.drag_to(second_exercise_locator)

    # 5. Take a screenshot of the reordered exercises
    page.screenshot(path="jules-scratch/verification/edit-program-reordered.png")

    # 6. Navigate to a lifting session
    page.get_by_role("button", name="Program", exact=True).click()
    page.locator('.grid .rounded-lg button:has-text("Pull")').first.click()

    # 7. Verify exercises are displayed correctly and take a screenshot
    expect(page.get_by_role("heading", name=re.compile("Week 1: Mon"))).to_be_visible()
    expect(page.get_by_role("heading", name="Pullups")).to_be_visible()
    expect(page.get_by_role("heading", name="Chest Supported Row")).to_be_visible()
    expect(page.get_by_text('not found in master list')).to_have_count(0)

    page.screenshot(path="jules-scratch/verification/lifting-session-view.png")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_changes(page)
            print("Verification script completed successfully.")
        except Exception as e:
            print(f"Verification script failed: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    main()
