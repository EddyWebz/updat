// Manejo del formulario de inicio de sesión
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Previene el envío del formulario para manejarlo manualmente con JavaScript

    const email = document.getElementById('login-email').value.trim(); // Obtiene y recorta el valor del campo de email
    const password = document.getElementById('login-password').value.trim(); // Obtiene y recorta el valor del campo de contraseña

    // Validación de campos vacíos
    if (!email || !password) { // Si el email o la contraseña están vacíos
        Swal.fire({
            icon: 'warning', // Muestra una advertencia
            title: 'Campos vacíos', // Título del mensaje
            text: 'Por favor, completa todos los campos.' // Texto del mensaje
        });
        return; // Detiene la ejecución si hay campos vacíos
    }

    // Validación del formato de email
    if (!validarEmail(email)) { // Si el email no tiene un formato válido
        Swal.fire({
            icon: 'warning', // Muestra una advertencia
            title: 'Email inválido', // Título del mensaje
            text: 'Por favor, ingresa un email válido.' // Texto del mensaje
        });
        return; // Detiene la ejecución si el email es inválido
    }

    // Envía los datos al servidor para autenticación
    fetch('/auth/login', {
        method: 'POST', // Método HTTP para enviar los datos
        headers: {
            'Content-Type': 'application/json' // Indica que se envían datos en formato JSON
        },
        body: JSON.stringify({ email, password }) // Convierte los datos del formulario a JSON
    })
    .then(response => {
        if (!response.ok) { // Verifica si la respuesta del servidor no es exitosa
            return response.text().then(text => { throw new Error(text) }); // Lanza un error con el mensaje del servidor
        }
        return response.json(); // Asegura que obtengamos el JSON correctamente
    })
    .then(data => {
        Swal.fire({
            icon: 'success',
            title: 'Inicio de sesión exitoso',
            text: 'Bienvenido de nuevo!'
        }).then(() => {
            // Redirigir al dashboard basado en el rol
            window.location.href = data.redirect;
        });
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error de inicio de sesión',
            text: error.message // Texto del mensaje (error generado en la promesa)
        });
    });
});

// Validar el formato del email
function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
