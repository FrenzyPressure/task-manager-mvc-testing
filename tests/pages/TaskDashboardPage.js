/**
 * Page Object Model: Task Dashboard Page
 * Encapsulates locators and actions for the dashboard view.
 */
class TaskDashboardPage {
    constructor(page) {
        this.page = page;
        this.newTaskInput = page.locator('#newTaskTitle');
        this.createTaskButton = page.locator('#createTaskBtn');
        this.searchInput = page.locator('#searchInput');
        this.statusFilter = page.locator('#statusFilter');
        this.taskList = page.locator('#taskList');
        this.emptyState = page.locator('#emptyState');
        this.totalCount = page.locator('#totalCount');
        this.pendingCount = page.locator('#pendingCount');
        this.completedCount = page.locator('#completedCount');
        this.editModal = page.locator('#editModal');
        this.editTaskTitle = page.locator('#editTaskTitle');
        this.editTaskStatus = page.locator('#editTaskStatus');
        this.saveTaskButton = page.locator('#saveTaskBtn');
    }

    async createTask(title) {
        await this.newTaskInput.fill(title);
        await this.createTaskButton.click();
        await this.page.waitForTimeout(500);
    }

    async getTaskCards() {
        return this.taskList.locator('.task-card');
    }

    async getTaskCount() {
        const text = await this.totalCount.textContent();
        return parseInt(text, 10);
    }

    async editTask(taskId, { title, status } = {}) {
        // Click edit button for the task
        const editBtn = this.page.locator(`[data-task-id="${taskId}"] button[title="Edit task"]`);
        await editBtn.click();
        await this.page.waitForTimeout(300);

        if (title) {
            await this.editTaskTitle.fill(title);
        }
        if (status) {
            await this.editTaskStatus.selectOption(status);
        }
        await this.saveTaskButton.click();
        await this.page.waitForTimeout(500);
    }

    async deleteTask(taskId) {
        // Listen for dialog (confirm) and accept it
        this.page.once('dialog', dialog => dialog.accept());
        const deleteBtn = this.page.locator(`[data-task-id="${taskId}"] button[title="Delete task"]`);
        await deleteBtn.click();
        await this.page.waitForTimeout(500);
    }

    async search(query) {
        await this.searchInput.fill(query);
        await this.page.waitForTimeout(500);
    }

    async setFilter(value) {
        await this.statusFilter.selectOption(value);
        await this.page.waitForTimeout(300);
    }
}

module.exports = { TaskDashboardPage };
