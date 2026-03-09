/**
 * TC-01: Task Lifecycle (CRUD Operations)
 * Verifies: create, read, update, delete operations
 * Expected to catch: D1 (orphaned delete), D2 (timestamp not updated)
 */
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { TaskDashboardPage } = require('./pages/TaskDashboardPage');

test.describe('TC-01: Task Lifecycle (CRUD)', () => {
    let loginPage;
    let dashboardPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        dashboardPage = new TaskDashboardPage(page);
        await loginPage.navigate();
        await loginPage.login('admin', 'admin123');
    });

    test('should create a new task and display it', async ({ page }) => {
        const taskTitle = 'Playwright Test Task ' + Date.now();
        await dashboardPage.createTask(taskTitle);

        // Verify task appears in the list
        const cards = await dashboardPage.getTaskCards();
        const count = await cards.count();
        expect(count).toBeGreaterThan(0);

        // Verify the task text appears
        const listText = await dashboardPage.taskList.textContent();
        expect(listText).toContain(taskTitle);
    });

    test('should update a task status and verify updated_at changes (DEFECT D2)', async ({ page }) => {
        // Create a task via API
        const createRes = await page.request.post('/api/tasks', {
            data: { title: 'Timestamp Test ' + Date.now() }
        });
        const createData = await createRes.json();
        const taskId = createData.task.id;
        const originalUpdatedAt = createData.task.updated_at;

        // Wait a moment to ensure timestamp difference
        await page.waitForTimeout(1500);

        // Update the task status to Completed
        const updateRes = await page.request.put(`/api/tasks/${taskId}`, {
            data: { title: createData.task.title, status: 'Completed' }
        });
        const updateData = await updateRes.json();

        // DEFECT D2: updated_at should have changed but it doesn't
        expect(updateData.task.updated_at).not.toBe(originalUpdatedAt);
    });

    test('should delete a task and remove it from database (DEFECT D1)', async ({ page }) => {
        // Create a task via API
        const createRes = await page.request.post('/api/tasks', {
            data: { title: 'Delete Test ' + Date.now() }
        });
        const createData = await createRes.json();
        const taskId = createData.task.id;

        // Delete the task via API
        const deleteRes = await page.request.delete(`/api/tasks/${taskId}`);
        const deleteData = await deleteRes.json();
        expect(deleteData.success).toBe(true);

        // DEFECT D1: Verify the task is actually gone from DB by fetching it
        const fetchRes = await page.request.get('/api/tasks');
        const fetchData = await fetchRes.json();
        const deletedTask = fetchData.tasks.find(t => t.id === taskId);

        // This should be undefined if properly deleted — D1 means it still exists
        expect(deletedTask).toBeUndefined();
    });
});
