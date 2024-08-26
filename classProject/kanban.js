let selectedProject = null;
let projects = JSON.parse(localStorage.getItem('projects')) || [];
let tareasPorProyecto = JSON.parse(localStorage.getItem('tareasPorProyecto')) || {};

// Función para crear un elemento de tarea
const crearElementoTarea = (tarea) => {
    const tareaDiv = document.createElement('div');
    tareaDiv.className = 'card tarea';
    tareaDiv.draggable = true;
    tareaDiv.dataset.id = tarea.id;
    tareaDiv.innerHTML = `
        <div class="card-body">
            <h6 class="card-title">${tarea.texto}</h6>
            <p>${tarea.descripcion}</p>
            <p><strong>Prioridad:</strong> ${tarea.priority}</p>
            <p><strong>Costo:</strong> $${tarea.cost}</p>
            <p><strong>Fecha límite:</strong> ${tarea.deadline}</p>
            <button class="btn btn-warning btn-sm me-2" onclick="editTask(${tarea.id})">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="deleteTask(${tarea.id})">Eliminar</button>
        </div>
    `;
    return tareaDiv;
};

// Inicializar el tablero de tareas para el proyecto seleccionado
const inicializarTablero = () => {
    document.querySelectorAll('.columna').forEach(columna => {
        columna.innerHTML = `<h3>${columna.dataset.title}</h3><p class="text-muted">No hay tareas en esta columna</p>`;
    });

    if (selectedProject !== null) {
        const tareas = tareasPorProyecto[selectedProject] || [];
        if (tareas.length > 0) {
            tareas.forEach(tarea => {
                const columna = document.getElementById(tarea.status);
                if (columna) {
                    columna.querySelector('.text-muted').style.display = 'none'; // Ocultar mensaje de "No hay tareas"
                    columna.appendChild(crearElementoTarea(tarea));
                }
            });
        }

        document.querySelectorAll('.tarea').forEach(tarea => {
            tarea.addEventListener('dragstart', dragStart);
            tarea.addEventListener('dragend', dragEnd);
        });

        document.querySelectorAll('.columna').forEach(columna => {
            columna.addEventListener('dragover', dragOver);
            columna.addEventListener('drop', drop);
        });
    }
};

// Drag and Drop Handlers
const dragStart = (e) => {
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
    e.target.classList.add('dragging');
};

const dragEnd = (e) => {
    e.target.classList.remove('dragging');
};

const dragOver = (e) => {
    e.preventDefault();
};

const drop = (e) => {
    e.preventDefault();
    const tareaId = e.dataTransfer.getData('text/plain');
    const tareaDiv = document.querySelector(`.tarea[data-id='${tareaId}']`);
    const columna = e.target.closest('.columna');
    columna.appendChild(tareaDiv);

    // Actualizar el estado de la tarea
    const tarea = tareasPorProyecto[selectedProject].find(t => t.id == tareaId);
    tarea.status = columna.id;
    guardarTareas();
};

// Inicializar la selección de proyecto
const inicializarSeleccionProyecto = () => {
    const selectProject = document.getElementById('selectProject');
    
    if (projects.length > 0) {
        projects.forEach((project, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = project.name;
            selectProject.appendChild(option);
        });

        selectProject.addEventListener('change', (e) => {
            selectedProject = parseInt(e.target.value);
            document.querySelector('[data-bs-target="#taskModal"]').disabled = false;
            inicializarTablero();
        });
    } else {
        selectProject.innerHTML = '<option>No hay proyectos disponibles</option>';
    }
};

// Inicializar formulario de tarea
const inicializarFormularioTarea = () => {
    const taskForm = document.getElementById('task-form');
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const tareaId = document.getElementById('task-id').value;
        const tareaNombre = document.getElementById('task-name').value.trim();

        const tareaExistente = tareasPorProyecto[selectedProject]?.find(t => t.texto === tareaNombre);
        if (tareaExistente && !tareaId) {
            alert('Ya existe una tarea con ese nombre en este proyecto.');
            return;
        }

        const nuevaTarea = {
            id: tareaId ? parseInt(tareaId) : Date.now(),
            texto: tareaNombre,
            descripcion: document.getElementById('task-description').value,
            deadline: document.getElementById('task-deadline').value,
            cost: document.getElementById('task-cost').value,
            priority: document.getElementById('task-priority').value,
            status: document.getElementById('task-status').value || 'porHacer'  // Valor predeterminado
        };

        if (tareaId) {
            const tareaIndex = tareasPorProyecto[selectedProject].findIndex(t => t.id === parseInt(tareaId));
            tareasPorProyecto[selectedProject][tareaIndex] = nuevaTarea;
        } else {
            if (!tareasPorProyecto[selectedProject]) {
                tareasPorProyecto[selectedProject] = [];
            }
            tareasPorProyecto[selectedProject].push(nuevaTarea);
        }

        guardarTareas();
        inicializarTablero();
        taskForm.reset();
        bootstrap.Modal.getInstance(document.getElementById('taskModal')).hide();
    });
};

// Guardar tareas en localStorage
const guardarTareas = () => {
    localStorage.setItem('tareasPorProyecto', JSON.stringify(tareasPorProyecto));
};

document.addEventListener('DOMContentLoaded', () => {
    inicializarSeleccionProyecto();
    inicializarFormularioTarea();
    document.querySelector('[data-bs-target="#taskModal"]').disabled = true;
});
