/**
 * Page Object Model: Login Page
 * Encapsulates locators and actions for the login view.
 */
class LoginPage {
    constructor(page) {
        this.page = page;
        this.usernameInput = page.locator('#username');
        this.passwordInput = page.locator('#password');
        this.signInButton = page.locator('#loginButton');
        this.errorMessage = page.locator('#errorMessage');
    }

    async navigate() {
        await this.page.goto('/login');
    }

    async login(username, password) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.signInButton.click();
        await this.page.waitForURL('**/dashboard', { timeout: 5000 });
    }
}

module.exports = { LoginPage };
