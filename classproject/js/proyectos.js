document.addEventListener('DOMContentLoaded', function () {
    const projectForm = document.getElementById('project-form');
    const projectList = document.getElementById('project-list');
    const filterStatus = document.getElementById('filter-status');
    const filterManager = document.getElementById('filter-manager');

    // Verifica si 'projects' está en localStorage, si no, inicializa un array vacío
    let projects = JSON.parse(localStorage.getItem('projects')) || [];

    function renderProjects() {
        projectList.innerHTML = '';
        const filteredProjects = projects.filter((project) => {
            const statusFilter = filterStatus.value === 'Todos' || project.status === filterStatus.value;
            const managerFilter = project.manager.toLowerCase().includes(filterManager.value.toLowerCase());
            return statusFilter && managerFilter;
        });
    
        filteredProjects.forEach((project, index) => {
            const projectCard = document.createElement('div');
            projectCard.className = 'col-lg-4 col-md-6 mb-4 fade-in'; // Agrega la clase de animación
            projectCard.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${project.name}</h5>
                        <p><strong>Descripción:</strong> ${project.description}</p>
                        <p><strong>Encargado:</strong> ${project.manager}</p>
                        <p><strong>Presupuesto:</strong> $${project.budget}</p>
                        <p><strong>Estado:</strong> ${project.status}</p>
                        <p><strong>Fechas:</strong> ${project.startDate} - ${project.endDate}</p>
                        <button class="btn btn-warning btn-sm me-2" onclick="editProject(${index})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProject(${index})">Eliminar</button>
                    </div>
                </div>`;
            projectList.appendChild(projectCard);
    
            // Elimina la clase de animación después de que termine
            setTimeout(() => projectCard.classList.remove('fade-in'), 300);
        });
    }
    

    filterStatus.addEventListener('change', renderProjects);
    filterManager.addEventListener('input', renderProjects);

    projectForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const projectId = document.getElementById('project-id').value;
        const newProject = {
            name: document.getElementById('project-name').value,
            description: document.getElementById('project-description').value,
            manager: document.getElementById('project-manager').value,
            budget: document.getElementById('project-budget').value,
            status: document.getElementById('project-status').value,
            startDate: document.getElementById('project-start-date').value,
            endDate: document.getElementById('project-end-date').value,
            tasks: [] // Agrega una lista de tareas vacía
        };

        // Comprobar si el proyecto con el mismo nombre ya existe
        const projectExists = projects.some((project, index) => {
            return index !== parseInt(projectId) && project.name === newProject.name;
        });

        if (projectExists) {
            alert("Ya existe un proyecto con el mismo nombre.");
            return;
        }

        if (projectId) {
            projects[parseInt(projectId)] = newProject;
        } else {
            projects.push(newProject);
        }

        // Almacenar en localStorage
        localStorage.setItem('projects', JSON.stringify(projects));
        renderProjects();

        // Resetear el formulario
        projectForm.reset();
        document.getElementById('project-id').value = '';
        bootstrap.Modal.getInstance(document.getElementById('projectModal')).hide();
    });

    window.editProject = function (index) {
        const project = projects[index];
        document.getElementById('project-name').value = project.name;
        document.getElementById('project-description').value = project.description;
        document.getElementById('project-manager').value = project.manager;
        document.getElementById('project-budget').value = project.budget;
        document.getElementById('project-status').value = project.status;
        document.getElementById('project-start-date').value = project.startDate;
        document.getElementById('project-end-date').value = project.endDate;
        document.getElementById('project-id').value = index;
        new bootstrap.Modal(document.getElementById('projectModal')).show();
    };

    window.deleteProject = function (index) {
        const project = projects[index];
        if (confirm(`¿Estás seguro de que quieres eliminar el proyecto: "${project.name}"?`)) {
            const projectCard = projectList.children[index];
            projectCard.classList.add('fade-out');
    
            // Espera a que la animación termine antes de eliminar el elemento del DOM
            setTimeout(() => {
                projects.splice(index, 1);
                localStorage.setItem('projects', JSON.stringify(projects));
                renderProjects();
            }, 300);
        }
    };
    

    // Resetear el formulario al cerrar el modal
    const projectModalElement = document.getElementById('projectModal');
    projectModalElement.addEventListener('hidden.bs.modal', function () {
        projectForm.reset();
        document.getElementById('project-id').value = '';
    });

    // Cargar y renderizar proyectos al cargar la página
    renderProjects();
});
