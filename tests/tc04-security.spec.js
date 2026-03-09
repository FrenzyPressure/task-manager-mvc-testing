/**
 * TC-04: Security Handling
 * Verifies: search and input fields sanitize special characters
 * Expected to catch: D9 (SQL injection)
 */
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');

test.describe('TC-04: Security Handling', () => {
    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login('admin', 'admin123');
    });

    test('should sanitize search input against SQL injection (DEFECT D9)', async ({ page }) => {
        // First create a known task
        await page.request.post('/api/tasks', {
            data: { title: 'Security Test Task' }
        });

        // Attempt SQL injection via search
        const sqlPayloads = [
            "' OR 1=1 --",
            "'; DROP TABLE tasks; --",
            "' UNION SELECT * FROM users --",
        ];

        for (const payload of sqlPayloads) {
            const response = await page.request.get(`/api/tasks/search?q=${encodeURIComponent(payload)}`);

            // DEFECT D9: If the search returns a successful response with data,
            // it means the SQL injection was not sanitized
            if (response.ok()) {
                const data = await response.json();
                // If SQL injection payload returns ALL tasks or unexpected data, it's vulnerable
                // A properly sanitized query would return empty results for these payloads
                if (data.tasks && data.tasks.length > 0) {
                    // SQL injection successful — DEFECT D9 confirmed
                    expect(data.tasks.length, `SQL injection payload "${payload}" returned data`).toBe(0);
                }
            } else {
                // Server error (500) also indicates improper handling of special characters
                expect(response.status(), `SQL payload caused server error`).not.toBe(500);
            }
        }
    });

    test('should handle boundary-value SQL payloads in task title (DEFECT D4)', async ({ page }) => {
        const longPayload = 'X'.repeat(300);

        const response = await page.request.post('/api/tasks', {
            data: { title: longPayload }
        });

        // DEFECT D4: Should return 400 (bad request) not 500 (server error)
        if (!response.ok()) {
            expect(response.status()).not.toBe(500);
        }
    });
});
