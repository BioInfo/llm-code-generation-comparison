/*
  OpenAI o3 To-Do App Script
  This JavaScript file implements the interactive functionality of the sophisticated
  single-page to-do application, showcasing smart task management features and creative
  interactive elements.
*/

document.addEventListener('DOMContentLoaded', () => {
  // Array to store tasks
  let tasks = [];

  // DOM Elements
  const taskForm = document.getElementById('taskForm');
  const taskNameInput = document.getElementById('taskName');
  const dueDateInput = document.getElementById('dueDate');
  const prioritySelect = document.getElementById('priority');
  const tasksContainer = document.getElementById('tasksContainer');
  const sortByDateBtn = document.getElementById('sortByDate');
  const sortByPriorityBtn = document.getElementById('sortByPriority');
  const searchTaskInput = document.getElementById('searchTask');
  const suggestTaskBtn = document.getElementById('suggestTaskBtn');

  // Predefined task suggestions (simulate smart suggestion feature)
  const taskSuggestions = [
    "Review project proposal",
    "Plan weekly meeting",
    "Refactor codebase",
    "Research new technologies",
    "Write documentation"
  ];

  // Utility function to generate a unique identifier
  function generateId() {
    return Date.now().toString();
  }

  // Render tasks to the DOM
  function renderTasks() {
    // Clear current tasks
    tasksContainer.innerHTML = '';

    // Filter tasks based on search query
    const filterText = searchTaskInput.value.toLowerCase();
    const filteredTasks = tasks.filter(task => task.name.toLowerCase().includes(filterText));

    filteredTasks.forEach(task => {
      // Create task container
      const taskDiv = document.createElement('div');
      taskDiv.classList.add('task-item');

      // Create details container
      const detailsDiv = document.createElement('div');
      detailsDiv.classList.add('task-details');

      // Checkbox for completion status
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.addEventListener('change', () => {
        task.completed = checkbox.checked;
        renderTasks();
      });
      detailsDiv.appendChild(checkbox);

      // Create task information container
      const infoDiv = document.createElement('div');
      infoDiv.classList.add('task-info');

      const taskName = document.createElement('span');
      taskName.classList.add('name');
      taskName.textContent = task.name;
      if (task.completed) {
        taskName.style.textDecoration = 'line-through';
      }
      infoDiv.appendChild(taskName);

      const meta = document.createElement('span');
      meta.classList.add('meta');
      meta.textContent = `Due: ${task.dueDate ? task.dueDate : "No date"} | Priority: ${task.priority}`;
      infoDiv.appendChild(meta);

      detailsDiv.appendChild(infoDiv);
      taskDiv.appendChild(detailsDiv);

      // Delete button for the task
      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('task-delete');
      deleteBtn.textContent = '✕';
      deleteBtn.addEventListener('click', () => {
        removeTask(task.id);
      });
      taskDiv.appendChild(deleteBtn);

      tasksContainer.appendChild(taskDiv);
    });
  }

  // Function to add a new task
  function addTask(name, dueDate, priority) {
    const newTask = {
      id: generateId(),
      name: name,
      dueDate: dueDate,
      priority: priority,
      completed: false
    };
    tasks.push(newTask);
    renderTasks();
  }

  // Function to remove a task by id
  function removeTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    renderTasks();
  }

  // Handle task submission
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = taskNameInput.value.trim();
    if (!name) return;
    addTask(name, dueDateInput.value, prioritySelect.value);
    taskForm.reset();
  });

  // Sort tasks by due date
  sortByDateBtn.addEventListener('click', () => {
    tasks.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
    renderTasks();
  });

  // Sort tasks by priority (high -> normal -> low)
  sortByPriorityBtn.addEventListener('click', () => {
    const priorityOrder = { high: 1, normal: 2, low: 3 };
    tasks.sort((a, b) => {
      return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
    });
    renderTasks();
  });

  // Update tasks based on search input
  searchTaskInput.addEventListener('input', () => {
    renderTasks();
  });

  // Smart suggestion: fill task name input with a random suggestion
  suggestTaskBtn.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * taskSuggestions.length);
    taskNameInput.value = taskSuggestions[randomIndex];
  });

  // Initial render of tasks
  renderTasks();
});