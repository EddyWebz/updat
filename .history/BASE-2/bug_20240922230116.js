document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('admin-update-form').addEventListener('submit', async function(event) {
        event.preventDefault();  // Previene el envío del formulario
         // Asegurar que los campos de email y password estén vacíos
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // Validaciones de seguridad para la contraseña
        if (!email || !password) {
            alert('Por favor, ingresa ambos campos.');
            return;
        }

        // Reglas de seguridad para la contraseña
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            alert('La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un símbolo especial.');
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

        const isAuthenticated = await checkAuthentication();
        if (!isAuthenticated) return;  // Redirige si no está autenticado

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

    // RUTA PARA CERRAR SESIÓN
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
});
