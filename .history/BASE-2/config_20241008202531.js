document.addEventListener('DOMContentLoaded', async () => {
       // Verificar autenticación y rol del usuario
       const isAuthenticated = await checkAuthentication();
       if (!isAuthenticated) return;  // Si no está autenticado, redirigir a login
   
       const role = await getUserRole();  // Obtener el rol del usuario autenticado
   
       const sesionBtn = document.getElementById('configSesion');  // Botón de Configuración de Sesión
   
       // Ocultar el botón de Configuración de Sesión si el usuario es sub-user
       if (role === 'sub-user') {
           if (sesionBtn) {
               sesionBtn.style.display = 'none';  // Ocultar el botón de configuración
           }
       }


    // ---- FUNCIONES DE INTERACCIÓN DEL MENÚ DESPLEGABLE ----
    const menuIcon = document.querySelector('.menu-icon');
    const dropdownContent = document.querySelector('.dropdown-content');

    menuIcon.addEventListener('click', () => {
        if (dropdownContent.classList.contains('show')) {
            dropdownContent.classList.remove('show');
            dropdownContent.classList.add('hide');
        } else {
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

    // RUTA PARA REDIRIGIR A INICIO
    const homeLin = document.getElementById('home-link');
    homeLin.addEventListener('click', () => {
        window.location.href = '/privado/cuerpo.html';
    });

    // Redirección al hacer clic en el enlace "notificaciones"
    const homeLink = document.getElementById('notifications-link');
    homeLink.addEventListener('click', () => {
        window.location.href = '/privado/report.html';
    });

    // RUTA PARA CERRAR SESION
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
            window.location.href = '/login';
        }
    });

    // BOTONES DEL MENÚ
    const editarBtn = document.getElementById('editarRegistros');
    const nosotrosBtn = document.getElementById('sobreNosotros');

    const editarContent = document.getElementById('contenido-editar');
    const sesionContent = document.getElementById('contenido-sesion');
    const nosotrosContent = document.getElementById('contenido-nosotros');

    const secciones = [editarContent, sesionContent, nosotrosContent];

        // Evento para desplegar el contenido de Editar Registros
        editarBtn.addEventListener('click', async () => {
            const isAuthenticated = await checkAuthentication();
            if (!isAuthenticated) return;
    
            toggleSeccion(editarContent);
        });
       // Evento para desplegar el contenido de Configuración de Sesión
       sesionBtn.addEventListener('click', async () => {

        toggleSeccion(sesionContent);
          // Aquí es donde ahora dejamos que `configS.js` maneje la lógica de la sesión
    if (typeof initConfigSesion === 'function') {
        initConfigSesion();  // Llama a la función en configS.js que manejará la configuración de sesión
    }
    
    });

      // Evento para desplegar el contenido de Sobre Nosotros
      nosotrosBtn.addEventListener('click', async () => {
        const isAuthenticated = await checkAuthentication();
        if (!isAuthenticated) return;

        toggleSeccion(nosotrosContent);
    });

    // Función para mostrar una sección y ocultar las demás
    function toggleSeccion(seccion) {
        secciones.forEach(sec => sec.style.display = 'none');
        seccion.style.display = 'block';

        // Cerrar el menú desplegable si estamos en móviles
        if (window.innerWidth < 972) {
            dropdownContent.classList.remove('show');
            dropdownContent.classList.add('hide');
        }
    }
});


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

    // Función para obtener el rol del usuario
async function getUserRole() {
    try {
        const response = await fetch('/api/get-user-role', { credentials: 'include' });
        const result = await response.json();
        return result.role;  // Retornar el rol del usuario
    } catch (error) {
        console.error('Error al obtener el rol del usuario:', error);
        return null;
    }
}
    

//SECCION EDITAR REGISTROS

// Capturar los elementos del DOM para las fechas de inicio y fin
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const dateOption = document.getElementById('dateOption');
const customDate = document.getElementById('customDate');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchResults = document.getElementById('searchResults');
const searchCards = document.getElementById('searchCards');

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

//SECCION FILTRO FECHA
// Mostrar/ocultar el campo personalizado de fecha según la opción seleccionada
dateOption.addEventListener('change', () => {
    if (dateOption.value === 'manual') {
        customDate.style.display = 'block';  // Mostrar los campos personalizados
    } else {
        customDate.style.display = 'none';  // Ocultar los campos personalizados
    }
});

