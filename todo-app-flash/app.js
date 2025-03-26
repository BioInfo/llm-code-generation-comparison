document.addEventListener('DOMContentLoaded', function() {
    // Variable to store the currently dragged item
    let draggedItem = null;

    const taskInput = document.getElementById('taskInput');
    // Get references to the input elements and the add task button
    const priorityInput = document.getElementById('priorityInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const categoryInput = document.getElementById('categoryInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    addTaskBtn.addEventListener('click', function() {
        // Event listener for the add task button
        const taskText = taskInput.value.trim();
        const priority = priorityInput.value;
        const dueDate = dueDateInput.value;
        const category = categoryInput.value.trim();

        if (taskText !== '') {
            addTask(taskText, priority, dueDate, category);
            taskInput.value = '';
            priorityInput.value = 'low';
            dueDateInput.value = '';
            categoryInput.value = '';
        }
    });

    function addTask(taskText, priority, dueDate, category) {
        // Function to add a new task to the list
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span class="task-text">${taskText}</span>
            <span class="priority">Priority: ${priority}</span>
            <span class="due-date">Due: ${dueDate}</span>
            <span class="category">Category: ${category}</span>
            <button class="delete-btn">Delete</button>
        `;

        taskList.appendChild(listItem);

        const deleteBtn = listItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function() {
            listItem.remove();
        });

        listItem.addEventListener('click', function(event) {
            // Event listener to toggle the 'completed' class on a task item
            if (event.target.tagName !== 'BUTTON') {
                listItem.classList.toggle('completed');
            }
        });

        listItem.setAttribute('draggable', true);
        listItem.addEventListener('dragstart', function(event) {
            // Event listener for the drag start event
            draggedItem = listItem;
            listItem.classList.add('dragging');
        });

        // Event listener for the drag end event
        listItem.addEventListener('dragend', function() {
            listItem.classList.remove('dragging');
            draggedItem = null;
        });
    }

    taskList.addEventListener('dragover', function(event) {
        // Event listener for the drag over event on the task list
        event.preventDefault();
    });

    taskList.addEventListener('drop', function(event) {
        event.preventDefault();
        // Event listener for the drop event on the task list
        const afterElement = getDragAfterElement(taskList, event.clientY);
        if (afterElement == null) {
            taskList.appendChild(draggedItem);
        } else {
            taskList.insertBefore(draggedItem, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        // Function to determine the element after which the dragged item should be inserted
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
});