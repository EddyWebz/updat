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