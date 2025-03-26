// Todo Application with Enhanced Features
// Demonstrating DeepSeek AI capabilities in creating sophisticated web applications

class TodoApp {
    constructor() {
        this.tasks = [];
        this.initElements();
        this.initEventListeners();
        this.initTheme();
        this.loadTasks();
        this.updateStats();
    }

    // Initialize DOM elements
    initElements() {
        this.elements = {
            taskInput: document.getElementById('task-input'),
            addTaskBtn: document.getElementById('add-task-btn'),
            taskList: document.getElementById('task-list'),
            searchInput: document.getElementById('search-input'),
            filterButtons: document.querySelectorAll('.filter-btn'),
            categorySelect: document.getElementById('category-select'),
            dueDate: document.getElementById('due-date'),
            prioritySelect: document.getElementById('priority-select'),
            themeSwitch: document.getElementById('theme-switch'),
            totalTasks: document.getElementById('total-tasks'),
            completedTasks: document.getElementById('completed-tasks'),
            urgentTasks: document.getElementById('urgent-tasks')
        };
    }

    // Set up event listeners
    initEventListeners() {
        // Add task event
        this.elements.addTaskBtn.addEventListener('click', () => this.addTask());
        this.elements.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filter events
        this.elements.searchInput.addEventListener('input', () => this.filterTasks());
        this.elements.filterButtons.forEach(button => {
            button.addEventListener('click', () => this.handleFilterClick(button));
        });

        // Theme toggle
        this.elements.themeSwitch.addEventListener('change', () => this.toggleTheme());
    }

