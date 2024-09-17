document.addEventListener('DOMContentLoaded', () => {
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
    const imageInput = document.getElementById('image'); // Campo de imágenes
    // ---- VARIABLES ----
    const botonhistor = document.getElementById('botonhistor');
    const historySection = document.getElementById('historySection');
    const fullscreenBackground = document.createElement('div'); // Creamos el fondo oscuro
fullscreenBackground.classList.add('fullscreen-background');
document.body.appendChild(fullscreenBackground); // Añadimos el fondo oscuro al cuerpo del documento
    let scrollPosition = 0;
    // Capturar los elementos del DOM para las fechas de inicio y fin
const startDateInput = document.getElementById('startDate');  // Corregido: usar 'startDate'
const endDateInput = document.getElementById('endDate');      // Corregido: usar 'endDate'
// Mostrar/ocultar el campo personalizado de fecha según la opción seleccionada
const dateOption = document.getElementById('dateOption');
const customDate = document.getElementById('customDate');

document.addEventListener('DOMContentLoaded', () => {
    // ---- FUNCIONES PARA GUARDAR Y CARGAR LOS DATOS EN EL LOCAL STORAGE ----
    
    // Función para guardar los datos del formulario en el Local Storage
    function saveFormData() {
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
            observations: document.getElementById('observations').value
        };
        
        localStorage.setItem('vehicleFormData', JSON.stringify(formData));  // Guardar en el Local Storage
    }

    // Función para cargar los datos del formulario desde el Local Storage
    function loadFormData() {
        const savedData = localStorage.getItem('vehicleFormData');
        if (savedData) {
            const formData = JSON.parse(savedData);
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
        }
    }

    // ---- EVENTOS PARA GUARDAR AUTOMÁTICAMENTE LOS DATOS CADA VEZ QUE SE INGRESA INFORMACIÓN ----
    
    // Agregar eventos de cambio en los campos del formulario para que los datos se guarden automáticamente
    const formElements = document.querySelectorAll('#vehicleForm input, #vehicleForm select, #vehicleForm textarea');
    
    formElements.forEach(element => {
        element.addEventListener('input', saveFormData);  // Guardar datos cada vez que se cambia algo
        console.log('Datos guardados en Local Storage:', JSON.parse(localStorage.getItem('vehicleFormData'))); // Depuración
    });

    // Cargar los datos cuando la página se cargue
    loadFormData();

    // ---- LIMPIAR EL LOCAL STORAGE CUANDO SE ENVÍA EL FORMULARIO ----
    
    document.getElementById('vehicleForm').addEventListener('submit', () => {
        localStorage.removeItem('vehicleFormData');  // Eliminar los datos guardados al enviar el formulario
    });
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



    // ---- COMPRESIÓN DE IMÁGENES AL SELECCIONAR ----
    imageInput.addEventListener('change', async (e) => {
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


       // ---- MOSTRAR/OCULTAR SECCIÓN DE HISTORIAL Y EXPANDIR A PANTALLA COMPLETA ----
       botonhistor.addEventListener('click', () => {
        if (historySection.style.display === 'block') {
            // Si el contenido está abierto, volvemos a su estado normal
            historySection.style.display = 'none';
            botonhistor.style.position = 'static'; // Regresamos el botón a su posición normal
            botonhistor.style.left = '0'; // Quitamos la alineación a la izquierda
            botonhistor.style.width = 'auto'; // Ajustamos el ancho al tamaño original
            botonhistor.style.margin = '0'; // Quitamos los márgenes
            botonhistor.textContent = 'Historial de Registros'; // Cambiamos el texto del botón
            document.body.classList.remove('no-scroll'); // Volvemos a permitir el scroll
            window.scrollTo(0, scrollPosition); // Volvemos a la posición anterior de scroll
            fullscreenBackground.style.display = 'none'; // Ocultamos el fondo oscuro
        } else {
            // Guardamos la posición de scroll actual
            scrollPosition = window.pageYOffset;
    
            // Movemos el botón a la parte superior y expandimos su tamaño
            document.body.classList.add('no-scroll'); // Deshabilitamos el scroll del resto de la página
            window.scrollTo(0, 0); // Movemos la página al principio (para que el botón quede visible arriba)
            botonhistor.style.position = 'fixed'; // Fijamos el botón en la parte superior
            botonhistor.style.top = '10px'; // Alineamos el botón en la parte superior
            botonhistor.style.left = '10px'; // Alineamos a la izquierda
            botonhistor.style.width = 'auto'; // El botón ocupará toda el ancho de la pantalla
            botonhistor.style.zIndex = '1000'; // Aseguramos que el botón esté sobre toda el contenido
            botonhistor.textContent = 'Ocultar Historial de Registros'; // Cambiamos el texto del botón
            historySection.style.display = 'block'; // Mostramos el contenido del botón
            fullscreenBackground.style.display = 'block'; // Mostramos el fondo oscuro
        }
    
    });

    // Función para resetear la búsqueda
function resetSearch() {
    searchInput.value = ''; // Limpiar el campo de búsqueda
    searchCards.style.display = 'none'; // Ocultar los resultados de búsqueda
}

// Función para resetear el historial
function resetHistory() {
    historyContent.style.display = 'none'; // Ocultar el historial
}


    // ---- FUNCIONES PARA MANEJAR EL HISTORIAL ----
    function addVehicleToHistory(vehicle) {
        const card = document.createElement('div');
        card.className = 'history-card';

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
                card.appendChild(div);
            }
        }

         // Manejo de imágenes (nueva función refactorizada)
         handleVehicleImages(vehicle, card);

         historyCards.appendChild(card);
     }

    // ---- FUNCIONES DE MANEJO DE IMÁGENES ----
    function createImageElement(image) {
        const img = document.createElement('img');
        img.src = image;
        img.alt = 'Imagen del vehículo';
        img.loading = 'lazy';  // Habilitar lazy loading para optimizar la carga
        //img.addEventListener('click', () => showFullscreenImage(image));
        return img;
    }

    // function showFullscreenImage(image) {
    //     const fullscreenImg = document.createElement('img');
    //     fullscreenImg.src = image;
    //     fullscreenImg.className = 'fullscreen-img';
    //     fullscreenImg.addEventListener('click', () => {
    //         document.body.removeChild(fullscreenImg);
    //     });
    //     document.body.appendChild(fullscreenImg);
    // }
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
    
    //CAMPO DE FECHA PERZONALIZADA
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
    
  

async function loadHistory() {
    const { startDate, endDate } = getSelectedDates();  // Obtener las fechas seleccionadas o por defecto
    console.log('Fechas enviadas al backend:', { startDate, endDate });

    if (!startDate || !endDate) {
        alert('Por favor, seleccione un rango de fechas.');
        return;
    }

    // Hacer la solicitud al backend con las fechas seleccionadas o por defecto
    const response = await fetch(`/api/history?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`);
    const vehicles = await response.json();
    
    console.log('Historial filtrado recibido:', vehicles); // Depuración

    // Mostrar el historial en la página
    historyContent.style.display = 'block';
    historyCards.innerHTML = ''; // Limpiar historial antes de cargar nuevos resultados
    vehicles.forEach(addVehicleToHistory); // Mostrar del más reciente al más antiguo
}

    

    // ---- FUNCIONES PARA MANEJAR EL FORMULARIO DE REGISTRO ----
    vehicleForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.disabled = true; // Deshabilitar el botón inmediatamente

        const loadingMessage = document.createElement('p');
        loadingMessage.textContent = 'Cargando...';
        vehicleForm.appendChild(loadingMessage); // Mostrar mensaje de cargando

        const formData = new FormData(vehicleForm);
        const response = await fetch('/api/register', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (result.success) {
            addVehicleToHistory(result.vehicle);
            vehicleForm.reset();

            // Repoblar el campo de fecha y hora después de registrar un vehículo
            setDateTime();

            loadingMessage.textContent = 'Registro exitoso';
            setTimeout(() => {
                loadingMessage.remove(); // Eliminar el mensaje después de 1 segundo
                submitButton.disabled = false; // Habilitar el botón para permitir nuevos registros si es necesario
            }, 1000);
        } else {
            alert(result.message || 'Error al registrar vehículo');
            submitButton.disabled = false; // Habilitar el botón si hay un error
            loadingMessage.remove(); // Eliminar el mensaje de cargando si hay un error
        }
    });
    

    // ---- FUNCIONES DE BÚSQUEDA ----
    searchButton.addEventListener('click', async () => {
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
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`);
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
                        card.appendChild(div);
                    }
                }
    
                // Manejo de imágenes
                handleVehicleImages(vehicle, card);
    
                searchResults.appendChild(card);
            });
        }
    });
    
    
    

    // ---- FUNCIONES PARA MANEJAR EL HISTORIAL ----
    toggleHistoryBtn.addEventListener('click', () => {
        if (historyContent.style.display === 'none') {
            resetSearch(); // Resetear la búsqueda cuando se muestre el historial
            historyContent.style.display = 'block'; // Mostrar el historial
            loadHistory();
        } else {
            historyContent.style.display = 'none';
            resetHistory(); // Ocultar el historial si ya está visible
        }
    });

    // ---- FUNCIONES DE INTERACCIÓN ----
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

    // ---- Redirección al hacer clic en el submenú de notificaciones ----
      // Redirección al hacer clic en el enlace "Inicio"
    const homeLink = document.getElementById('notifications-link');
    homeLink.addEventListener('click', () => {
        window.location.href = '/privado/report.html';
    });

    // ---- Lógica para cerrar sesión ----
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', async () => {
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            window.location.href = '/login'; // Redirigir a la página de inicio de sesión después de cerrar sesión
        } else {
            alert('Error al cerrar sesión. Inténtalo de nuevo.');
        }
    });
});
