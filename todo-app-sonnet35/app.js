class SonnetTasks {
    constructor() {
        this.tasks = [];
        this.completedTasks = [];
        this.initializeElements();
        this.initializeEventListeners();
        this.loadFromLocalStorage();
        this.initializeAnalytics();
        this.updateUI();
    }

    initializeElements() {
        // Input elements
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTask');
        this.smartSuggestions = document.getElementById('smartSuggestions');

        // List containers
        this.tasksContainer = document.getElementById('tasksContainer');
        this.completedContainer = document.getElementById('completedContainer');

        // Counters
        this.taskCount = document.getElementById('taskCount');
        this.completedCount = document.getElementById('completedCount');

        // Controls
        this.viewToggle = document.getElementById('viewToggle');
        this.analyticsBtn = document.getElementById('analyticsBtn');
        this.analyticsPanel = document.getElementById('analyticsPanel');
        this.keyboardShortcuts = document.getElementById('keyboardShortcuts');
    }

    initializeEventListeners() {
        // Task input handling
        this.taskInput.addEventListener('input', () => this.handleInput());
        this.taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                this.addTask();
            }
        });
        this.addTaskBtn.addEventListener('click', () => this.addTask());

        // View controls
        this.viewToggle.addEventListener('click', () => this.toggleView());
        this.analyticsBtn.addEventListener('click', () => this.toggleAnalytics());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Drag and drop
        this.initializeDragAndDrop();
    }

    handleInput() {
        const input = this.taskInput.value.trim();
        if (input.length > 0) {
            const suggestions = this.generateSuggestions(input);
            this.showSuggestions(suggestions);
        } else {
            this.hideSuggestions();
        }
    }

    generateSuggestions(input) {
        const suggestions = [];
        
        // Date suggestions
        const dateMatch = input.match(/\b(today|tomorrow|next|on)\b/i);
        if (dateMatch) {
            suggestions.push('Add due date tag: #due');
        }

        // Priority suggestions
        if (input.length > 10 && !input.includes('@')) {
            suggestions.push('Add priority: @high, @medium, or @low');
        }

        // Category suggestions
        if (!input.includes('#')) {
            suggestions.push('Add category: #work, #personal, or #shopping');
        }

        return suggestions;
    }

    showSuggestions(suggestions) {
        if (suggestions.length > 0) {
            this.smartSuggestions.innerHTML = suggestions
                .map(s => `<div class="suggestion">${s}</div>`)
                .join('');
            this.smartSuggestions.classList.add('active');
        } else {
            this.hideSuggestions();
        }
    }

    hideSuggestions() {
        this.smartSuggestions.classList.remove('active');
        this.smartSuggestions.innerHTML = '';
    }

    parseTaskInput(input) {
        const tags = input.match(/#\w+/g) || [];
        const priority = input.match(/@\w+/g) || [];
        const dueDate = this.parseDueDate(input);
        
        // Remove tags and priority from title
        let title = input
            .replace(/#\w+/g, '')
            .replace(/@\w+/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        return {
            id: Date.now(),
            title,
            tags,
            priority: priority[0] || '@medium',
            dueDate,
            created: new Date(),
            completed: null
        };
    }

    parseDueDate(input) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (input.includes('today')) {
            return today;
        } else if (input.includes('tomorrow')) {
            return tomorrow;
        }

        // Add more natural language date parsing here
        return null;
    }

    addTask() {
        const input = this.taskInput.value.trim();
        if (input) {
            const task = this.parseTaskInput(input);
            this.tasks.push(task);
            this.saveToLocalStorage();
            this.updateUI();
            this.taskInput.value = '';
            this.hideSuggestions();
            this.updateAnalytics();
        }
    }

    createTaskElement(task) {
        const div = document.createElement('div');
        div.className = 'task-item';
        div.draggable = true;
        div.dataset.taskId = task.id;

        div.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-actions">
                    <button class="icon-btn" onclick="app.toggleTaskComplete(${task.id})">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="icon-btn" onclick="app.deleteTask(${task.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="task-meta">
                ${task.tags.map(tag => `<span class="task-tag">${tag}</span>`).join('')}
                <span class="task-tag">${task.priority}</span>
                ${task.dueDate ? `<span class="task-tag">Due: ${task.dueDate.toLocaleDateString()}</span>` : ''}
            </div>
        `;

        return div;
    }

    toggleTaskComplete(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            const task = this.tasks[taskIndex];
            this.tasks.splice(taskIndex, 1);
            task.completed = new Date();
            this.completedTasks.push(task);
            this.saveToLocalStorage();
            this.updateUI();
            this.updateAnalytics();
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.completedTasks = this.completedTasks.filter(t => t.id !== taskId);
        this.saveToLocalStorage();
        this.updateUI();
        this.updateAnalytics();
    }

    initializeDragAndDrop() {
        const dragStart = (e) => {
            e.target.classList.add('dragging');
        };

        const dragEnd = (e) => {
            e.target.classList.remove('dragging');
        };

        const dragOver = (e) => {
            e.preventDefault();
            const draggable = document.querySelector('.dragging');
            const container = e.target.closest('.tasks-wrapper');
            if (container && draggable) {
                const afterElement = this.getDragAfterElement(container, e.clientY);
                if (afterElement) {
                    container.insertBefore(draggable, afterElement);
                } else {
                    container.appendChild(draggable);
                }
            }
        };

        [this.tasksContainer, this.completedContainer].forEach(container => {
            container.addEventListener('dragover', dragOver);
        });

        document.addEventListener('dragstart', dragStart);
        document.addEventListener('dragend', dragEnd);
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    toggleView() {
        document.querySelector('.lists-container').classList.toggle('compact');
        this.viewToggle.querySelector('i').classList.toggle('fa-columns');
        this.viewToggle.querySelector('i').classList.toggle('fa-list');
    }

    toggleAnalytics() {
        this.analyticsPanel.classList.toggle('active');
        this.updateAnalytics();
    }

    initializeAnalytics() {
        this.categoryChart = new Chart(document.getElementById('categoryChart'), {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#6366f1',
                        '#8b5cf6',
                        '#ec4899',
                        '#f43f5e',
                        '#f97316'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        this.trendsChart = new Chart(document.getElementById('trendsChart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Tasks Completed',
                    data: [],
                    borderColor: '#6366f1',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    updateAnalytics() {
        if (!this.analyticsPanel.classList.contains('active')) return;

        // Update productivity score
        const totalTasks = this.tasks.length + this.completedTasks.length;
        const completionRate = totalTasks ? (this.completedTasks.length / totalTasks) * 100 : 0;
        document.getElementById('productivityScore').textContent = Math.round(completionRate);

        // Update category distribution
        const categories = {};
        [...this.tasks, ...this.completedTasks].forEach(task => {
            task.tags.forEach(tag => {
                categories[tag] = (categories[tag] || 0) + 1;
            });
        });

        this.categoryChart.data.labels = Object.keys(categories);
        this.categoryChart.data.datasets[0].data = Object.values(categories);
        this.categoryChart.update();

        // Update completion trends
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toLocaleDateString();
        }).reverse();

        const completionsByDay = {};
        this.completedTasks.forEach(task => {
            const day = new Date(task.completed).toLocaleDateString();
            completionsByDay[day] = (completionsByDay[day] || 0) + 1;
        });

        this.trendsChart.data.labels = last7Days;
        this.trendsChart.data.datasets[0].data = last7Days.map(day => completionsByDay[day] || 0);
        this.trendsChart.update();
    }

    handleKeyboardShortcuts(e) {
        if (e.altKey) {
            switch (e.key) {
                case 'a':
                    this.toggleAnalytics();
                    break;
                case 'v':
                    this.toggleView();
                    break;
                case '?':
                    this.keyboardShortcuts.classList.toggle('active');
                    break;
            }
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('sonnetTasks', JSON.stringify({
            tasks: this.tasks,
            completedTasks: this.completedTasks
        }));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('sonnetTasks');
        if (saved) {
            const { tasks, completedTasks } = JSON.parse(saved);
            this.tasks = tasks;
            this.completedTasks = completedTasks;
        }
    }

    updateUI() {
        // Update task lists
        this.tasksContainer.innerHTML = '';
        this.completedContainer.innerHTML = '';

        this.tasks.forEach(task => {
            this.tasksContainer.appendChild(this.createTaskElement(task));
        });

        this.completedTasks.forEach(task => {
            this.completedContainer.appendChild(this.createTaskElement(task));
        });

        // Update counters
        this.taskCount.textContent = this.tasks.length;
        this.completedCount.textContent = this.completedTasks.length;
    }
}

// Initialize the application
const app = new SonnetTasks();