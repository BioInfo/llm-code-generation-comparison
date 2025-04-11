class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';

        this.initEventListeners();
        this.renderTasks();
    }

    addTask(task) {
        const newTask = {
            id: Date.now(),
            text: task.text,
            category: task.category,
            priority: parseInt(task.priority),
            dueDate: task.dueDate,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks = this.sortTasks([...this.tasks, newTask]);
        this.updateLocalStorage();
        this.renderTasks();
    }

    sortTasks(tasks) {
        return tasks.sort((a, b) => {
            const priorityDiff = b.priority - a.priority;
            const dateDiff = new Date(a.dueDate) - new Date(b.dueDate);
            return priorityDiff || dateDiff;
        });
    }

    createTaskElement(task) {
        const taskEl = document.createElement('div');
        taskEl.className = `task-card priority-${task.priority}`;
        taskEl.innerHTML = `
            <div class="priority-marker" style="background-color: ${this.getPriorityColor(task.priority)}"></div>
            <div class="task-content">
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                <span class="category-tag">${task.category}</span>
                <span class="due-date">${new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
            <div class="task-actions">
                <button class="edit-btn"><i class="fas fa-edit"></i></button>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;
        return taskEl;
    }

    getPriorityColor(priority) {
        const colors = [null, 'var(--low)', 'var(--medium)', 'var(--high)', 'var(--urgent)'];
        return colors[priority];
    }

    initEventListeners() {
        document.getElementById('addTask').addEventListener('click', () => {
            const taskInput = document.getElementById('taskInput');
            const categorySelect = document.getElementById('categorySelect');
            const prioritySelect = document.getElementById('prioritySelect');
            const dueDate = document.getElementById('dueDate');

            this.addTask({
                text: taskInput.value,
                category: categorySelect.value,
                priority: prioritySelect.value,
                dueDate: dueDate.value
            });

            taskInput.value = '';
            dueDate.value = '';
        });
    }

    renderTasks() {
        const taskContainer = document.getElementById('taskContainer');
        taskContainer.innerHTML = '';

        this.tasks.forEach(task => {
            if (this.currentFilter === 'all' || task.category === this.currentFilter) {
                taskContainer.appendChild(this.createTaskElement(task));
            }
        });
    }

    updateLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
}

new TaskManager();