// Obtener las fechas seleccionadas
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

// Función para formatear fechas
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// ---- UNIFICACIÓN DEL SISTEMA DE BÚSQUEDA Y MOSTRAR DETALLES ----
// Función que maneja la búsqueda y el refresco de la lista de vehículos
searchButton.addEventListener('click', async () => {
    isSearchActive = true;  // Marcar la búsqueda como activa
    isHistoryActive = false;  // Desmarcar el historial como activo
    const isAuthenticated = await checkAuthentication();  // Verificar si está autenticado antes de la búsqueda
    if (!isAuthenticated) return;  // Detener la ejecución si no está autenticado

    executeSearch();
});
function executeSearch() {
    const query = searchInput.value.trim();
    const { startDate, endDate } = getSelectedDates();  // Obtener las fechas seleccionadas o predeterminadas

    if (!query) {
        alert('¡No has ingresado ningún valor!');
        return;
    }

    // Hacer la solicitud al backend con la búsqueda y el rango de fechas
    fetch(`/api/search?query=${encodeURIComponent(query)}&start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`)
        .then(response => response.json())
        .then(vehicles => {
            searchCards.style.display = 'block';
            searchResults.innerHTML = ''; // Limpiar resultados anteriores

            if (vehicles.length === 0) {
                searchResults.innerHTML = '<p>No se encontraron resultados.</p>';
            } else {
                vehicles.forEach(vehicle => {
                    const card = document.createElement('div');
                    card.className = 'search-card';

                    // Mostrar los detalles del vehículo
                    appendVehicleDetails(vehicle, card);

                    // Botón de editar
                    const editButton = document.createElement('button');
                    editButton.textContent = 'Editar';
                    editButton.className = 'edit-button';  // Asignamos una clase
                    editButton.addEventListener('click', async () => {
                        const isAuthenticated = await checkAuthentication();  // Verificar autenticación antes de editar
                        if (!isAuthenticated) return;

                        openEditForm(vehicle);
                    });
                    card.appendChild(editButton);

                    searchResults.appendChild(card);
                });
            }
        })
        .catch(error => console.error('Error al realizar la búsqueda:', error));
}

