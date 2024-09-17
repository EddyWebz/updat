document.addEventListener('DOMContentLoaded', () => {
    const botonhistor = document.getElementById('botonhistor');
    const historySection = document.getElementById('historySection');
    const fullscreenBackground = document.createElement('div'); // Creamos el fondo oscuro
    fullscreenBackground.classList.add('fullscreen-background');
    document.body.appendChild(fullscreenBackground); // Añadimos el fondo oscuro al cuerpo del documento
    let scrollPosition = 0;

    // Capturar los elementos del DOM para las fechas de inicio y fin
    const startDateInput = document.getElementById('startDate');  
    const endDateInput = document.getElementById('endDate');
    const dateOption = document.getElementById('dateOption');
    const customDate = document.getElementById('customDate');

    // Mostrar/ocultar el campo personalizado de fecha según la opción seleccionada
    dateOption.addEventListener('change', () => {
        if (dateOption.value === 'manual') {
            customDate.style.display = 'block';  // Mostrar los campos personalizados
        } else {
            customDate.style.display = 'none';  // Ocultar los campos personalizados
        }
    });

    // ---- MOSTRAR/OCULTAR SECCIÓN DE HISTORIAL Y EXPANDIR A PANTALLA COMPLETA ----
    botonhistor.addEventListener('click', () => {
        if (historySection.style.display === 'block') {
            historySection.style.display = 'none';
            botonhistor.style.position = 'static';
            botonhistor.style.left = '0';
            botonhistor.style.width = 'auto';
            botonhistor.style.margin = '0';
            botonhistor.textContent = 'Historial de Registros';
            document.body.classList.remove('no-scroll');
            window.scrollTo(0, scrollPosition);
            fullscreenBackground.style.display = 'none';
        } else {
            scrollPosition = window.pageYOffset;
            document.body.classList.add('no-scroll');
            window.scrollTo(0, 0);
            botonhistor.style.position = 'fixed';
            botonhistor.style.top = '10px';
            botonhistor.style.left = '10px';
            botonhistor.style.width = 'auto';
            botonhistor.style.zIndex = '1000';
            botonhistor.textContent = 'Ocultar Historial de Registros';
            historySection.style.display = 'block';
            fullscreenBackground.style.display = 'block';
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

    async function loadHistory() {
        const { startDate, endDate } = getSelectedDates();
        console.log('Fechas enviadas al backend:', { startDate, endDate });

        if (!startDate || !endDate) {
            alert('Por favor, seleccione un rango de fechas.');
            return;
        }

        const response = await fetch(`/api/history?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`);
        const vehicles = await response.json();
    
        console.log('Historial filtrado recibido:', vehicles);

        historyContent.style.display = 'block';
        historyCards.innerHTML = '';
        vehicles.forEach(addVehicleToHistory);
    }

    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    const searchCards = document.getElementById('searchCards');

    searchButton.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        
        const { startDate, endDate } = getSelectedDates();
    
        if (!query) {
            alert('Por favor, ingrese una consulta válida.');
            return;
        }
        resetHistory();
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`);
        const vehicles = await response.json();
        
        console.log('Resultados de búsqueda filtrados por fecha recibidos:', vehicles);
    
        searchCards.style.display = 'block';
        searchResults.innerHTML = '';
        
        if (vehicles.length === 0) {
            searchResults.innerHTML = '<p>No se encontraron resultados.</p>';
        } else {
            vehicles.forEach(vehicle => {
                const card = document.createElement('div');
                card.className = 'search-card';
                
                for (let key in vehicle) {
                    if (vehicle.hasOwnProperty(key) && key !== 'images' && key !== 'user_id' && key !== 'id' && key !== 'created_at') {
                        const div = document.createElement('div');
                        let value = vehicle[key];
                        if (key === 'datetime') {
                            value = formatDate(value);
                        }
                        const formattedKey = translations[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        div.textContent = `${formattedKey}: ${value}`;
                        card.appendChild(div);
                    }
                }
    
                searchResults.appendChild(card);
            });
        }
    });

    const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
    const historyContent = document.getElementById('historyContent');
    const historyCards = document.getElementById('historyCards');

    toggleHistoryBtn.addEventListener('click', () => {
        if (historyContent.style.display === 'none') {
            resetSearch();
            historyContent.style.display = 'block';
            loadHistory();
        } else {
            historyContent.style.display = 'none';
            resetHistory();
        }
    });

    function resetSearch() {
        searchInput.value = '';
        searchCards.style.display = 'none';
    }

    function resetHistory() {
        historyContent.style.display = 'none';
    }
});
