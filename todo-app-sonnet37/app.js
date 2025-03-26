/**
 * Sonnet 3.7 Smart Task Manager
 * A sophisticated to-do application showcasing Sonnet 3.7's capabilities
 */

// Task Manager Class - Core functionality
class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentId = 0;
        this.editingTaskId = null;
        this.filters = {
            status: 'all',
            priority: 'all',
            category: 'all'
        };
        this.sortBy = 'date-added';
        this.loadFromLocalStorage();
    }

    // Create a new task
    addTask(taskData) {
        const newTask = {
            id: this.currentId++,
            title: taskData.title,
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: taskData.dueDate || null,
            priority: taskData.priority || 'medium',
            category: taskData.category || 'personal',
            notes: taskData.notes || ''
        };

        this.tasks.push(newTask);
        this.saveToLocalStorage();
        return newTask;
    }

    // Get a task by ID
    getTask(id) {
        return this.tasks.find(task => task.id === id);
    }

    // Update an existing task
    updateTask(id, updatedData) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex === -1) return false;

        this.tasks[taskIndex] = {
            ...this.tasks[taskIndex],
            ...updatedData
        };

        this.saveToLocalStorage();
        return true;
    }

    // Toggle task completion status
    toggleTaskCompletion(id) {
        const task = this.getTask(id);
        if (!task) return false;

        task.completed = !task.completed;
        this.saveToLocalStorage();
        return true;
    }

    // Delete a task
    deleteTask(id) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex === -1) return false;

        this.tasks.splice(taskIndex, 1);
        this.saveToLocalStorage();
        return true;
    }

    // Clear all completed tasks
    clearCompletedTasks() {
        this.tasks = this.tasks.filter(task => !task.completed);
        this.saveToLocalStorage();
    }

    // Get filtered and sorted tasks
    getFilteredTasks() {
        return this.tasks
            .filter(task => {
                // Filter by status
                if (this.filters.status === 'active' && task.completed) return false;
                if (this.filters.status === 'completed' && !task.completed) return false;

                // Filter by priority
                if (this.filters.priority !== 'all' && task.priority !== this.filters.priority) return false;

                // Filter by category
                if (this.filters.category !== 'all' && task.category !== this.filters.category) return false;

                return true;
            })
            .sort((a, b) => {
                // Sort tasks
                switch (this.sortBy) {
                    case 'due-date':
                        // Handle null due dates (put them at the end)
                        if (!a.dueDate && !b.dueDate) return 0;
                        if (!a.dueDate) return 1;
                        if (!b.dueDate) return -1;
                        return new Date(a.dueDate) - new Date(b.dueDate);
                    
                    case 'priority':
                        const priorityOrder = { high: 0, medium: 1, low: 2 };
                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                    
                    case 'alphabetical':
                        return a.title.localeCompare(b.title);
                    
                    case 'date-added':
                    default:
                        return new Date(a.createdAt) - new Date(b.createdAt);
                }
            });
    }

    // Update filters
    setFilter(filterType, value) {
        this.filters[filterType] = value;
    }

    // Update sort method
    setSortMethod(method) {
        this.sortBy = method;
    }

    // Get task statistics
    getStats() {
        const now = new Date();
        
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;
        const overdue = this.tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            return new Date(task.dueDate) < now;
        }).length;

        return { total, completed, pending, overdue };
    }

    // Generate task suggestions based on existing tasks
    generateSuggestions() {
        const suggestions = [];
        const categories = {};
        const words = new Set();
        
        // Analyze existing tasks
        this.tasks.forEach(task => {
            // Count categories
            categories[task.category] = (categories[task.category] || 0) + 1;
            
            // Collect words from task titles
            task.title.split(/\s+/).forEach(word => {
                if (word.length > 3) {
                    words.add(word.toLowerCase());
                }
            });
        });
        
        // Find most common category
        let topCategory = 'personal';
        let maxCount = 0;
        for (const [category, count] of Object.entries(categories)) {
            if (count > maxCount) {
                maxCount = count;
                topCategory = category;
            }
        }
        
        // Generate suggestions based on patterns
        if (words.has('meeting') || words.has('call')) {
            suggestions.push({
                title: 'Schedule follow-up meeting',
                category: 'work',
                priority: 'medium'
            });
        }
        
        if (words.has('report') || words.has('document')) {
            suggestions.push({
                title: 'Review documentation',
                category: 'work',
                priority: 'medium'
            });
        }
        
        if (words.has('buy') || words.has('purchase') || words.has('shopping')) {
            suggestions.push({
                title: 'Create shopping list',
                category: 'personal',
                priority: 'low'
            });
        }
        
        if (words.has('exercise') || words.has('workout') || words.has('gym')) {
            suggestions.push({
                title: 'Plan weekly workout routine',
                category: 'health',
                priority: 'high'
            });
        }
        
        if (words.has('learn') || words.has('study') || words.has('course')) {
            suggestions.push({
                title: 'Research online learning resources',
                category: 'education',
                priority: 'medium'
            });
        }
        
        // Add generic suggestions
        suggestions.push({
            title: `Organize ${topCategory} tasks`,
            category: topCategory,
            priority: 'medium'
        });
        
        suggestions.push({
            title: 'Set goals for next week',
            category: 'personal',
            priority: 'high'
        });
        
        // Return 3-5 suggestions
        return suggestions.slice(0, Math.min(5, suggestions.length));
    }

    // Save tasks to localStorage
    saveToLocalStorage() {
        localStorage.setItem('sonnet37-tasks', JSON.stringify(this.tasks));
        localStorage.setItem('sonnet37-currentId', this.currentId.toString());
    }

    // Load tasks from localStorage
    loadFromLocalStorage() {
        const savedTasks = localStorage.getItem('sonnet37-tasks');
        const savedId = localStorage.getItem('sonnet37-currentId');
        
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        }
        
        if (savedId) {
            this.currentId = parseInt(savedId, 10);
        }
    }
}

