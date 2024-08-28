document.addEventListener('DOMContentLoaded', function () {
    const selectProject = document.getElementById('selectProject');
    const taskForm = document.getElementById('taskForm');
    const kanbanColumns = {
        porHacer: document.getElementById('porHacer').querySelector('.card-body'),
        enProceso: document.getElementById('enProceso').querySelector('.card-body'),
        hecho: document.getElementById('hecho').querySelector('.card-body'),
    };

    let projects = JSON.parse(localStorage.getItem('projects')) || [];

    function populateProjects() {
        selectProject.innerHTML = '<option value="" disabled selected>Selecciona un proyecto</option>';
        projects.forEach((project, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = project.name;
            selectProject.appendChild(option);
        });
    }

    function loadTasks() {
        const projectIndex = selectProject.value;
        if (projectIndex !== "") {
            const project = projects[projectIndex];
            renderTasks(project.tasks);
        }
    }

    function renderTasks(tasks) {
        Object.values(kanbanColumns).forEach(column => column.innerHTML = '');
    
        tasks.forEach(task => {
            const taskCard = createTaskElement(task);
            taskCard.classList.add('fade-in'); // Agrega la clase de animación
            kanbanColumns[task.status].appendChild(taskCard);
    
            // Elimina la clase de animación después de que termine
            setTimeout(() => taskCard.classList.remove('fade-in'), 300);
        });
    }
    

    function createTaskElement(task) {
        const taskCard = document.createElement('div');
        taskCard.className = 'card mb-2';
        taskCard.draggable = true;
        taskCard.id = `task-${task.id}`;
        taskCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${task.title}</h5>
                <p><strong>Descripción:</strong> ${task.description}</p>
                <p><strong>Costo:</strong> $${task.cost}</p>
                <p><strong>Fecha Límite:</strong> ${task.deadline}</p>
                <button class="btn btn-warning btn-sm me-2" onclick="editTask(${task.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">Eliminar</button>
            </div>
        `;
        taskCard.addEventListener('dragstart', dragStart);
        return taskCard;
    }

    function saveTasks(projectIndex, tasks) {
        projects[projectIndex].tasks = tasks;
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    function taskExists(tasks, title, status) {
        return tasks.some(task => task.title === title && task.status === status);
    }

    taskForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const projectIndex = selectProject.value;
        if (projectIndex === "") {
            return;
        }

        const taskId = document.getElementById('taskId').value;
        const newTask = {
            id: taskId ? parseInt(taskId) : Date.now(),
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            cost: document.getElementById('taskCost').value,
            deadline: document.getElementById('taskDeadline').value,
            status: document.getElementById('taskStatus').value,
        };

        const project = projects[projectIndex];
        if (taskId) {
            const taskIndex = project.tasks.findIndex(task => task.id === newTask.id);
            if (taskIndex > -1) {
                project.tasks[taskIndex] = newTask;
            }
        } else {
            if (taskExists(project.tasks, newTask.title, newTask.status)) {
                alert("Ya existe una tarea con el mismo título en el estado seleccionado.");
                return;
            }
            project.tasks.push(newTask);
        }

        saveTasks(projectIndex, project.tasks);
        renderTasks(project.tasks);

        taskForm.reset();
        document.getElementById('taskId').value = '';
        bootstrap.Modal.getInstance(document.getElementById('taskModal')).hide();
    });

    window.editTask = function (taskId) {
        const projectIndex = selectProject.value;
        if (projectIndex === "") return;

        const project = projects[projectIndex];
        const task = project.tasks.find(t => t.id === taskId);
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskCost').value = task.cost;
        document.getElementById('taskDeadline').value = task.deadline;
        document.getElementById('taskStatus').value = task.status;
        new bootstrap.Modal(document.getElementById('taskModal')).show();
    };

    window.deleteTask = function(taskId) {
        const projectIndex = selectProject.value;
        if (projectIndex === "") return;
    
        const project = projects[projectIndex];
        const task = project.tasks.find(task => task.id === taskId);
    
        if (task) {
            const confirmMessage = `¿Estás seguro de que quieres eliminar la tarea: "${task.title}"?`;
            if (confirm(confirmMessage)) {
                const taskElement = document.getElementById(`task-${taskId}`);
                taskElement.classList.add('fade-out');
    
                // Espera a que la animación termine antes de eliminar el elemento del DOM
                setTimeout(() => {
                    project.tasks = project.tasks.filter(task => task.id !== taskId);
                    saveTasks(projectIndex, project.tasks);
                    renderTasks(project.tasks);
                }, 300);
            }
        }
    };    

    function dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.id);
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function drop(e) {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        const taskElement = document.getElementById(id);
        const column = e.target.closest('.col-12.col-md-4');
        if (column && taskElement) {
            column.querySelector('.card-body').appendChild(taskElement);

            // Actualizar el estado de la tarea
            const taskId = parseInt(id.replace('task-', ''));
            const projectIndex = selectProject.value;
            if (projectIndex !== "") {
                const project = projects[projectIndex];
                const task = project.tasks.find(task => task.id === taskId);
                if (task) {
                    task.status = column.id;
                    saveTasks(projectIndex, project.tasks);
                }
            }
        }
    }

    document.getElementById('taskModal').addEventListener('hidden.bs.modal', function () {
        taskForm.reset();
        document.getElementById('taskId').value = '';
    });

    selectProject.addEventListener('change', loadTasks);

    Object.values(kanbanColumns).forEach(column => {
        column.addEventListener('dragover', dragOver);
        column.addEventListener('drop', drop);
    });

    populateProjects();
    loadTasks(); // Cargar las tareas cuando se carga la página
});

document.getElementById('addTaskButton').addEventListener('click', function (e) {
    const projectIndex = selectProject.value;
    if (projectIndex === "") {
        alert("Por favor, selecciona un proyecto antes de agregar una tarea.");
    } else {
        // Abre el modal manualmente si se ha seleccionado un proyecto
        const taskModal = new bootstrap.Modal(document.getElementById('taskModal'));
        taskModal.show();
    }
});

