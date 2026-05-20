// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    timeout: 30000,
    retries: 0,
    use: {
        baseURL: 'http://localhost:3000',
        headless: true,
        viewport: { width: 1920, height: 1080 },
        screenshot: 'only-on-failure',
    },
    reporter: [['list'], ['json', { outputFile: 'tests/results/test-results.json' }]],
    webServer: {
        command: 'node app.js',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
    },
});
