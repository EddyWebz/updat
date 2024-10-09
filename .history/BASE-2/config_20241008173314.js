document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticación y rol del usuario
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) return;  // Si no está autenticado, redirigir a login

    const role = await getUserRole();  // Obtener el rol del usuario autenticado
    const sesionBtn = document.getElementById('configSesion');  // Botón de Configuración de Sesión

    // Ocultar el botón de Configuración de Sesión si el usuario es sub-user
    if (role === 'sub-user' && sesionBtn) {
        sesionBtn.style.display = 'none';  // Ocultar el botón de configuración
    }

    // ---- FUNCIONES DE INTERACCIÓN DEL MENÚ DESPLEGABLE ----
    const menuIcon = document.querySelector('.menu-icon');
    const dropdownContent = document.querySelector('.dropdown-content');

    menuIcon.addEventListener('click', () => {
        dropdownContent.classList.toggle('show');
        menuIcon.classList.toggle('open');
    });

    window.addEventListener('click', (e) => {
        if (!menuIcon.contains(e.target) && !dropdownContent.contains(e.target)) {
            dropdownContent.classList.remove('show');
            menuIcon.classList.remove('open');
        }
    });

    // RUTA PARA REDIRIGIR A INICIO
    document.getElementById('home-link').addEventListener('click', () => {
        window.location.href = '/privado/cuerpo.html';
    });

    // Redirección al hacer clic en el enlace "notificaciones"
    document.getElementById('notifications-link').addEventListener('click', () => {
        window.location.href = '/privado/report.html';
    });

    // RUTA PARA CERRAR SESION
    document.getElementById('logout-button').addEventListener('click', async () => {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (response.ok) window.location.href = '/login';
    });

    // BOTONES DEL MENÚ
    const editarBtn = document.getElementById('editarRegistros');
    const nosotrosBtn = document.getElementById('sobreNosotros');
    // const sesionBtn = document.getElementById('configSesion');

    const editarContent = document.getElementById('contenido-editar');
    const sesionContent = document.getElementById('contenido-sesion');
    const nosotrosContent = document.getElementById('contenido-nosotros');
    const secciones = [editarContent, sesionContent, nosotrosContent];

    function toggleSeccion(seccion) {
        secciones.forEach(sec => sec.style.display = 'none');
        seccion.style.display = 'block';
        dropdownContent.classList.remove('show');
        menuIcon.classList.remove('open');
    }

    editarBtn.addEventListener('click', async () => {
        const isAuthenticated = await checkAuthentication();
        if (!isAuthenticated) return;
        toggleSeccion(editarContent);
    });

    sesionBtn.addEventListener('click', async () => {
        toggleSeccion(sesionContent);
        if (typeof initConfigSesion === 'function') initConfigSesion();
    });

    nosotrosBtn.addEventListener('click', async () => {
        const isAuthenticated = await checkAuthentication();
        if (!isAuthenticated) return;
        toggleSeccion(nosotrosContent);
    });

    // ---- FUNCIONES DE AUTENTICACIÓN Y OBTENCIÓN DE ROLES ----
    async function checkAuthentication() {
        try {
            const response = await fetch('/api/auth-check', { method: 'GET', credentials: 'include' });
            const result = await response.json();
            if (!result.authenticated) window.location.href = '/login';
            return result.authenticated;
        } catch (error) {
            console.error('Error al verificar la autenticación:', error);
            window.location.href = '/login';
            return false;
        }
    }

    async function getUserRole() {
        try {
            const response = await fetch('/api/get-user-role', { credentials: 'include' });
            const result = await response.json();
            return result.role;
        } catch (error) {
            console.error('Error al obtener el rol del usuario:', error);
            return null;
        }
    }

    // ---- SECCIÓN EDITAR REGISTROS ----
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const dateOption = document.getElementById('dateOption');
    const customDate = document.getElementById('customDate');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    const searchCards = document.getElementById('searchCards');

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

    // SECCIÓN FILTRO FECHA
    dateOption.addEventListener('change', () => {
        customDate.style.display = dateOption.value === 'manual' ? 'block' : 'none';
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

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    let isSearchActive = false;
    let isHistoryActive = false;

    searchButton.addEventListener('click', async () => {
        isSearchActive = true;
        isHistoryActive = false;
        const isAuthenticated = await checkAuthentication();
        if (!isAuthenticated) return;
        executeSearch();
    });

    document.getElementById('historyButton').addEventListener('click', async () => {
        isHistoryActive = true;
        isSearchActive = false;
        const isAuthenticated = await checkAuthentication();
        if (!isAuthenticated) return;
        showHistory();
    });

    async function executeSearch() {
        const query = searchInput.value.trim();
        if (!query) {
            alert('¡No has ingresado ningún valor!');
            return;
        }

        const { startDate, endDate } = getSelectedDates();
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`);
        const vehicles = await response.json();

        displaySearchResults(vehicles);
    }

    async function showHistory() {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString().split('T')[0];
        const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString().split('T')[0];

        const response = await fetch(`/api/history?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
        const vehicles = await response.json();

        displaySearchResults(vehicles);
    }

    function displaySearchResults(vehicles) {
        searchResults.innerHTML = '';
        searchCards.style.display = 'block';

        if (vehicles.length === 0) {
            searchResults.innerHTML = '<p>No se encontraron resultados.</p>';
        } else {
            vehicles.forEach(vehicle => {
                const card = document.createElement('div');
                card.className = 'search-card';
                appendVehicleDetails(vehicle, card);

                const editButton = document.createElement('button');
                editButton.textContent = 'Editar';
                editButton.className = 'edit-button';
                editButton.addEventListener('click', () => openEditForm(vehicle));
                card.appendChild(editButton);

                searchResults.appendChild(card);
            });
        }
    }

    function appendVehicleDetails(vehicle, card) {
        for (let key in vehicle) {
            if (vehicle.hasOwnProperty(key) && !['images', 'user_id', 'id', 'created_at'].includes(key)) {
                const div = document.createElement('div');
                const value = key === 'datetime' ? formatDate(vehicle[key]) : vehicle[key];
                const formattedKey = translations[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                div.innerHTML = `<span class="fixed-text">${formattedKey}:</span> <span class="data-text">${value}</span>`;
                card.appendChild(div);
            }
        }

        handleVehicleImages(vehicle, card);
    }

    // Manejo de imágenes
    function handleVehicleImages(vehicle, card) {
        if (vehicle.images && Array.isArray(vehicle.images)) {
            const imageElements = vehicle.images.slice(0, 4);
            imageElements.forEach((image, index) => {
                const img = createImageElement(image);
                img.addEventListener('click', () => showFullscreenImages(imageElements, index));
                card.appendChild(img);
            });
        }
    }

    function createImageElement(image) {
        const img = document.createElement('img');
        img.src = image;
        img.alt = 'Imagen del vehículo';
        img.loading = 'lazy';
        return img;
    }

    let currentIndex = 0;
    function showFullscreenImages(images, index = 0) {
        currentIndex = index;
        const fullscreenContainer = document.createElement('div');
        fullscreenContainer.className = 'fullscreen-container';

        const fullscreenImg = document.createElement('img');
        fullscreenImg.src = images[currentIndex];
        fullscreenImg.className = 'fullscreen-img';
        fullscreenImg.addEventListener('click', () => document.body.removeChild(fullscreenContainer));

        fullscreenContainer.appendChild(fullscreenImg);
        document.body.appendChild(fullscreenContainer);

        if (images.length > 2) {
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'dots-container';

            images.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = 'dot';
                if (i === currentIndex) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    currentIndex = i;
                    fullscreenImg.src = images[currentIndex];
                    updateDots(dotsContainer);
                });
                dotsContainer.appendChild(dot);
            });

            fullscreenContainer.appendChild(dotsContainer);
        }
    }

    function updateDots(container) {
        Array.from(container.children).forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    // ---- FUNCIONALIDAD DE EDICIÓN ----
    let imagesToKeep = [];
    let imagesToReplace = [];
    const maxImages = 4;

    function openEditForm(vehicle) {
        imagesToKeep = [];
        imagesToReplace = [];
        document.querySelectorAll('input[name="existingImages"]').forEach(field => field.remove());

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

        const imagePreviewContainer = document.getElementById('currentImagePreview');
        imagePreviewContainer.innerHTML = '';
        if (vehicle.images && vehicle.images.length > 0) {
            vehicle.images.slice(0, maxImages).forEach(imageUrl => {
                const imgElement = document.createElement('img');
                imgElement.src = imageUrl;
                imgElement.alt = 'Imagen del vehículo';
                imgElement.className = 'image-preview';

                imagesToKeep.push(imageUrl);
                imgElement.addEventListener('click', () => {
                    if (imagesToReplace.includes(imageUrl)) {
                        imagesToReplace = imagesToReplace.filter(img => img !== imageUrl);
                        imagesToKeep.push(imageUrl);
                        imgElement.classList.remove('selected');
                    } else {
                        imagesToReplace.push(imageUrl);
                        imagesToKeep = imagesToKeep.filter(img => img !== imageUrl);
                        imgElement.classList.add('selected');
                    }
                });
                imagePreviewContainer.appendChild(imgElement);
            });
        }

        const existingImagesField = document.createElement('input');
        existingImagesField.type = 'hidden';
        existingImagesField.name = 'existingImages';
        existingImagesField.value = JSON.stringify(imagesToKeep);
        document.getElementById('vehicleEditForm').appendChild(existingImagesField);

        document.getElementById('contenido-update').style.display = 'block';
    }

    document.getElementById('vehicleEditForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const vehicleId = document.getElementById('vehicleId').value;
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
        formData.append('existingImages', JSON.stringify(imagesToKeep));

        const files = document.getElementById('editImage').files;
        if (imagesToReplace.length > 0 && files.length === imagesToReplace.length) {
            for (let i = 0; i < files.length; i++) formData.append('image', files[i]);
        } else if (files.length > 0) {
            if (imagesToKeep.length + files.length > maxImages) {
                alert(`Solo puedes subir ${maxImages - imagesToKeep.length} imágenes adicionales.`);
                return;
            }
            for (let i = 0; i < files.length; i++) formData.append('image', files[i]);
        }

        const response = await fetch(`/api/vehicle/${vehicleId}`, { method: 'PUT', body: formData });
        if (response.ok) {
            alert('Vehículo actualizado con éxito');
            document.getElementById('contenido-update').style.display = 'none';
            if (isHistoryActive) document.getElementById('historyButton').click();
            else if (isSearchActive) executeSearch();
        } else {
            alert('Error al actualizar el vehículo');
        }
    });
});
