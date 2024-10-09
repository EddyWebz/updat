document.addEventListener('DOMContentLoaded', async () => {

       // ---- FUNCIÓN PARA VERIFICAR SI EL USUARIO ESTÁ AUTENTICADO ----
     async function checkAuthentication() {
    try {
        const response = await fetch('/api/auth-check', {
            method: 'GET',
            credentials: 'include'  // Incluir las cookies en la petición
        });

        const result = await response.json();
        console.log('Respuesta del backend en /api/auth-check:', result);  // <-- Aquí verificas la respuesta del backend

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

    // Llamar a la función de verificación de autenticación antes de cualquier otra acción
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) return;  // Detener la ejecución si no está autenticado

    // ---- CONFIGURACIÓN INICIAL ----
    function setDateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const localDatetime = `${year}-${month}-${day}T${hours}:${minutes}`;
        document.getElementById('datetime').value = localDatetime;
    }

    // Establecer la fecha y hora inicial en el campo 'datetime' cuando se carga la página
    setDateTime();

    // ---- VARIABLES ----
    const vehicleForm = document.getElementById('vehicleForm');
    const historyContent = document.getElementById('historyContent');
    const historyCards = document.getElementById('historyCards');
    const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    const searchCards = document.getElementById('searchCards');
    const imageInput = document.getElementById('image'); // Campo de imágeneS
    const fullscreenBackground = document.createElement('div'); // Creamos el fondo oscuro
fullscreenBackground.classList.add('fullscreen-background');
document.body.appendChild(fullscreenBackground); // Añadimos el fondo oscuro al cuerpo del documento
const botonhistor = document.getElementById('botonhistor');
const historySection = document.getElementById('historySection');
const registrationSection = document.getElementById('registration');
let isHistoryVisible = false;


// Función para guardar los datos del formulario con un timestamp
async function saveFormData() {
    const isAuthenticated = await checkAuthentication();  // Verificar si está autenticado antes de guardar
    if (!isAuthenticated) {
        console.log('Usuario no autenticado. No se guardarán los datos.');
        return;
    }
    // Convertir todos los campos de texto a mayúsculas antes de guardar
    document.getElementById('brand').value = document.getElementById('brand').value.toUpperCase();
    document.getElementById('model').value = document.getElementById('model').value.toUpperCase();
    document.getElementById('clave').value = document.getElementById('clave').value.toUpperCase();
    document.getElementById('plate').value = document.getElementById('plate').value.toUpperCase();
    document.getElementById('color').value = document.getElementById('color').value.toUpperCase();
    document.getElementById('owner').value = document.getElementById('owner').value.toUpperCase();

    // Crear el objeto de datos del formulario con un timestamp actual
    const formData = {
        datetime: document.getElementById('datetime').value,
        brand: document.getElementById('brand').value,
        model: document.getElementById('model').value,
        clave: document.getElementById('clave').value,
        plate: document.getElementById('plate').value,
        color: document.getElementById('color').value,
        owner: document.getElementById('owner').value,
        stayNights: document.getElementById('stayNights').value,
        habitacion: document.getElementById('habitacion').value,
        garage: document.getElementById('garage').value,
        observations: document.getElementById('observations').value,
        timestamp: Date.now()  // Guardar el timestamp del momento actual
    };

           // Guardar en el Local Storage
           localStorage.setItem('vehicleFormData', JSON.stringify(formData));
           console.log('Datos guardados en Local Storage:', formData);
}

    // ---- Convertir la función loadFormData en asíncrona ----
    async function loadFormData() {
        const savedData = localStorage.getItem('vehicleFormData');
        if (savedData) {
            const formData = JSON.parse(savedData);
            const currentTime = Date.now();

            // Verificar si los datos han expirado (más de 30 minutos)
            if (currentTime - formData.timestamp > 30 * 60 * 1000) {
                console.log("Los datos han expirado, eliminando...");
                localStorage.removeItem('vehicleFormData');
                return;
            }

            // Cargar los datos en el formulario
            console.log('Datos cargados desde Local Storage:', formData);
            document.getElementById('datetime').value = formData.datetime || '';
            document.getElementById('brand').value = formData.brand || '';
            document.getElementById('model').value = formData.model || '';
            document.getElementById('clave').value = formData.clave || '';
            document.getElementById('plate').value = formData.plate || '';
            document.getElementById('color').value = formData.color || '';
            document.getElementById('owner').value = formData.owner || '';
            document.getElementById('stayNights').value = formData.stayNights || '';
            document.getElementById('habitacion').value = formData.habitacion || '';
            document.getElementById('garage').value = formData.garage || '';
            document.getElementById('observations').value = formData.observations || '';
        } else {
            console.log("No se encontraron datos guardados.");
        }
    }

    // ---- Cargar los datos del Local Storage una vez que se autentique ----
    console.log('Cargando los datos después de la autenticación...');
    await loadFormData();  // Ahora espera a que se carguen los datos

    // ---- Eventos para guardar automáticamente los datos del formulario ----
    const formElements = document.querySelectorAll('#vehicleForm input, #vehicleForm select, #vehicleForm textarea');
    formElements.forEach(element => {
        element.addEventListener('input', saveFormData);
        element.addEventListener('change', saveFormData);
    });

    // ---- Limpiar el Local Storage al enviar el formulario ----
    document.getElementById('vehicleForm').addEventListener('submit', () => {
        localStorage.removeItem('vehicleFormData');
        console.log('Datos eliminados del Local Storage al enviar el formulario');
    });


//VARIABLE DE TRADUCCION
const translations = {
    datetime: 'Fecha y hora',
    brand: 'Marca',
    model: 'Modelo',
    clave: 'Clave',
    plate: 'Placa',
    color: 'Color',
    owner: 'Propietario',
    stayNights: 'Estancias',
    habitacion: 'Habitación',
    garage: 'Garaje',
    observations: 'Observaciones'
};

    // ---- CONVERTIR TEXTO A MAYÚSCULAS ----
    const textFields = [
        document.getElementById('brand'),
        document.getElementById('model'),
        document.getElementById('clave'),
        document.getElementById('plate'),
        document.getElementById('color'),
        document.getElementById('owner')
    ];

    // Añadir el evento input para convertir a mayúsculas en tiempo real
    textFields.forEach(field => {
        field.addEventListener('input', () => {
            field.value = field.value.toUpperCase();
        });
    });

        // ---- AUTOCOMPLETAR CAMPOS AL INGRESAR PLACA ----
    const plateInput = document.getElementById('plate'); // Campo de placa

    plateInput.addEventListener('input', async () => {
        const plate = plateInput.value.trim();
        if (plate.length > 0) { // Solo busca si hay algo en el campo de placa
            const response = await fetch(`/api/vehicle/${encodeURIComponent(plate)}`);
            const vehicle = await response.json();

            if (vehicle && !vehicle.message) {
                // Auto rellenar campos en español
                document.getElementById('brand').value = vehicle.brand || '';
                document.getElementById('model').value = vehicle.model || '';
                document.getElementById('clave').value = vehicle.clave || '';
                document.getElementById('color').value = vehicle.color || '';
                document.getElementById('owner').value = vehicle.owner || '';
            }
        }
    });




    // ---- COMPRESIÓN DE IMÁGENES AL SELECCIONAR ----
    imageInput.addEventListener('change', async (e) => {
        const isAuthenticated = await checkAuthentication();
        if (!isAuthenticated) return;  // Redirige si no está autenticado
        const files = [...e.target.files]; // Obtener las imágenes seleccionadas
        const compressedFiles = [];

        for (let file of files) {
            // Crear una promesa para cada imagen comprimida
            const compressedFile = await new Promise((resolve, reject) => {
                new Compressor(file, {
                    quality: 0.6, // Ajusta la calidad de la imagen al 60%
                    success(result) {
                        // Convertir Blob a File
                        const newFile = new File([result], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });
                        resolve(newFile); // Imagen comprimida (reducción de calidad)
                    },
                    error(err) {
                        console.error('Error al comprimir la imagen:', err);
                        reject(err);
                    },
                });
            });
            compressedFiles.push(compressedFile); // Añadir la imagen comprimida a la lista
        }

        // Aquí reemplazamos los archivos seleccionados por los comprimidos
        const dataTransfer = new DataTransfer();
        compressedFiles.forEach(file => {
            dataTransfer.items.add(file); // Añadir las imágenes comprimidas al DataTransfer
        });

        e.target.files = dataTransfer.files; // Reemplazar los archivos en el input con los comprimidos
        console.log('Imágenes comprimidas y listas para enviar:', e.target.files);
    });

    // ---- LIMITE DE IMÁGENES A 4 ----
    imageInput.addEventListener('change', () => {
        if (imageInput.files.length > 4) {
            alert('Solo puedes subir un máximo de 4 imágenes.');
            imageInput.value = '';  // Vaciar la selección
        }
    });

    // ---- FUNCIONES DE FORMATEO ----
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }


//FUNCION NUEVA EMPIEZA
let clickTimeout = false; // Variable para controlar el tiempo de espera
let lastSubmissionTime = 0; // Almacenar el tiempo del último envío

// ---- FUNCIONES PARA MANEJAR EL FORMULARIO DE REGISTRO ----
document.getElementById('vehicleForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentTime = Date.now();
    
    // Bloquear inmediatamente cualquier clic adicional antes de continuar
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton.disabled) {
        return;  // Si el botón ya está deshabilitado, ignoramos el clic
    }

    submitButton.disabled = true; // Deshabilitar el botón inmediatamente

    // Verificar si han pasado 10 segundos desde el último envío
    if (currentTime - lastSubmissionTime < 10000) {
        showNotification('Por favor, espera 10 segundos antes de enviar otro registro.', 'error');
        submitButton.disabled = false; // Volver a habilitar el botón si no ha pasado suficiente tiempo
        return;
    }

    // Bloquear clics adicionales durante 10 segundos
    if (clickTimeout) {
        return; // Ignoramos el clic si está dentro del tiempo de espera
    }

    clickTimeout = true;
    setTimeout(() => {
        clickTimeout = false; // Permitir clics nuevamente después de 10 segundos
    }, 10000);

    // Crear la barra de progreso
    const progressBar = document.createElement('div');
    progressBar.classList.add('progress-bar');
    const progressBarFill = document.createElement('div');
    progressBarFill.classList.add('progress-bar-fill');
    progressBar.appendChild(progressBarFill);
    document.getElementById('vehicleForm').appendChild(progressBar); // Añadir la barra al formulario

    const formData = new FormData(document.getElementById('vehicleForm'));

    // Configura el XHR para rastrear el progreso
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            progressBarFill.style.width = `${percentComplete}%`; // Actualiza la barra
        }
    });

    xhr.open('POST', '/api/register', true);
    
    xhr.onload = () => {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
                // Mostrar notificación de éxito
                showNotification('Registro exitoso', 'success');
                addVehicleToHistory(response.vehicle);
                document.getElementById('vehicleForm').reset();
                setDateTime(); // Restablecer el campo de fecha y hora

                // Actualizar el tiempo del último envío
                lastSubmissionTime = Date.now();
            } else {
                // Mostrar notificación de error
                showNotification(response.message || 'Error al registrar vehículo', 'error');
            }
        } else {
            showNotification('Error en la solicitud.', 'error');
        }

        // Siempre eliminar la barra de progreso y habilitar el botón
        progressBar.remove();
        submitButton.disabled = false; // Habilitar el botón para permitir nuevos registros
    };

    xhr.onerror = () => {
        showNotification('Error de conexión.', 'error');
        // En caso de error de conexión, eliminar la barra y habilitar el botón
        progressBar.remove();
        submitButton.disabled = false;
    };

    xhr.send(formData); // Envía el formulario
});