// UI Manager Class - Handles DOM interactions
class UIManager {
    constructor(taskManager) {
        this.taskManager = taskManager;
        this.initElements();
        this.initEventListeners();
        this.renderTasks();
        this.updateStats();
        this.loadThemePreference();
    }

    // Initialize DOM element references
    initElements() {
        // Forms
        this.taskForm = document.getElementById('task-form');
        this.taskInput = document.getElementById('task-input');
        this.taskDueDate = document.getElementById('task-due-date');
        this.taskPriority = document.getElementById('task-priority');
        this.taskCategory = document.getElementById('task-category');
        
        // Task list
        this.tasksList = document.getElementById('tasks-list');
        
        // Filters and sorting
        this.filterStatus = document.getElementById('filter-status');
        this.filterPriority = document.getElementById('filter-priority');
        this.filterCategory = document.getElementById('filter-category');
        this.sortBy = document.getElementById('sort-by');
        
        // Action buttons
        this.clearCompletedBtn = document.getElementById('clear-completed');
        this.generateSuggestionsBtn = document.getElementById('generate-suggestions');
        
        // Suggestions panel
        this.suggestionsPanel = document.getElementById('suggestions-panel');
        this.suggestionsList = document.getElementById('suggestions-list');
        this.closeSuggestionsBtn = document.getElementById('close-suggestions');
        
        // Edit modal
        this.taskEditModal = document.getElementById('task-edit-modal');
        this.editTaskForm = document.getElementById('edit-task-form');
        this.editTaskInput = document.getElementById('edit-task-input');
        this.editTaskDueDate = document.getElementById('edit-task-due-date');
        this.editTaskPriority = document.getElementById('edit-task-priority');
        this.editTaskCategory = document.getElementById('edit-task-category');
        this.editTaskNotes = document.getElementById('edit-task-notes');
        this.deleteTaskBtn = document.getElementById('delete-task');
        this.closeModalBtn = document.getElementById('close-modal');
        
        // Stats
        this.totalTasksEl = document.getElementById('total-tasks');
        this.completedTasksEl = document.getElementById('completed-tasks');
        this.pendingTasksEl = document.getElementById('pending-tasks');
        this.overdueTasksEl = document.getElementById('overdue-tasks');
        
        // Theme toggle
        this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    }

