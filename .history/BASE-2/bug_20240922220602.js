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
    fetch('/admin', {
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

    //RUTA PARA CERRAR SESION
    document.getElementById('logout-button').addEventListener('click', async () => {
        try {
            const response = await fetch('/auth/logout', {
                method: 'POST',
                credentials: 'include',  // Incluye las cookies en la petición
            });
    
            if (response.ok) {
                alert('Sesión cerrada exitosamente');
                window.location.href = '/login';  // Redirigir al login
            } else {
                alert('Error al cerrar sesión');
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            alert('Hubo un problema al intentar cerrar la sesión');
        }
    });
    
});