// Función de notificación
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;

    document.body.appendChild(notification); // Añadir al cuerpo del documento

    // Eliminar la notificación después de 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
//FUNCION NUEVA TERMINA

//SECCION HSITORIAL EMPIEZA
botonhistor.addEventListener('click', function () {
    if (isHistoryVisible) {
        // Mostrar la sección de registro y ocultar el historial
        historySection.style.display = 'none';
        registrationSection.style.display = 'block';
        botonhistor.textContent = 'Historial de Registros';
    } else {
        // Mostrar el historial y ocultar la sección de registro
        historySection.style.display = 'block';
        registrationSection.style.display = 'none';
        botonhistor.textContent = 'Ocultar Historial';
    }
    isHistoryVisible = !isHistoryVisible;
    if (window.innerWidth < 972) {
        dropdownContent.classList.remove('show');
        dropdownContent.classList.add('hide');
    }
});

   // ---- FUNCIONES PARA MANEJAR EL HISTORIAL ----
   toggleHistoryBtn.addEventListener('click', async () => {
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) return;  // Redirige si no está autenticado
    if (historyContent.style.display === 'none') {
        resetSearch(); // Resetear la búsqueda cuando se muestre el historial
        historyContent.style.display = 'block'; // Mostrar el historial
        loadHistory();
    } else {
        historyContent.style.display = 'none';
        resetHistory(); // Ocultar el historial si ya está visible
    }
});


    //CAMPO DE FECHA PERZONALIZADA

    
    // Capturar los elementos del DOM para las fechas de inicio y fin
