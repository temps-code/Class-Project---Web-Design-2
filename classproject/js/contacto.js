document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Obtén los valores del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const mensaje = document.getElementById('mensaje').value.trim();

        // Verifica que todos los campos estén llenos
        if (nombre === '' || email === '' || mensaje === '') {
            alert('Por favor, completa todos los campos.');
            return;
        }

        // Muestra un mensaje de éxito
        alert(`Gracias por contactarnos, ${nombre}. Te responderemos a ${email} lo antes posible.`);

        // Limpia el formulario
        contactForm.reset();
    });
});
