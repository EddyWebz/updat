document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('admin-update-form').addEventListener('submit', async function(event) {
        event.preventDefault();  // Previene el envío del formulario

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // Validaciones de seguridad para la contraseña
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

            // Manejo del formulario de registro
    document.getElementById('register-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const nombre = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value.trim();

        // Validación de campos vacíos
       if (!nombre || !email || !password) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos vacíos',
                text: 'Por favor, completa todos los campos.'
            });
            return;
        }

        // Validación del formato de email
        if (!validarEmail(email)) {
            Swal.fire({
                icon: 'warning',
                title: 'Email inválido',
                text: 'Por favor, ingresa un email válido.'
            });
            return;
        }

        // Validación de la fuerza de la contraseña
        if (!validarPassword(password)) {
            Swal.fire({
                icon: 'warning',
                title: 'Contraseña débil',
                text: 'La contraseña debe tener al menos 8 caracteres, incluyendo una letra, un número y un símbolo especial.'
            });
            return;
        }

        // Si todas las validaciones son correctas, se envía el formulario
        fetch('/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, email, password })
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 409) {
                throw new Error('El correo ya está registrado');
                }
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json(); // Asegura que obtengamos el JSON correctamente
        })
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Registro exitoso',
                text: 'Te has registrado exitosamente.'
            });

            // Limpiar los campos del formulario después del registro exitoso
            document.getElementById('register-form').reset(); // Aquí se limpia el formulario
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error.message // Mostrar mensaje específico del error
            });
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
