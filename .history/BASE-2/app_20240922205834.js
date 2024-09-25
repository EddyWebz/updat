document.getElementById('admin-update-form').addEventListener('submit', function(event) {
    event.preventDefault();  // Previene el envío del formulario

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validaciones simples en el frontend
    if (!email || !password) {
        alert('Por favor, ingresa ambos campos.');
        return;
    }

    // Realizar la solicitud al backend para actualizar los datos
    fetch('/admin/update', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Datos actualizados exitosamente.');
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error al actualizar:', error);
    });
});
