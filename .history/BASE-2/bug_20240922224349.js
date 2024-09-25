document.addEventListener('DOMContentLoaded', () => {


    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validaciones simples en el frontend
    if (!email || !password) {
        alert('Por favor, ingresa ambos campos.');
        return;
    }
    async function checkAuthentication() {
        try {
            const response = await fetch('/api/auth-check', {
                method: 'GET',
                credentials: 'include'  // Incluir las cookies en la petición
            });
    
            const result = await response.json();
            console.log('Respuesta del backend en /api/auth-check:', result);
    
            if (!result.authenticated) {
                window.location.href = '/login';  // Redirigir al login si no está autenticado
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error al verificar la autenticación:', error);
            window.location.href = '/login';  // Redirigir en caso de error
            return false;
        }
    }

    //FUNCION  MODIFICAR - ACTUALIZAR DATOS ADMINISTRADOR
    document.getElementById('admin-update-form').addEventListener('submit', async function(event) {
        const isAuthenticated = await checkAuthentication();
        if (!isAuthenticated) return;  // Redirige si no está autenticado
        // event.preventDefault();  // Previene el envío del formulario


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
});

    //RUTA PARA CERRAR SESION
    document.getElementById('logout-button').addEventListener('click', async () => {
        try {
            const response = await fetch('/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Asegura que se envíen las cookies
            });
    
            if (response.ok) {
                alert('Sesión cerrada correctamente');
                window.location.href = '/login'; // Redirigir al login después de cerrar sesión
            } else {
                alert('Error al cerrar sesión');
            }
        } catch (error) {
            console.error('Error al intentar cerrar sesión:', error);
        }
    });
    
})

