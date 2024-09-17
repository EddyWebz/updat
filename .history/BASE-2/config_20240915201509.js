document.addEventListener('DOMContentLoaded', () => {
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
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            window.location.href = '/login';
        }
    });

    // BOTONES DEL MENÚ
    const editarBtn = document.getElementById('editarRegistros');
    const sesionBtn = document.getElementById('configSesion');
    const nosotrosBtn = document.getElementById('sobreNosotros');

    const editarContent = document.getElementById('contenido-editar');
    const sesionContent = document.getElementById('contenido-sesion');
    const nosotrosContent = document.getElementById('contenido-nosotros');

    const secciones = [editarContent, sesionContent, nosotrosContent];

    // Evento para desplegar el contenido de Editar Registros
    editarBtn.addEventListener('click', () => toggleSeccion(editarContent));

    // Evento para desplegar el contenido de Configuración de Sesión
    sesionBtn.addEventListener('click', () => toggleSeccion(sesionContent));

    // Evento para desplegar el contenido de Sobre Nosotros
    nosotrosBtn.addEventListener('click', () => toggleSeccion(nosotrosContent));

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

// Función para manejar la búsqueda
searchButton.addEventListener('click', async () => {
    const query = searchInput.value.trim();

    // Usar las fechas seleccionadas o predeterminadas
    const { startDate, endDate } = getSelectedDates();  // Usar la función que maneja las fechas del panel

    // Verificar que la consulta esté completa
    if (!query) {
        alert('¡No haz ingresado ningun valor!.');
        return;
    }

    // Hacer la solicitud al backend con la búsqueda y el rango de fechas
    const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`);
    const vehicles = await response.json();

    searchCards.style.display = 'block';
    searchResults.innerHTML = ''; // Limpiar resultados anteriores

    if (vehicles.length === 0) {
        searchResults.innerHTML = '<p>No se encontraron resultados.</p>';
    } else {
        vehicles.forEach(vehicle => {
            const card = document.createElement('div');
            card.className = 'search-card';

            // Mostrar los detalles del vehículo en español
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
                    card.appendChild(div);
                }
            }

            // Manejo de imágenes
            handleVehicleImages(vehicle, card);

            // Botón de editar
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.addEventListener('click', () => openEditForm(vehicle));
            card.appendChild(editButton);

            searchResults.appendChild(card);
        });
    }
});

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

// ---- FUNCIONALIDAD DE EDICIÓN ----

// Función para abrir el formulario de edición con los datos pre-llenados
function openEditForm(vehicle) {
    document.getElementById('vehicleId').value = vehicle.id;
    document.getElementById('editDatetime').value = new Date(vehicle.datetime).toISOString().slice(0, 16); // Pre-llenar Fecha y Hora
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
    // Llenar los demás campos según corresponda
    document.getElementById('contenido-update').style.display = 'block'; // Mostrar el formulario de edición
}

// Enviar los cambios al backend
document.getElementById('vehicleEditForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const vehicleId = document.getElementById('vehicleId').value;
    
    const formData = new FormData();  // Crear FormData para enviar archivos e información
    formData.append('datetime', document.getElementById('editDatetime').value);
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

    // Agregar los archivos (imágenes) al FormData
    const files = document.getElementById('editImage').files;
    for (let i = 0; i < files.length; i++) {
        formData.append('image', files[i]);  // Añadir cada archivo al FormData
    }

    try {
        const response = await fetch(`/api/vehicle/${vehicleId}`, {
            method: 'PUT',
            body: formData  // Usar FormData en lugar de JSON
        });

        if (response.ok) {
            alert('Vehículo actualizado con éxito');
            document.getElementById('contenido-update').style.display = 'none'; // Ocultar el formulario
            // Opcional: Actualizar la tarjeta en el frontend si es necesario
        } else {
            alert('Error al actualizar el vehículo');
        }
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
    }
});
