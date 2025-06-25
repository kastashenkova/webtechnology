document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('taskList');
    const openAddTaskModalBtn = document.getElementById('openAddTaskModal');
    const addTaskInput = document.querySelector('.add-task-input');
    const taskModal = document.getElementById('taskModal');
    const closeTaskModalBtn = document.getElementById('closeTaskModal');
    const cancelTaskButton = document.getElementById('cancelTaskButton');
    const taskForm = document.getElementById('taskForm');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDueDateInput = document.getElementById('taskDueDate');
    const submitTaskButton = document.getElementById('submitTaskButton');

    const sortFilterDropdown = document.getElementById('sort-filter');
    const taskFilterDropdown = document.getElementById('task-filter');

    const dateFilterModal = document.getElementById('dateFilterModal');
    const closeDateFilterModalBtn = document.getElementById('closeDateFilterModal');
    const dateFilterCategorySelect = document.getElementById('dateFilterCategorySelect');
    const specificDateInputGroup = document.getElementById('specificDateInputGroup');
    const specificDateFilterInput = document.getElementById('specificDateFilter');
    const applyDateFilterButton = document.getElementById('applyDateFilterButton');

    const openReportModalBtn = document.getElementById('openReportModal');
    const reportModal = document.getElementById('reportModal');
    const closeReportModalBtn = document.getElementById('closeReportModal');

    let tasks = [];

    let editingTaskElement = null;
    let currentActiveDateFilter = { type: 'all', referenceDate: null };

    function openModal(modalElement) {
        modalElement.style.visibility = 'visible';
        modalElement.style.opacity = '1';
        modalElement.querySelector('.modal-content').style.transform = 'translateY(0)';
    }

    function closeModal(modalElement) {
        modalElement.style.visibility = 'hidden';
        modalElement.style.opacity = '0';
        modalElement.querySelector('.modal-content').style.transform = 'translateY(20px)';
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('uk-UA', options);
    }

    function isTaskUnique(title, dueDate, excludeTaskId = null) {
        const lowerCaseTitle = title.toLowerCase();
        return !tasks.some(task =>
            task.title.toLowerCase() === lowerCaseTitle &&
            task.dueDate === dueDate &&
            task.id !== excludeTaskId
        );
    }

    function createTaskElement(task) {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');
        if (task.completed) {
            taskItem.classList.add('completed');
        }
        taskItem.dataset.id = task.id;
        taskItem.dataset.date = task.dueDate;
        taskItem.dataset.priority = task.priority;
        taskItem.dataset.completed = task.completed;

        taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-details">
                <input type="text" value="${task.title}" class="task-text-input" readonly>
                <span class="task-date">${formatDate(task.dueDate)}</span>
                <div class="task-meta">
                    <span class="task-priority ${task.priority}">${
                        task.priority === 'high' ? 'Високий' :
                        task.priority === 'medium' ? 'Середній' : 'Низький'
                    }</span>
                </div>
            </div>
            <div class="task-actions">
                <span class="delete-icon"><i class="fas fa-trash-alt"></i></span>
            </div>
        `;
        return taskItem;
    }

    function renderTasks(tasksToRender) {
        taskList.innerHTML = '';

        const pendingTasks = tasksToRender.filter(task => !task.completed);
        const completedTasks = tasksToRender.filter(task => task.completed);

        pendingTasks.forEach(task => {
            const taskItem = createTaskElement(task);
            taskList.appendChild(taskItem);
        });

        completedTasks.forEach(task => {
            const taskItem = createTaskElement(task);
            taskList.appendChild(taskItem);
        });
    }

    function addTask(title, dueDate, priority) {
        if (!isTaskUnique(title, dueDate)) {
            alert('Завдання з такою назвою та датою вже існує!');
            return false;
        }

        const newTask = {
            id: Date.now().toString(),
            title: title,
            dueDate: dueDate,
            priority: priority,
            completed: false
        };
        tasks.push(newTask);
        applyFiltersAndSort();
        return true;
    }

    function updateTask(id, newTitle, newDueDate, newPriority) {
        if (!isTaskUnique(newTitle, newDueDate, id)) {
            alert('Завдання з такою назвою та датою вже існує!');
            return false;
        }

        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex > -1) {
            tasks[taskIndex].title = newTitle;
            tasks[taskIndex].dueDate = newDueDate;
            tasks[taskIndex].priority = newPriority;
            applyFiltersAndSort();
            return true;
        }
        return false;
    }

    function toggleTaskCompletion(id) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex > -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            applyFiltersAndSort();
        }
    }

    function deleteTask(id) {
        if (confirm('Ви впевнені, що хочете видалити це завдання?')) {
            tasks = tasks.filter(task => task.id !== id);
            applyFiltersAndSort();
        }
    }

    function sortTasks(tasksToSort, sortBy) {
        let sortedTasks = [...tasksToSort];

        if (sortBy === 'date') {
            sortedTasks.sort((a, b) => {
                if (a.completed && !b.completed) return 1;
                if (!a.completed && b.completed) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
        } else if (sortBy === 'name') {
            sortedTasks.sort((a, b) => {
                if (a.completed && !b.completed) return 1;
                if (!a.completed && b.completed) return -1;
                return a.title.localeCompare(b.title);
            });
        } else if (sortBy === 'priority') {
            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            sortedTasks.sort((a, b) => {
                if (a.completed && !b.completed) return 1;
                if (!a.completed && b.completed) return -1;
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
        }
        return sortedTasks;
    }

    function filterTasks(allTasks, filterBy) {
        let filteredTasks = [...allTasks];

        if (filterBy === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        } else if (filterBy === 'pending') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        } else if (filterBy === 'high' || filterBy === 'medium' || filterBy === 'low') {
            filteredTasks = filteredTasks.filter(task => task.priority === filterBy);
        }
        return filteredTasks;
    }

    function filterTasksByReferenceDate(allTasks, filterType, referenceDateString) {
        if (filterType === 'all' || !referenceDateString) {
            return allTasks;
        }

        const referenceDate = new Date(referenceDateString);
        referenceDate.setHours(0, 0, 0, 0);

        return allTasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            taskDate.setHours(0, 0, 0, 0);

            if (filterType === 'current') {
                return taskDate.getTime() === referenceDate.getTime();
            } else if (filterType === 'upcoming') {
                return taskDate.getTime() > referenceDate.getTime();
            } else if (filterType === 'past') {
                return taskDate.getTime() < referenceDate.getTime();
            }
            return true;
        });
    }

    function applyFiltersAndSort() {
        let currentTasks = [...tasks];

        const currentGeneralFilter = taskFilterDropdown.value;
        if (currentGeneralFilter !== 'all' && currentGeneralFilter !== 'filterDate') {
            currentTasks = filterTasks(currentTasks, currentGeneralFilter);
        }

        if (currentActiveDateFilter.type !== 'all' && currentActiveDateFilter.referenceDate) {
            currentTasks = filterTasksByReferenceDate(currentTasks, currentActiveDateFilter.type, currentActiveDateFilter.referenceDate);
        }

        const currentSort = sortFilterDropdown.value;
        currentTasks = sortTasks(currentTasks, currentSort);

        renderTasks(currentTasks);
    }

    openAddTaskModalBtn.addEventListener('click', () => {
        openModal(taskModal);
        document.getElementById('modalTitle').textContent = 'Додати завдання';
        submitTaskButton.textContent = 'Додати завдання';
        taskForm.reset();
        editingTaskElement = null;
        if (addTaskInput.value.trim() !== '') {
            taskTitleInput.value = addTaskInput.value.trim();
            addTaskInput.value = '';
        }
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        taskDueDateInput.value = `${yyyy}-${mm}-${dd}`;
    });

    closeTaskModalBtn.addEventListener('click', () => closeModal(taskModal));
    cancelTaskButton.addEventListener('click', () => closeModal(taskModal));
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeModal(taskModal);
        }
    });

    closeDateFilterModalBtn.addEventListener('click', () => closeModal(dateFilterModal));
    dateFilterModal.addEventListener('click', (e) => {
        if (e.target === dateFilterModal) {
            closeModal(dateFilterModal);
        }
    });

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = taskTitleInput.value.trim();
        const dueDate = taskDueDateInput.value;
        const priority = document.querySelector('input[name="taskPriority"]:checked').value;

        if (title && dueDate) {
            let success = false;
            if (editingTaskElement) {
                success = updateTask(editingTaskElement.dataset.id, title, dueDate, priority);
                if (success) {
                    editingTaskElement = null;
                }
            } else {
                success = addTask(title, dueDate, priority);
            }
            if (success) {
                closeModal(taskModal);
                taskForm.reset();
            }
        } else {
            alert('Будь ласка, заповніть усі поля!');
        }
    });

    taskList.addEventListener('click', (e) => {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;

        const taskId = taskItem.dataset.id;

        if (e.target.classList.contains('task-checkbox')) {
            toggleTaskCompletion(taskId);
        }

        if (e.target.closest('.delete-icon')) {
            deleteTask(taskId);
        }
    });

    taskList.addEventListener('dblclick', (e) => {
        const taskTextInput = e.target.closest('.task-text-input');
        if (taskTextInput) {
            taskTextInput.readOnly = false;
            taskTextInput.focus();
            taskTextInput.select();
            editingTaskElement = taskTextInput.closest('.task-item');
        }
    });

    taskList.addEventListener('blur', (e) => {
        const taskTextInput = e.target.closest('.task-text-input');
        if (taskTextInput && !taskTextInput.readOnly) {
            taskTextInput.readOnly = true;
            const taskItem = taskTextInput.closest('.task-item');
            const taskId = taskItem.dataset.id;
            const originalTask = tasks.find(task => task.id === taskId);
            const originalTitle = originalTask?.title;
            const originalDueDate = originalTask?.dueDate;
            const originalPriority = originalTask?.priority;

            const newTitle = taskTextInput.value.trim();

            if (originalTitle !== newTitle) {
                if (!isTaskUnique(newTitle, originalDueDate, taskId)) {
                    alert('Завдання з такою назвою та датою вже існує!');
                    taskTextInput.value = originalTitle;
                } else {
                    if (originalTask) {
                        updateTask(taskId, newTitle, originalDueDate, originalPriority);
                    }
                }
            }
            editingTaskElement = null;
        }
    }, true);

    taskList.addEventListener('keypress', (e) => {
        const taskTextInput = e.target.closest('.task-text-input');
        if (taskTextInput && e.key === 'Enter') {
            taskTextInput.blur();
        }
    });

    sortFilterDropdown.addEventListener('change', () => {
        applyFiltersAndSort();
    });

    taskFilterDropdown.addEventListener('change', () => {
        if (taskFilterDropdown.value === 'filterDate') {
            openModal(dateFilterModal);
            dateFilterCategorySelect.value = currentActiveDateFilter.type;
            specificDateFilterInput.value = currentActiveDateFilter.referenceDate || '';
            specificDateInputGroup.style.display = 'block';
            specificDateFilterInput.setAttribute('required', 'true');
        } else {
            currentActiveDateFilter = { type: 'all', referenceDate: null };
            applyFiltersAndSort();
        }
    });

    dateFilterCategorySelect.addEventListener('change', () => {
        specificDateInputGroup.style.display = 'block';
        specificDateFilterInput.setAttribute('required', 'true');
    });

    applyDateFilterButton.addEventListener('click', () => {
        const filterType = dateFilterCategorySelect.value;
        const referenceDate = specificDateFilterInput.value;

        if (!referenceDate) {
            alert('Будь ласка, оберіть дату!');
            return;
        }

        currentActiveDateFilter = { type: filterType, referenceDate: referenceDate };
        closeModal(dateFilterModal);
        applyFiltersAndSort();
    });


    // --- WebDataRocks Integration ---
    openReportModalBtn.addEventListener('click', () => {
        openModal(reportModal);
        renderWebDataRocks();
    });

    closeReportModalBtn.addEventListener('click', () => closeModal(reportModal));
    reportModal.addEventListener('click', (e) => {
        if (e.target === reportModal) {
            closeModal(reportModal);
        }
    });

    function renderWebDataRocks() {
    const dataForReport = tasks.map(task => ({
        Title: task.title,
        'Due Date': task.dueDate,
        Priority: task.priority === 'high' ? 'Високий' :
                  task.priority === 'medium' ? 'Середній' : 'Низький',
        Completed: task.completed ? 'Так' : 'Ні'
    }));

    const pivot = new WebDataRocks({
        container: "#webdatarocks-container",
        toolbar: true,
        report: {
            dataSource: {
                data: dataForReport
            },
            slice: {
                rows: [
                    {
                        uniqueName: "Due Date.Year",
                        sort: "asc" // Сортуємо роки за зростанням
                    },
                    {
                        uniqueName: "Due Date.Month",
                        sort: "asc" // Сортуємо місяці за зростанням
                    },
                    {
                        uniqueName: "Due Date.Day",
                        sort: "asc" // Сортуємо дні за зростанням
                    },
                    { uniqueName: "Priority" }
                ],
                columns: [
                    { uniqueName: "Completed" }
                ],
                measures: [
                    { uniqueName: "Title", aggregation: "count" }
                ]
            },
            options: {
                grid: {
                    type: "flat"
                }
            },
            mapping: {
                "Due Date": {
                    type: "date"
                }
            },
            formats: [{
                name: "Date",
                type: "date",
                datePattern: "MMMM Sylvester"
            }],
            localization: "https://cdn.webdatarocks.com/latest/localization/uk.json"
        }
    });
}

    // --- End WebDataRocks Integration ---

    async function loadTasksFromJson() {
        try {
            const response = await fetch('tasks.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            tasks = await response.json();
            applyFiltersAndSort();
        } catch (error) {
            console.error('Не вдалося завантажити завдання:', error);
            alert('Не вдалося завантажити початкові завдання. Будь ласка, спробуйте пізніше.');
            applyFiltersAndSort();
        }
    }

    loadTasksFromJson();
});