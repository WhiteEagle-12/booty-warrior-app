from playwright.sync_api import sync_playwright, Page, expect

def run_verification(page: Page):
    """
    This script verifies that the "Create New Exercise" modal opens with empty fields.
    """
    # 1. Go to the app
    # The server should be running on localhost:3000
    page.goto("http://localhost:3000")

    # --- Handle Tutorial ---
    # The app opens with a tutorial. We need to click through it.

    # Wait for the tutorial modal to appear
    expect(page.get_by_role("heading", name="Welcome to Project Overload!")).to_be_visible(timeout=30000)

    # Step 1 -> 2
    page.get_by_role("button", name="Next").click()

    # Step 2 -> 3
    page.get_by_role("button", name="Next").click()

    # Step 3 -> 4
    page.get_by_role("button", name="Next").click()

    # Step 4: Enter Sync ID
    page.get_by_placeholder("e.g., john-doe-lifts").fill("test-user")
    page.get_by_role("button", name="Set ID & Continue").click()

    # Step 5: Select a program
    # Just select the first one
    page.get_by_role("button", name="Select").first.click()

    # Step 6: Enter bodyweight
    page.get_by_placeholder("Your current bodyweight").fill("150")
    page.get_by_role("button", name="Finish Setup").click()

    # --- Tutorial finished ---

    # 2. Navigate to Edit Program
    # The sidebar might be hidden on mobile, but we are on desktop.
    # The sidebar is identified by the menu button on mobile. On desktop, it should be visible.
    # Let's find the "Edit Program" button and click it.
    edit_program_button = page.get_by_role("button", name="Edit Program")
    expect(edit_program_button).to_be_visible()
    edit_program_button.click()

    # 3. Open the "Create New Exercise" modal
    create_button = page.get_by_role("button", name="Create")
    expect(create_button).to_be_visible()
    create_button.click()

    # 4. Verify the modal and take a screenshot
    # Wait for the modal to be visible
    modal_heading = page.get_by_role("heading", name="Create New Exercise")
    expect(modal_heading).to_be_visible()

    # Find the modal itself to take a screenshot of just it.
    # The modal content is inside a div with role="dialog" implicitly, but let's find it by its content.
    # The modal has a class `bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6`
    # Let's locate it by a child element and go up.
    modal_element = modal_heading.locator('xpath=./ancestor::div[contains(@class, "bg-white")]')

    # Take a screenshot of the modal
    modal_element.screenshot(path="jules-scratch/verification/verification.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_verification(page)
        browser.close()

if __name__ == "__main__":
    main()