// Función para mostrar los detalles del vehículo
function appendVehicleDetails(vehicle, card) {
    for (let key in vehicle) {
        if (vehicle.hasOwnProperty(key) && key !== 'images' && key !== 'user_id' && key !== 'id' && key !== 'created_at') {
            const div = document.createElement('div');
            let value = vehicle[key];

            // Formato de fechas
            if (key === 'datetime') {
                value = formatDate(value);
            }

            // Formatear el nombre de la clave usando las traducciones
            const formattedKey = translations[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            div.textContent = `${formattedKey}: ${value}`;

            // Separar texto fijo y datos de la base de datos
            div.innerHTML = `<span class="fixed-text">${formattedKey}:</span> <span class="data-text">${value}</span>`;
            card.appendChild(div);

        }
    }

    // Manejo de imágenes
    handleVehicleImages(vehicle, card);
}

//FUNCION BOTON MOSTRAR HISTORIAL
//FUNCION BOTON MOSTRAR HISTORIAL
let isHistoryActive = false; // Variable para indicar si el historial está activo

// Función para manejar el botón 'Mostrar Historial'
document.getElementById('historyButton').addEventListener('click', async () => {
    isHistoryActive = true;   // Marcar el historial como activo
    isSearchActive = false;   // Desmarcar la búsqueda como activa
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) return;  // Verificar autenticación

    // Obtener la fecha actual
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Convertir las fechas a formato ISO para la petición al backend (solo parte de fecha)
    const start = startDate.toISOString().split('T')[0];  // 'YYYY-MM-DD'
    const end = endDate.toISOString().split('T')[0];      // 'YYYY-MM-DD'

    try {
        // Realizar la solicitud al backend para obtener los eventos del día actual
        const response = await fetch(`/api/history?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const vehicles = await response.json();
        // Verificar si la respuesta es un arreglo antes de usar forEach
        if (Array.isArray(vehicles)) {
            const searchResults = document.getElementById('searchResults');
            const searchCards = document.getElementById('searchCards');

            searchCards.style.display = 'block';
            searchResults.innerHTML = ''; // Limpiar los resultados previos

            if (vehicles.length === 0) {
                searchResults.innerHTML = '<p>No se encontraron resultados para hoy.</p>';
            } else {
                vehicles.forEach(vehicle => {
                    const card = document.createElement('div');
                    card.className = 'search-card';

                    // Reutilizar la función que muestra los detalles del vehículo
                    appendVehicleDetails(vehicle, card);

                    // Añadir el botón de editar a cada tarjeta del historial
                    const editButton = document.createElement('button');
                    editButton.textContent = 'Editar';
                    editButton.className = 'edit-button';  // Asignamos una clase
                    editButton.addEventListener('click', async () => {
                        const isAuthenticated = await checkAuthentication();  // Verificar autenticación antes de editar
                        if (!isAuthenticated) return;

                        openEditForm(vehicle);  // Llamar a la función de edición
                    });

                    card.appendChild(editButton);
                    searchResults.appendChild(card);
                });
            }
        } else {
            console.error('La respuesta del servidor no es un arreglo:', vehicles);
            alert('Error al obtener los eventos. Por favor, inténtalo nuevamente.');
        }
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
        alert('Error al obtener los eventos. Por favor, inténtalo nuevamente.');
    }
});

//FIN FUNCION BOTON MOSTRAR HISTORIAL

// Función para manejar las imágenes del vehículo
function handleVehicleImages(vehicle, card) {
    if (vehicle.images && Array.isArray(vehicle.images)) {
        const imageElements = vehicle.images.slice(0, 4); // Limitar a un máximo de 4 imágenes
        imageElements.forEach((image) => {
            const img = createImageElement(image);
            card.appendChild(img);
        });
    }
}

// Función para crear elementos de imagen
function createImageElement(image) {
    const img = document.createElement('img');
    img.src = image;
    img.alt = 'Imagen del vehículo';
    img.loading = 'lazy';  // Habilitar lazy loading para optimizar la carga
    return img;
}

// ---- MODIFICAR FUNCIÓN DE IMÁGENES EN PANTALLA COMPLETA ----


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
     if (images.length > 2) {  // SOLO SI HAY MÁS DE DOS IMÁGENES
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


// ---- FUNCIONALIDAD DE EDICIÓN ----
// Variables globales para almacenar las imágenes seleccionadas y las imágenes existentes
let imagesToKeep = [];
let imagesToReplace = [];
const maxImages = 4;  // Límite máximo de imágenes permitidas

// ---- FUNCIONALIDAD DE EDICIÓN ----
// Función para abrir el formulario de edición con los datos pre-llenados
function openEditForm(vehicle) {
    // Reiniciar las variables al abrir el formulario
    
    imagesToKeep = [];
    imagesToReplace = [];

    // Limpiar los campos ocultos existentes para evitar duplicaciones
    const previousImageFields = document.querySelectorAll('input[name="existingImages"]');
    previousImageFields.forEach(field => field.remove());

    // Pre-llenar los campos con los datos del vehículo
    document.getElementById('vehicleId').value = vehicle.id;
    document.getElementById('editBrand').value = vehicle.brand;
    document.getElementById('editModel').value = vehicle.model;
    document.getElementById('editClave').value = vehicle.clave;
    document.getElementById('editPlate').value = vehicle.plate;
    document.getElementById('editColor').value = vehicle.color;
    document.getElementById('editOwner').value = vehicle.owner;
    document.getElementById('editStayNights').value = vehicle.stayNights;
    document.getElementById('editHabitacion').value = vehicle.habitacion;
    document.getElementById('editGarage').value = vehicle.garage;
    document.getElementById('editObservations').value = vehicle.observations;

    // Limpiar el campo de selección de nuevas imágenes para evitar que las anteriores permanezcan
    const imageInput = document.getElementById('editImage');
    imageInput.value = '';  // Resetear el campo de archivo

    // Crear dinámicamente el campo oculto para las imágenes existentes
    let existingImagesField = document.createElement('input');
    existingImagesField.type = 'hidden';
    existingImagesField.name = 'existingImages';
    existingImagesField.id = 'existingImages';
    // Almacenar las imágenes actuales en el campo oculto
    existingImagesField.value = JSON.stringify(vehicle.images || []); 
    // Añadir el campo al formulario
    document.getElementById('vehicleEditForm').appendChild(existingImagesField);

    // Mostrar las imágenes actuales en el formulario de edición
    const imagePreviewContainer = document.getElementById('currentImagePreview');
    imagePreviewContainer.innerHTML = '';  // Limpiar las imágenes previas

    if (vehicle.images && vehicle.images.length > 0) {
        // Mostramos hasta 4 imágenes del vehículo, permitiendo que el usuario las seleccione
        vehicle.images.slice(0, maxImages).forEach((imageUrl, index) => {
            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imgElement.alt = 'Imagen del vehículo';
            imgElement.className = 'image-preview';
            imgElement.dataset.index = index; // Guardar el índice de la imagen

            // Inicialmente, todas las imágenes se mantienen
            imagesToKeep.push(imageUrl);

        // Añadir evento de clic para seleccionar la imagen a reemplazar
imgElement.addEventListener('click', () => {
    if (imagesToReplace.includes(imageUrl)) {
        // Si ya está seleccionada para reemplazar, desmarcarla
        imagesToReplace = imagesToReplace.filter(img => img !== imageUrl);
        imagesToKeep.push(imageUrl); // Volver a agregar a las que se mantendrán
        imgElement.classList.remove('selected'); // Quitar el estilo de selección
        console.log('Imagen desmarcada para reemplazo:', imageUrl);
    } else {
        // Si no está seleccionada, marcarla para reemplazar
        imagesToReplace.push(imageUrl); // Moverla al grupo de imágenes a reemplazar
        imagesToKeep = imagesToKeep.filter(img => img !== imageUrl); // Sacarla de las que se mantendrán
        imgElement.classList.add('selected'); // Aplicar estilo de selección
        console.log('Imagen marcada para reemplazo:', imageUrl);
    }
    console.log('Imágenes a mantener:', imagesToKeep);
    console.log('Imágenes a reemplazar:', imagesToReplace);
});


            // Añadir la imagen a la vista previa
            imagePreviewContainer.appendChild(imgElement);
        });
    } else {
        // Si no hay imágenes, mostrar un mensaje
        const noImageText = document.createElement('p');
        noImageText.textContent = 'No hay imágenes para mostrar';
        imagePreviewContainer.appendChild(noImageText);
    }

    // Hacer que el formulario ocupe toda la pantalla
    const editSection = document.getElementById('contenido-update');
    editSection.classList.add('fullscreen-edit');
    editSection.style.display = 'block';  // Mostrar el formulario
}

// Función para limpiar el campo oculto después de la actualización o cierre del formulario
function closeEditForm() {
    // Eliminar el campo oculto dinámico
    const existingImagesField = document.getElementById('existingImages');
    if (existingImagesField) {
        existingImagesField.remove();  // Eliminar el campo oculto dinámico
    }

    // Limpiar la vista previa de las imágenes
    const imagePreviewContainer = document.getElementById('currentImagePreview');
    imagePreviewContainer.innerHTML = '';  // Limpiar las imágenes previas

    // Reiniciar las variables
    imagesToKeep = [];
    imagesToReplace = [];

    // Ocultar el formulario de edición
    const editSection = document.getElementById('contenido-update');
    editSection.classList.remove('fullscreen-edit');
    editSection.style.display = 'none';  // Ocultar el formulario
}

// Función para subir imágenes y comprimirlas antes de enviarlas
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('editImage'); // Campo para seleccionar nuevas imágenes

    // ---- CONVERTIR TEXTO A MAYÚSCULAS ----
    const textFields = [
        document.getElementById('editBrand'),
        document.getElementById('editModel'),
        document.getElementById('editClave'),
        document.getElementById('editPlate'),
        document.getElementById('editColor'),
        document.getElementById('editOwner')
    ];

    // Añadir el evento input para convertir a mayúsculas en tiempo real
    textFields.forEach(field => {
        field.addEventListener('input', () => {
            field.value = field.value.toUpperCase();  // Convertir el texto a mayúsculas
        });
    });

    // ---- COMPRESIÓN DE IMÁGENES AL SELECCIONAR ----
    imageInput.addEventListener('change', async (e) => {
        const isAuthenticated = await checkAuthentication();  // Verificar autenticación antes de editar    
        const files = [...e.target.files]; // Obtener las imágenes seleccionadas
        const compressedFiles = [];

        for (let file of files) {
            // Crear una promesa para cada imagen comprimida
            const compressedFile = await new Promise((resolve, reject) => {
                new Compressor(file, {
                    quality: 0.6, // Ajustar la calidad de la imagen al 60%
                    success(result) {
                        // Convertir Blob a File
                        const newFile = new File([result], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });
                        resolve(newFile); // Imagen comprimida lista
                    },
                    error(err) {
                        console.error('Error al comprimir la imagen:', err);
                        reject(err);
                    },
                });
            });
            compressedFiles.push(compressedFile); // Añadir la imagen comprimida a la lista
        }

        // Reemplazar los archivos seleccionados por los comprimidos
        const dataTransfer = new DataTransfer();
        compressedFiles.forEach(file => {
            dataTransfer.items.add(file); // Añadir las imágenes comprimidas al DataTransfer
        });

        e.target.files = dataTransfer.files; // Reemplazar los archivos en el input con los comprimidos
        console.log('Imágenes comprimidas y listas para enviar:', e.target.files);
    });

// Enviar los cambios al backend al enviar el formulario
document.getElementById('vehicleEditForm').addEventListener('submit', async (e) => {
    e.preventDefault();  // Prevenir el comportamiento por defecto del formulario
    const vehicleId = document.getElementById('vehicleId').value;  // Obtener el ID del vehículo

    // Crear un FormData para enviar los datos
    const formData = new FormData();
    formData.append('brand', document.getElementById('editBrand').value);
    formData.append('model', document.getElementById('editModel').value);
    formData.append('clave', document.getElementById('editClave').value);
    formData.append('plate', document.getElementById('editPlate').value);
    formData.append('color', document.getElementById('editColor').value);
    formData.append('owner', document.getElementById('editOwner').value);
    formData.append('stayNights', document.getElementById('editStayNights').value);
    formData.append('habitacion', document.getElementById('editHabitacion').value);
    formData.append('garage', document.getElementById('editGarage').value);
    formData.append('observations', document.getElementById('editObservations').value);

    // Añadir las imágenes que se mantienen
    formData.append('existingImages', JSON.stringify(imagesToKeep));

    // Verificar si se seleccionaron imágenes para reemplazo y se cargaron nuevas imágenes
    const files = document.getElementById('editImage').files;
    if (imagesToReplace.length > 0) {
        if (files.length === imagesToReplace.length) {
            // Añadir las nuevas imágenes al FormData
            for (let i = 0; i < files.length; i++) {
                formData.append('image', files[i]);
            }
        } else {
            alert(`Has seleccionado ${imagesToReplace.length} imágenes para reemplazar, pero has cargado ${files.length} nuevas imágenes. Por favor, asegúrate de cargar el mismo número de imágenes.`);
            return;
        }
    } else if (files.length > 0) {
        // Si no se han seleccionado imágenes para reemplazo pero se suben imágenes, agregarlas si hay espacio
        const currentImagesCount = imagesToKeep.length;
        const totalImages = currentImagesCount + files.length;

        if (totalImages > maxImages) {
            alert(`Ya tienes ${currentImagesCount} imágenes. Solo puedes subir ${maxImages - currentImagesCount} imágenes adicionales.`);
            return;
        }

        // Añadir las nuevas imágenes al FormData
        for (let i = 0; i < files.length; i++) {
            formData.append('image', files[i]);
        }
    }

    try {
        const response = await fetch(`/api/vehicle/${vehicleId}`, {
            method: 'PUT',
            body: formData  // Enviar el FormData con la solicitud PUT
        });

        if (response.ok) {
            alert('Vehículo actualizado con éxito');
            closeEditForm();  // Cerrar el formulario después de la actualización

            // Verificar si el historial o la búsqueda están activos
            if (isHistoryActive) {
                document.getElementById('historyButton').click();  // Refrescar los resultados del historial
            } else if (isSearchActive) {
                // Verificar si el campo de búsqueda tiene un valor antes de ejecutar la búsqueda
                if (searchInput.value.trim() !== "") {
                    executeSearch();  // Ejecutar la búsqueda solo si el campo no está vacío
                } else {
                    alert('¡No has ingresado ningún valor!');  // Mostrar alerta si el campo está vacío
                }
            }
        } else {
            alert('Error al actualizar el vehículo');
        }
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
    }
});

// Asignar la búsqueda al botón y refrescar automáticamente
searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query !== "") {
        executeSearch();  // Ejecutar búsqueda solo si el campo no está vacío
    } else {
        alert('¡No has ingresado ningún valor!');  // Mostrar alerta si el campo está vacío
    }
});


// Asignar la búsqueda al botón y refrescar automáticamente
searchButton.addEventListener('click', executeSearch);
});