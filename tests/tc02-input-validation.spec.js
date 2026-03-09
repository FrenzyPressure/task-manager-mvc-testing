/**
 * TC-02: Input Validation
 * Verifies: empty submissions rejected, boundary character limits handled
 * Expected to catch: D4 (boundary crash), D8 (frontend bypass)
 */
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { TaskDashboardPage } = require('./pages/TaskDashboardPage');

test.describe('TC-02: Input Validation', () => {
    let loginPage;
    let dashboardPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        dashboardPage = new TaskDashboardPage(page);
        await loginPage.navigate();
        await loginPage.login('admin', 'admin123');
    });

    test('should reject boundary-exceeding title (>256 chars) gracefully (DEFECT D4)', async ({ page }) => {
        const longTitle = 'A'.repeat(300);

        // Send via API to bypass frontend validation
        const response = await page.request.post('/api/tasks', {
            data: { title: longTitle }
        });

        // DEFECT D4: Server returns 500 Internal Server Error instead of 400 validation error
        // A well-written app should return 400 with a validation message
        expect(response.status()).not.toBe(500);
    });

    test('should validate empty task on server-side when JS is disabled (DEFECT D8)', async ({ page }) => {
        // Block JavaScript execution on the page to simulate D8
        await page.route('**/*.js', route => route.abort());

        // Submit empty task directly via API (bypassing frontend validation)
        const response = await page.request.post('/api/tasks', {
            data: { title: '' }
        });

        // DEFECT D8: Server should reject empty tasks, but there's no backend validation
        // If the server returns 200/success, the defect is confirmed
        if (response.ok()) {
            const data = await response.json();
            if (data.success) {
                // Backend accepted an empty task — DEFECT D8 confirmed
                expect(data.success).toBe(false); // This assertion will fail, confirming D8
            }
        }
    });
});