    // Initialize event listeners
    initEventListeners() {
        // Add task form submission
        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddTask();
        });
        
        // Filter and sort changes
        this.filterStatus.addEventListener('change', () => this.handleFilterChange('status', this.filterStatus.value));
        this.filterPriority.addEventListener('change', () => this.handleFilterChange('priority', this.filterPriority.value));
        this.filterCategory.addEventListener('change', () => this.handleFilterChange('category', this.filterCategory.value));
        this.sortBy.addEventListener('change', () => this.handleSortChange(this.sortBy.value));
        
        // Action buttons
        this.clearCompletedBtn.addEventListener('click', () => this.handleClearCompleted());
        this.generateSuggestionsBtn.addEventListener('click', () => this.handleGenerateSuggestions());
        this.closeSuggestionsBtn.addEventListener('click', () => this.toggleSuggestionsPanel(false));
        
        // Edit modal
        this.closeModalBtn.addEventListener('click', () => this.toggleEditModal(false));
        this.editTaskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUpdateTask();
        });
        this.deleteTaskBtn.addEventListener('click', () => this.handleDeleteTask());
        
        // Theme toggle
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        
        // Close modal when clicking outside
        this.taskEditModal.addEventListener('click', (e) => {
            if (e.target === this.taskEditModal) {
                this.toggleEditModal(false);
            }
        });
        
        // Enable drag and drop for tasks
        this.initDragAndDrop();
    }

    // Handle adding a new task
    handleAddTask() {
        const title = this.taskInput.value.trim();
        if (!title) return;
        
        const taskData = {
            title,
            dueDate: this.taskDueDate.value || null,
            priority: this.taskPriority.value,
            category: this.taskCategory.value
        };
        
        this.taskManager.addTask(taskData);
        this.taskInput.value = '';
        this.taskDueDate.value = '';
        this.taskPriority.value = 'medium';
        this.taskCategory.value = 'personal';
        
        this.renderTasks();
        this.updateStats();
    }

    // Handle updating a task
    handleUpdateTask() {
        if (this.taskManager.editingTaskId === null) return;
        
        const updatedData = {
            title: this.editTaskInput.value.trim(),
            dueDate: this.editTaskDueDate.value || null,
            priority: this.editTaskPriority.value,
            category: this.editTaskCategory.value,
            notes: this.editTaskNotes.value.trim()
        };
        
        this.taskManager.updateTask(this.taskManager.editingTaskId, updatedData);
        this.toggleEditModal(false);
        this.renderTasks();
        this.updateStats();
    }

    // Handle deleting a task
    handleDeleteTask() {
        if (this.taskManager.editingTaskId === null) return;
        
        this.taskManager.deleteTask(this.taskManager.editingTaskId);
        this.toggleEditModal(false);
        this.renderTasks();
        this.updateStats();
    }

    // Handle toggling task completion
    handleToggleCompletion(id) {
        this.taskManager.toggleTaskCompletion(id);
        this.renderTasks();
        this.updateStats();
    }

    // Handle clearing completed tasks
    handleClearCompleted() {
        this.taskManager.clearCompletedTasks();
        this.renderTasks();
        this.updateStats();
    }

    // Handle filter changes
    handleFilterChange(filterType, value) {
        this.taskManager.setFilter(filterType, value);
        this.renderTasks();
    }

    // Handle sort method changes
    handleSortChange(method) {
        this.taskManager.setSortMethod(method);
        this.renderTasks();
    }

    // Handle generating task suggestions
    handleGenerateSuggestions() {
        const suggestions = this.taskManager.generateSuggestions();
        this.renderSuggestions(suggestions);
        this.toggleSuggestionsPanel(true);
    }

    // Handle adding a suggested task
    handleAddSuggestion(suggestion) {
        this.taskManager.addTask(suggestion);
        this.renderTasks();
        this.updateStats();
    }

    // Open edit modal for a task
    openEditModal(id) {
        const task = this.taskManager.getTask(id);
        if (!task) return;
        
        this.taskManager.editingTaskId = id;
        
        this.editTaskInput.value = task.title;
        this.editTaskDueDate.value = task.dueDate || '';
        this.editTaskPriority.value = task.priority;
        this.editTaskCategory.value = task.category;
        this.editTaskNotes.value = task.notes || '';
        
        this.toggleEditModal(true);
    }

    // Toggle edit modal visibility
    toggleEditModal(show) {
        if (show) {
            this.taskEditModal.classList.remove('hidden');
            setTimeout(() => {
                this.taskEditModal.classList.add('visible');
            }, 10);
        } else {
            this.taskEditModal.classList.remove('visible');
            setTimeout(() => {
                this.taskEditModal.classList.add('hidden');
                this.taskManager.editingTaskId = null;
            }, 300);
        }
    }

    // Toggle suggestions panel visibility
    toggleSuggestionsPanel(show) {
        if (show) {
            this.suggestionsPanel.classList.remove('hidden');
            this.suggestionsPanel.classList.add('fade-in');
        } else {
            this.suggestionsPanel.classList.add('hidden');
            this.suggestionsPanel.classList.remove('fade-in');
        }
    }

    // Render the task list
    renderTasks() {
        const filteredTasks = this.taskManager.getFilteredTasks();
        this.tasksList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            this.tasksList.innerHTML = `
                <div class="empty-state">
                    <p>No tasks match your filters</p>
                </div>
            `;
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.tasksList.appendChild(taskElement);
        });
    }

    // Create a task list item element
    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.dataset.id = task.id;
        taskElement.draggable = true;
        
        // Check if task is overdue
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        
        // Format due date
        let formattedDueDate = '';
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            formattedDueDate = dueDate.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });
        }
        
        taskElement.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}">
                ${task.completed ? '<i class="fas fa-check"></i>' : ''}
            </div>
            <div class="task-content">
                <div class="task-title">${this.escapeHtml(task.title)}</div>
                <div class="task-meta">
                    ${task.dueDate ? `
                        <span class="task-due-date ${isOverdue ? 'overdue' : ''}">
                            <i class="fas fa-calendar-alt"></i> ${formattedDueDate}
                        </span>
                    ` : ''}
                    <span class="task-priority ${task.priority}">
                        ${this.getPriorityIcon(task.priority)} ${this.capitalizeFirst(task.priority)}
                    </span>
                    <span class="task-category ${task.category}">
                        ${this.getCategoryIcon(task.category)} ${this.capitalizeFirst(task.category)}
                    </span>
                </div>
            </div>
            <div class="task-actions">
                <button class="task-action-btn edit-btn" data-id="${task.id}">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        const checkbox = taskElement.querySelector('.task-checkbox');
        checkbox.addEventListener('click', () => {
            this.handleToggleCompletion(task.id);
        });
        
        const editBtn = taskElement.querySelector('.edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openEditModal(task.id);
        });
        
        // Double-click to edit
        taskElement.addEventListener('dblclick', () => {
            this.openEditModal(task.id);
        });
        
        return taskElement;
    }

    // Render task suggestions
    renderSuggestions(suggestions) {
        this.suggestionsList.innerHTML = '';
        
        if (suggestions.length === 0) {
            this.suggestionsList.innerHTML = `
                <div class="empty-state">
                    <p>No suggestions available</p>
                </div>
            `;
            return;
        }
        
        suggestions.forEach(suggestion => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'suggestion-item';
            
            suggestionElement.innerHTML = `
                <div class="suggestion-text">${this.escapeHtml(suggestion.title)}</div>
                <button class="add-suggestion-btn" data-title="${this.escapeHtml(suggestion.title)}" data-priority="${suggestion.priority}" data-category="${suggestion.category}">
                    <i class="fas fa-plus"></i> Add
                </button>
            `;
            
            const addBtn = suggestionElement.querySelector('.add-suggestion-btn');
            addBtn.addEventListener('click', () => {
                this.handleAddSuggestion({
                    title: suggestion.title,
                    priority: suggestion.priority,
                    category: suggestion.category
                });
            });
            
            this.suggestionsList.appendChild(suggestionElement);
        });
    }

    // Update statistics display
    updateStats() {
        const stats = this.taskManager.getStats();
        
        this.totalTasksEl.textContent = stats.total;
        this.completedTasksEl.textContent = stats.completed;
        this.pendingTasksEl.textContent = stats.pending;
        this.overdueTasksEl.textContent = stats.overdue;
    }

    // Initialize drag and drop functionality
    initDragAndDrop() {
        let draggedTask = null;
        
        this.tasksList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-item')) {
                draggedTask = e.target;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', e.target.dataset.id);
            }
        });
        
        this.tasksList.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-item')) {
                e.target.classList.remove('dragging');
                draggedTask = null;
            }
        });
        
        this.tasksList.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (!draggedTask) return;
            
            const taskItems = Array.from(this.tasksList.querySelectorAll('.task-item:not(.dragging)'));
            const targetTask = taskItems.find(task => {
                const rect = task.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                return e.clientY < midY;
            });
            
            if (targetTask) {
                this.tasksList.insertBefore(draggedTask, targetTask);
            } else if (taskItems.length > 0) {
                this.tasksList.appendChild(draggedTask);
            }
        });
    }

    // Toggle between light and dark themes
    toggleTheme() {
        const body = document.body;
        const isDarkMode = body.classList.contains('dark-mode');
        
        if (isDarkMode) {
            body.classList.remove('dark-mode');
            localStorage.setItem('sonnet37-theme', 'light');
        } else {
            body.classList.add('dark-mode');
            localStorage.setItem('sonnet37-theme', 'dark');
        }
    }

    // Load theme preference from localStorage
    loadThemePreference() {
        const savedTheme = localStorage.getItem('sonnet37-theme');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
    }

    // Helper: Get priority icon
    getPriorityIcon(priority) {
        switch (priority) {
            case 'high': return '<i class="fas fa-arrow-up"></i>';
            case 'medium': return '<i class="fas fa-minus"></i>';
            case 'low': return '<i class="fas fa-arrow-down"></i>';
            default: return '';
        }
    }

    // Helper: Get category icon
    getCategoryIcon(category) {
        switch (category) {
            case 'personal': return '<i class="fas fa-user"></i>';
            case 'work': return '<i class="fas fa-briefcase"></i>';
            case 'health': return '<i class="fas fa-heartbeat"></i>';
            case 'education': return '<i class="fas fa-graduation-cap"></i>';
            case 'other': return '<i class="fas fa-tag"></i>';
            default: return '';
        }
    }

    // Helper: Capitalize first letter
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Helper: Escape HTML to prevent XSS
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const taskManager = new TaskManager();
    const uiManager = new UIManager(taskManager);
    
    // Add some sample tasks if there are none
    if (taskManager.tasks.length === 0) {
        taskManager.addTask({
            title: 'Welcome to Sonnet 3.7 Task Manager!',
            priority: 'high',
            category: 'personal',
            notes: 'This is a sample task to help you get started. Try adding your own tasks, filtering, and using the suggestions feature!'
        });
        
        taskManager.addTask({
            title: 'Try the dark mode feature',
            priority: 'medium',
            category: 'personal',
            dueDate: new Date(Date.now() + 86400000).toISOString() // Tomorrow
        });
        
        taskManager.addTask({
            title: 'Explore task filtering and sorting',
            priority: 'low',
            category: 'education'
        });
        
        uiManager.renderTasks();
        uiManager.updateStats();
    }
});