    // Initialize theme from localStorage
    initTheme() {
        const savedTheme = localStorage.getItem('todo-theme') || 'light';
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.elements.themeSwitch.checked = true;
        }
    }

    // Toggle between light/dark theme
    toggleTheme() {
        if (this.elements.themeSwitch.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('todo-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('todo-theme', 'light');
        }
    }

    // Add a new task
    addTask() {
        const text = this.elements.taskInput.value.trim();
        if (!text) return;

        const today = new Date().toISOString().split('T')[0];
        
        const task = {
            id: Date.now(),
            text,
            completed: false,
            category: this.elements.categorySelect.value,
            priority: this.elements.prioritySelect.value,
            dueDate: this.elements.dueDate.value || null,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTask(task);
        this.updateStats();
        
        // Reset input
        this.elements.taskInput.value = '';
        this.elements.taskInput.focus();
        this.elements.dueDate.value = '';
        this.elements.categorySelect.value = 'general';
        this.elements.prioritySelect.value = 'medium';

        // Play add sound
        this.playSound('add');
    }

    // Render a single task
    renderTask(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.setAttribute('data-id', task.id);
        taskElement.setAttribute('data-category', task.category);
        taskElement.setAttribute('data-priority', task.priority);
        taskElement.setAttribute('data-due', task.dueDate || '');

        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate && dueDate < new Date() && !task.completed;
        
        taskElement.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <div class="task-text">${task.text}</div>
                <div class="task-meta">
                    <span class="task-category ${task.category}">${task.category}</span>
                    <span class="task-priority ${task.priority}">${task.priority} priority</span>
                    ${task.dueDate ? `
                        <span class="task-due ${isOverdue ? 'overdue' : ''}">
                            <i class="far fa-calendar-alt"></i>
                            ${dueDate.toLocaleDateString()}
                        </span>
                    ` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="task-btn edit"><i class="far fa-edit"></i></button>
                <button class="task-btn delete"><i class="far fa-trash-alt"></i></button>
            </div>
        `;

        // Add event listeners for the new task
        const checkbox = taskElement.querySelector('.task-checkbox');
        const editBtn = taskElement.querySelector('.task-btn.edit');
        const deleteBtn = taskElement.querySelector('.task-btn.delete');

        checkbox.addEventListener('change', () => this.toggleTaskComplete(task.id, checkbox.checked));
        editBtn.addEventListener('click', () => this.editTask(task.id));
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

        this.elements.taskList.appendChild(taskElement);
    }

    // Toggle task completion status
    toggleTaskComplete(id, completed) {
        if (completed) {
            this.playSound('complete');
        }

        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = completed;
            this.saveTasks();
            this.updateStats();
            
            const taskElement = document.querySelector(`.task-item[data-id="${id}"]`);
            if (taskElement) {
                taskElement.classList.toggle('completed', completed);
            }
        }
    }

    // Edit task text
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;
        
        const taskElement = document.querySelector(`.task-item[data-id="${id}"]`);
        const taskText = taskElement.querySelector('.task-text');
        
        const currentText = task.text;
        const newText = prompt('Edit your task:', currentText);
        
        if (newText && newText.trim() !== currentText) {
            task.text = newText.trim();
            taskText.textContent = task.text;
            this.saveTasks();
            this.playSound('edit');
        }
    }

    // Delete a task
    deleteTask(id) {
        if (!confirm('Are you sure you want to delete this task?')) return;
        
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        
        const taskElement = document.querySelector(`.task-item[data-id="${id}"]`);
        if (taskElement) {
            taskElement.classList.add('deleting');
            setTimeout(() => {
                taskElement.remove();
                this.updateStats();
                this.playSound('delete');
            }, 300);
        }
    }

    // Filter tasks based on search and active filter
    filterTasks() {
        const searchTerm = this.elements.searchInput.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        const today = new Date().toISOString().split('T')[0];
        const weekLater = new Date();
        weekLater.setDate(weekLater.getDate() + 7);
        const weekLaterStr = weekLater.toISOString().split('T')[0];
        
        document.querySelectorAll('.task-item').forEach(taskEl => {
            const taskId = parseInt(taskEl.dataset.id);
            const task = this.tasks.find(t => t.id === taskId);
            if (!task) return;
            
            let matchesSearch = task.text.toLowerCase().includes(searchTerm);
            let matchesFilter = true;
            
            switch (activeFilter) {
                case 'today':
                    matchesFilter = task.dueDate === today;
                    break;
                case 'week':
                    matchesFilter = task.dueDate && task.dueDate <= weekLaterStr && task.dueDate >= today;
                    break;
                case 'high':
                    matchesFilter = task.priority === 'high';
                    break;
            }
            
            taskEl.style.display = (matchesSearch && matchesFilter) ? 'flex' : 'none';
        });
    }

    // Handle filter button clicks
    handleFilterClick(button) {
        this.elements.filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.filterTasks();
    }

    // Update statistics
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const urgent = this.tasks.filter(t => 
            t.priority === 'high' && !t.completed && 
            (t.dueDate ? new Date(t.dueDate) <= new Date(new Date().setDate(new Date().getDate() + 3)) : false)
        ).length;
        
        this.elements.totalTasks.textContent = total;
        this.elements.completedTasks.textContent = completed;
        this.elements.urgentTasks.textContent = urgent;
    }

    // Play sound effects
    playSound(action) {
        // In a real app, we would play audio files here
        // For this demo, we'll just log the sound action
        console.log(`Playing ${action} sound effect`);
    }

    // Save tasks to localStorage
    saveTasks() {
        localStorage.setItem('todo-tasks', JSON.stringify(this.tasks));
    }

    // Load tasks from localStorage
    loadTasks() {
        const savedTasks = localStorage.getItem('todo-tasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
            this.tasks.forEach(task => this.renderTask(task));
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const todoApp = new TodoApp();
    
    // Set today's date as min for due date picker
    document.getElementById('due-date').min = new Date().toISOString().split('T')[0];
    
    // Make tasks sortable (drag and drop)
    new Sortable(document.getElementById('task-list'), {
        animation: 150,
        handle: '.task-content',
        onEnd: () => {
            // In a real app, we would save the new order
            console.log('Tasks reordered');
        }
    });
});