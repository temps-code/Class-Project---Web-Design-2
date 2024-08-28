document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('costosChart').getContext('2d');
    let projects = JSON.parse(localStorage.getItem('projects')) || [];

    // Procesar los datos para el gráfico
    let projectNames = [];
    let cumulativeCosts = [];

    projects.forEach(project => {
        projectNames.push(project.name);
        let totalCost = project.tasks.reduce((sum, task) => sum + parseFloat(task.cost || 0), 0);
        cumulativeCosts.push(totalCost);
    });

    // Crear el gráfico de línea
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: projectNames,
            datasets: [{
                label: 'Costos Acumulados',
                data: cumulativeCosts,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Costo en $'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Proyectos'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Costos Acumulados por Proyecto'
                }
            }
        }
    });
});
