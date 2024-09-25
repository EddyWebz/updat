document.addEventListener('DOMContentLoaded', () => {

    // Evento para el formulario de actualización de datos de admin
    document.getElementById('admin-update-form').addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // Validaciones de seguridad para la contraseña
        if (!email || !password) {
            alert('Por favor, ingresa ambos campos.');
            return;
        }

        // Autenticación antes de enviar la solicitud
        async function checkAuthentication() {
            try {
                const response = await fetch('/api/auth-check', {
                    method: 'GET',
                    credentials: 'include'
                });

                const result = await response.json();

                if (!result.authenticated) {
                    window.location.href = '/login';
                    return false;
                }
                return true;
            } catch (error) {
                console.error('Error al verificar la autenticación:', error);
                window.location.href = '/login';
                return false;
            }
        }

        const isAuthenticated = await checkAuthentication();
        if (!isAuthenticated) return;

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

// Evento para el formulario de registro de usuarios
document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const nombre = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const role = document.getElementById('register-role').value;  // Obtener el valor del rol

    // Validación de campos vacíos
    if (!nombre || !email || !password || !role) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    // Validación del formato de email
    if (!validarEmail(email)) {
        alert('Por favor, ingresa un email válido.');
        return;
    }

    // Validación de la fuerza de la contraseña
    if (!validarPassword(password)) {
        alert('La contraseña debe tener al menos 8 caracteres, incluyendo una letra, un número y un símbolo especial.');
        return;
    }

    // Si todas las validaciones son correctas, se envía el formulario
    fetch('/admin/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, email, password, role })  // Incluir el rol en el cuerpo de la solicitud
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Registro exitoso.');
            document.getElementById('register-form').reset();
        } else {
            alert('Error: ' + data.message);  // Mostrar mensaje de error específico
        }
    })
    .catch(error => {
        console.error('Error al registrar:', error);
        alert('Error en la conexión al servidor.');
    });
});

    // Evento para cerrar sesión
    document.getElementById('logout-button').addEventListener('click', async () => {
        try {
            const response = await fetch('/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.ok) {
                alert('Sesión cerrada correctamente');
                window.location.href = '/login';
            } else {
                alert('Error al cerrar sesión');
            }
        } catch (error) {
            console.error('Error al intentar cerrar sesión:', error);
        }
    });
});

// Validación del formato de email
function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validación de la fuerza de la contraseña
function validarPassword(password) {
    const re = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return re.test(password);
}