const startDateInput = document.getElementById('startDate');  // Corregido: usar 'startDate'
const endDateInput = document.getElementById('endDate');      // Corregido: usar 'endDate'
// Mostrar/ocultar el campo personalizado de fecha según la opción seleccionada
const dateOption = document.getElementById('dateOption');
const customDate = document.getElementById('customDate');

    dateOption.addEventListener('change', () => {
        if (dateOption.value === 'manual') {
            customDate.style.display = 'block';  // Mostrar los campos personalizados
        } else {
            customDate.style.display = 'none';  // Ocultar los campos personalizados
        }
    });

    function getSelectedDates() {
        const option = dateOption.value;

        if (option === 'manual') {
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;
            return { startDate, endDate };
        } else {
            const today = new Date();
            let startDate;

            switch (option) {
                case '7days':
                    startDate = new Date(today.setDate(today.getDate() - 7));
                    break;
                case '15days':
                    startDate = new Date(today.setDate(today.getDate() - 15));
                    break;
                case '1month':
                    startDate = new Date(today.setMonth(today.getMonth() - 1));
                    break;
                case '2months':
                    startDate = new Date(today.setMonth(today.getMonth() - 2));
                    break;
                default:
                    startDate = new Date(today.setMonth(today.getMonth() - 1));
            }

            const endDate = new Date();
            return { startDate: startDate.toISOString().split('T')[0], endDate: endDate.toISOString().split('T')[0] };
        }
    }


    function getDefaultStartDate() {
        const today = new Date();
        const lastMonth = new Date(today.setMonth(today.getMonth() - 1));
        return lastMonth.toISOString().split('T')[0];  // Formato YYYY-MM-DD
    }




//BOTON MOSTRAR HISTORIAL
async function loadHistory() {
    const { startDate, endDate } = getSelectedDates();  // Obtener las fechas seleccionadas o por defecto
    console.log('Fechas enviadas al backend:', { startDate, endDate });

    if (!startDate || !endDate) {
        alert('Por favor, seleccione un rango de fechas.');
        return;
    }
     // Hacer la solicitud al backend con las fechas seleccionadas o por defecto
     const response = await fetch(`/api/history?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`, {
        credentials: 'include'  // Incluir las cookies en la petición
    });

    const vehicles = await response.json();

    console.log('Historial filtrado recibido:', vehicles); // Depuración

    // Mostrar el historial en la página
    historyContent.style.display = 'block';
    historyCards.innerHTML = ''; // Limpiar historial antes de cargar nuevos resultados
    vehicles.forEach(addVehicleToHistory); // Mostrar del más reciente al más antiguo
}
  // ---- FUNCIONES PARA MANEJAR EL HISTORIAL ----
