// Selecciona el botón de inicio de sesión
const signInButton = document.getElementById('signIn');

// Selecciona el botón de registro
const signUpButton = document.getElementById('signUp');

// Selecciona el botón para cambiar a la vista de inicio de sesión
const switchToSignInButton = document.getElementById('switchToSignIn');

// Selecciona el botón para cambiar a la vista de registro
const switchToSignUpButton = document.getElementById('switchToSignUp');

// Selecciona el contenedor principal
const container = document.getElementById('container');

// Agrega un event listener al botón de inicio de sesión
signInButton.addEventListener('click', () => {
    console.log('SignIn button clicked'); // Depuración
    container.classList.remove('right-panel-active'); // Remueve la clase que activa el panel derecho
});

// Agrega un event listener al botón de registro
signUpButton.addEventListener('click', () => {
    console.log('SignUp button clicked'); // Depuración
    container.classList.add('right-panel-active'); // Añade la clase que activa el panel derecho
});

// Agrega un event listener al botón para cambiar a la vista de inicio de sesión
switchToSignInButton.addEventListener('click', () => {
    console.log('Switch to SignIn button clicked'); // Depuración
    container.classList.remove('right-panel-active'); // Remueve la clase que activa el panel derecho
});

// Agrega un event listener al botón para cambiar a la vista de registro
switchToSignUpButton.addEventListener('click', () => {
    console.log('Switch to SignUp button clicked'); // Depuración
    container.classList.add('right-panel-active'); // Añade la clase que activa el panel derecho
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
    fetch('/register', {
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
    fetch('/login', {
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
    .then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Inicio de sesión exitoso',
            text: 'Bienvenido de nuevo!'
        }).then(() => {
            // Redirigir al dashboard después del inicio de sesión exitoso
            window.location.href = '../privado/cuerpo.html'; // Ajusta esta ruta según tu estructura de proyecto
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

// Validar la fuerza de la contraseña
function validarPassword(password) {
    // Mínimo 8 caracteres, al menos una letra, un número y un símbolo especial
    const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return re.test(password);
}
