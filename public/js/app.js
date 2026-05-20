/**
 * Task Manager - Client-Side JavaScript
 */

let allTasks = [];
let currentFilter = 'all';

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setupSearch();
});

// ===== Load Tasks =====
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        const data = await response.json();

        if (response.ok) {
            allTasks = data.tasks;
            document.getElementById('usernameDisplay').textContent = `Welcome, ${data.username}`;
            renderTasks();
            updateStats();
        }
    } catch (err) {
        console.error('Failed to load tasks:', err);
    }
}

// ===== Render Tasks =====
function renderTasks() {
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');

    // Apply filter
    let filtered = allTasks;
    if (currentFilter !== 'all') {
        filtered = allTasks.filter(t => t.status === currentFilter);
    }

    if (filtered.length === 0) {
        taskList.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    taskList.innerHTML = filtered.map((task, index) => `
    <div class="glass-card task-card rounded-xl p-4 fade-in" style="animation-delay: ${index * 0.05}s;" data-task-id="${task.id}">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <svg class="w-4 h-4 flex-shrink-0 ${task.status === 'Completed' ? 'text-emerald-400' : 'text-amber-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              ${task.status === 'Completed'
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
        }
            </svg>
            <h3 class="text-white font-medium truncate">${escapeHtml(task.title)}</h3>
          </div>
          <div class="flex items-center gap-3 text-xs text-slate-500">
            <span class="badge-${task.status.toLowerCase()} px-2 py-0.5 rounded-full text-xs font-medium">${task.status}</span>
            <span>Created: ${formatDate(task.created_at)}</span>
            <span>Updated: ${formatDate(task.updated_at)}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            onclick="openEditModal(${task.id})"
            class="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
            title="Edit task"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          <button
            onclick="deleteTask(${task.id})"
            class="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors btn-delete-disabled"
            title="Delete task"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== Create Task =====
async function createTask() {
    const titleInput = document.getElementById('newTaskTitle');
    const title = titleInput.value.trim();

    if (!title) {
        titleInput.classList.add('border-red-500');
        setTimeout(() => titleInput.classList.remove('border-red-500'), 2000);
        return;
    }

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            titleInput.value = '';
            allTasks.unshift(data.task);
            renderTasks();
            updateStats();
        } else {
            alert(data.error || 'Failed to create task');
        }
    } catch (err) {
        alert('Failed to create task. Please try again.');
    }
}

// ===== Delete Task =====
async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        const data = await response.json();

        if (response.ok && data.success) {
            allTasks = allTasks.filter(t => t.id !== id);
            renderTasks();
            updateStats();
        }
    } catch (err) {
        alert('Failed to delete task');
    }
}

// ===== Edit Task =====
function openEditModal(id) {
    const task = allTasks.find(t => t.id === id);
    if (!task) return;

    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskStatus').value = task.status;

    const modal = document.getElementById('editModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

async function saveTask() {
    const id = document.getElementById('editTaskId').value;
    const title = document.getElementById('editTaskTitle').value.trim();
    const status = document.getElementById('editTaskStatus').value;

    if (!title) return;

    try {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, status })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Update local data
            const idx = allTasks.findIndex(t => t.id === data.task.id);
            if (idx !== -1) allTasks[idx] = data.task;
            renderTasks();
            updateStats();
            closeEditModal();
        }
    } catch (err) {
        alert('Failed to update task');
    }
}

// ===== Search =====
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    let debounceTimer;

    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const query = searchInput.value.trim();

            if (!query) {
                loadTasks();
                return;
            }

            try {
                const response = await fetch(`/api/tasks/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();

                if (response.ok) {
                    allTasks = data.tasks;
                    renderTasks();
                    updateStats();
                }
            } catch (err) {
                console.error('Search failed:', err);
            }
        }, 300);
    });
}

// ===== Filter =====
function filterTasks() {
    currentFilter = document.getElementById('statusFilter').value;
    renderTasks();
}

// ===== Update Stats =====
function updateStats() {
    const total = allTasks.length;
    const pending = allTasks.filter(t => t.status === 'Pending').length;
    const completed = allTasks.filter(t => t.status === 'Completed').length;

    document.getElementById('totalCount').textContent = total;
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('completedCount').textContent = completed;
}

// ===== Utilities =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// Allow Enter key to create task
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement.id === 'newTaskTitle') {
        createTask();
    }
});