// Función para agregar vehículos al historial en el frontend
function addVehicleToHistory(vehicle) {
    const card = document.createElement('div');
    card.className = 'history-card';

    for (let key in vehicle) {
        if (vehicle.hasOwnProperty(key) && key !== 'images' && key !== 'user_id' && key !== 'id' && key !== 'created_at') {
            const div = document.createElement('div');
            let value = vehicle[key];

            // Mostrar la fecha en el formato correcto
            if (key === 'datetime') {
                value = formatDate(value);  // Ya convertida a hora local desde el backend
            }

            const formattedKey = translations[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            div.innerHTML = `<span class="fixed-text">${formattedKey}:</span> <span class="data-text">${value}</span>`;
            card.appendChild(div);
        }
    }

    handleVehicleImages(vehicle, card);  // Manejo de imágenes
    historyCards.appendChild(card);
}

// Función para resetear el historial
function resetHistory() {
    historyContent.style.display = 'none'; // Ocultar el historial
}


// BUSQUEDA BOTON
    // ---- FUNCIONES DE BÚSQUEDA ----
    searchButton.addEventListener('click', async () => {
        const isAuthenticated = await checkAuthentication();
        if (!isAuthenticated) return;  // Redirige si no está autenticado
        const query = searchInput.value.trim();

        // Usar las fechas seleccionadas o predeterminadas
        const { startDate, endDate } = getSelectedDates();  // Usar la función que maneja las fechas del panel

        // Verificar que la consulta esté completa
        if (!query) {
            alert('Por favor, ingrese una consulta válida.');
            return;
        }
        resetHistory(); // Resetear el historial cuando se haga una búsqueda
        // Hacer la solicitud al backend con la búsqueda y el rango de fechas
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`, {
            credentials: 'include'  // Incluir las cookies en la petición
        });

        const vehicles = await response.json();

        console.log('Resultados de búsqueda filtrados por fecha recibidos:', vehicles); // Depuración

        searchCards.style.display = 'block';
        searchResults.innerHTML = ''; // Limpiar resultados anteriores

        if (vehicles.length === 0) {
            searchResults.innerHTML = '<p>No se encontraron resultados.</p>';
        } else {
            vehicles.forEach(vehicle => {
                const card = document.createElement('div');
                card.className = 'search-card';

                // Mostrar los detalles del vehículo
                for (let key in vehicle) {
                    if (vehicle.hasOwnProperty(key) && key !== 'images' && key !== 'user_id' && key !== 'id' && key !== 'created_at') {
                        const div = document.createElement('div');
                        let value = vehicle[key];
                        // Formato de fechas
                        if (key === 'datetime') {
                            value = formatDate(value);
                        }
                        // Formatear el nombre de la clave
                        const formattedKey = translations[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        div.textContent = `${formattedKey}: ${value}`;
                        div.innerHTML = `<span class="fixed-text">${formattedKey}:</span> <span class="data-text">${value}</span>`;
                        card.appendChild(div);
                    }
                }

                // Manejo de imágenes
                handleVehicleImages(vehicle, card);

                searchResults.appendChild(card);
            });
        }
    });


        // Función para resetear la búsqueda
function resetSearch() {
    searchInput.value = ''; // Limpiar el campo de búsqueda
    searchCards.style.display = 'none'; // Ocultar los resultados de búsqueda
}

//SECCION MANEJO DE IMAGEN 

  
    // ---- FUNCIONES DE MANEJO DE IMÁGENES ----
    function createImageElement(image) {
        const img = document.createElement('img');
        img.src = image;
        img.alt = 'Imagen del vehículo';
        img.loading = 'lazy';  // Habilitar lazy loading para optimizar la carga
        //img.addEventListener('click', () => showFullscreenImage(image));
        return img;
    }

    //FUNCION PANTALLA COMPLETA
    function handleVehicleImages(vehicle, card) {
        if (vehicle.images && Array.isArray(vehicle.images)) {
            const imageElements = vehicle.images.slice(0, 4); // Limitar a un máximo de 4 imágenes
            imageElements.forEach((image, index) => {
                const img = createImageElement(image);
                img.addEventListener('click', () => showFullscreenImages(imageElements, index));
                card.appendChild(img);
            });
        } else if (vehicle.images && typeof vehicle.images === 'string') {
            try {
                const imagesArray = JSON.parse(vehicle.images).slice(0, 4); // Limitar a 4 imágenes
                imagesArray.forEach((image, index) => {
                    const img = createImageElement(image);
                    img.addEventListener('click', () => showFullscreenImages(imagesArray, index));
                    card.appendChild(img);
                });
            } catch (error) {
                console.error('Error al parsear vehicle.images:', error);
            }
        }
    }

// ---- MODIFICAR FUNCIÓN DE IMÁGENES EN PANTALLA COMPLETA ----
let currentIndex = 0; // Índice actual de la imagen mostrada
function showFullscreenImages(images, index = 0) {
    currentIndex = index;
    const fullscreenContainer = document.createElement('div');
    fullscreenContainer.className = 'fullscreen-container';

    const fullscreenImg = document.createElement('img');
    fullscreenImg.src = images[currentIndex];
    fullscreenImg.className = 'fullscreen-img';

    // Botón para cerrar la imagen
    fullscreenImg.addEventListener('click', () => {
        document.body.removeChild(fullscreenContainer);
    });

    fullscreenContainer.appendChild(fullscreenImg);
    document.body.appendChild(fullscreenContainer);

    // ---- Crear los puntos de navegación UNA SOLA VEZ ----
     if (images.length > 1) {  // SOLO SI HAY MÁS DE DOS IMÁGENES
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'dots-container';

    images.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        if (i === currentIndex) {
            dot.classList.add('active'); // Punto activo al inicio
        }
        dot.addEventListener('click', () => {
            currentIndex = i;
            fullscreenImg.src = images[currentIndex];
            updateDots(dotsContainer); // Actualizar los puntos
        });
        dotsContainer.appendChild(dot);
    });

    fullscreenContainer.appendChild(dotsContainer); // Añadir los puntos de navegación al contenedor

    // Solo permitir swipe y scroll si hay más de una imagen
    if (images.length > 1) {
        let startX = 0;
        fullscreenImg.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX; // Capturar la posición inicial del toque
        });

        fullscreenImg.addEventListener('touchmove', (e) => {
            const touchX = e.touches[0].clientX;
            const deltaX = touchX - startX;

            // Si el deslizamiento es mayor a un umbral, cambiar la imagen
            if (deltaX > 50) {
                prevImage(images, fullscreenImg);
                updateDots(dotsContainer); // Actualizar los puntos de navegación
                startX = touchX; // Actualizar la posición de inicio
            } else if (deltaX < -50) {
                nextImage(images, fullscreenImg);
                updateDots(dotsContainer); // Actualizar los puntos de navegación
                startX = touchX; // Actualizar la posición de inicio
            }
        });

        fullscreenImg.addEventListener('wheel', (e) => {
            if (e.deltaY < 0) {
                prevImage(images, fullscreenImg); // Hacia arriba, imagen anterior
                updateDots(dotsContainer); // Actualizar los puntos de navegación
            } else {
                nextImage(images, fullscreenImg); // Hacia abajo, imagen siguiente
                updateDots(dotsContainer); // Actualizar los puntos de navegación
            }
        });
      }
    }

    // ---- Función para actualizar los puntos de navegación ----
    function updateDots(container) {
        Array.from(container.children).forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex); // Activar/desactivar punto
        });
    }
}

// Función para mostrar la imagen anterior
function prevImage(images, imgElement) {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    imgElement.src = images[currentIndex];
}

// Función para mostrar la imagen siguiente
function nextImage(images, imgElement) {
    currentIndex = (currentIndex + 1) % images.length;
    imgElement.src = images[currentIndex];
}



//CODIGO SECUNDARIO  

    // ---- FUNCIONES DE INTERACCIÓN MENU  ----
    const menuIcon = document.querySelector('.menu-icon');
    const dropdownContent = document.querySelector('.dropdown-content');

    menuIcon.addEventListener('click', () => {
        if(dropdownContent.classList.contains('show')) {
        dropdownContent.classList.remove('show');
        dropdownContent.classList.add('hide');
        }else {
            dropdownContent.classList.remove('hide');
            dropdownContent.classList.add('show');
        }
        menuIcon.classList.toggle('open');
    });

    window.addEventListener('click', (e) => {
        if (!menuIcon.contains(e.target) && !dropdownContent.contains(e.target)) {
            dropdownContent.classList.remove('show');
            dropdownContent.classList.add('hide');
            menuIcon.classList.remove('open');
        }
    });

  
    

    // ---- Redirección al hacer clic en el submenú de notificaciones ----
      // Redirección al hacer clic en el enlace "Inicio"
    const homeLink = document.getElementById('notifications-link');
    homeLink.addEventListener('click', () => {
        window.location.href = '/privado/report.html';
    });
        //RUTA PARA REDIRIGIR A CONFIGURACION
        const config = document.getElementById('button_config');
        config.addEventListener('click', () => {
            window.location.href = '/privado/config.html';
        });

    // ---- Lógica para cerrar sesión ----
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', async () => {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'

        },
        credentials: 'include'  // Incluir las cookies en la petición
    });

        if (response.ok) {
            window.location.href = '/login'; // Redirigir a la página de inicio de sesión después de cerrar sesión
        } else {
            alert('Error al cerrar sesión. Inténtalo de nuevo.');
        }
    });
});
