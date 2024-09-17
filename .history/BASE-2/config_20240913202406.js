document.addEventListener('DOMContentLoaded', () => {
    const botonhistor = document.getElementById('botonhistor');
    const historySection = document.getElementById('historySection');
    const historyContent = document.getElementById('historyContent');
    const historyCards = document.getElementById('historyCards');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    const searchCards = document.getElementById('searchCards');
    const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
    const fullscreenBackground = document.createElement('div');
    
    // Fondo oscuro para pantalla completa
    fullscreenBackground.classList.add('fullscreen-background');
    document.body.appendChild(fullscreenBackground);
    
    let scrollPosition = 0;

    // Mostrar/Ocultar el historial
    botonhistor.addEventListener('click', () => {
        if (historySection.style.display === 'block') {
            // Si está visible, lo ocultamos
            historySection.style.display = 'none';
            botonhistor.textContent = 'Historial de Registros';
            document.body.classList.remove('no-scroll');
            fullscreenBackground.style.display = 'none';
            window.scrollTo(0, scrollPosition);
        } else {
            // Mostrar el historial en pantalla completa
            scrollPosition = window.pageYOffset;
            document.body.classList.add('no-scroll');
            window.scrollTo(0, 0);
            botonhistor.textContent = 'Ocultar Historial de Registros';
            historySection.style.display = 'block';
            fullscreenBackground.style.display = 'block';
        }
    });

    // Función para cargar el historial
    async function loadHistory() {
        const { startDate, endDate } = getSelectedDates();
        const response = await fetch(`/api/history?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`);
        const vehicles = await response.json();
        historyContent.style.display = 'block';
        historyCards.innerHTML = '';
        vehicles.forEach(addVehicleToHistory);
    }

    // Función para agregar tarjetas de vehículos al historial
    function addVehicleToHistory(vehicle) {
        const card = document.createElement('div');
        card.className = 'history-card';
        
        for (let key in vehicle) {
            if (vehicle.hasOwnProperty(key) && key !== 'images') {
                const div = document.createElement('div');
                div.textContent = `${key}: ${vehicle[key]}`;
                card.appendChild(div);
            }
        }
        historyCards.appendChild(card);
    }

    // Búsqueda por nombre o placa
    searchButton.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        const { startDate, endDate } = getSelectedDates();
        if (!query) {
            alert('Por favor, ingrese una consulta válida.');
            return;
        }

        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`);
        const vehicles = await response.json();
        searchCards.style.display = 'block';
        searchResults.innerHTML = '';

        if (vehicles.length === 0) {
            searchResults.innerHTML = '<p>No se encontraron resultados.</p>';
        } else {
            vehicles.forEach(vehicle => {
                const card = document.createElement('div');
                card.className = 'search-card';
                for (let key in vehicle) {
                    if (vehicle.hasOwnProperty(key) && key !== 'images') {
                        const div = document.createElement('div');
                        div.textContent = `${key}: ${vehicle[key]}`;
                        card.appendChild(div);
                    }
                }
                searchResults.appendChild(card);
            });
        }
    });

    // Función para obtener las fechas seleccionadas
    function getSelectedDates() {
        const dateOption = document.getElementById('dateOption').value;
        const startDateInput = document.getElementById('startDate').value;
        const endDateInput = document.getElementById('endDate').value;
        
        if (dateOption === 'manual') {
            return { startDate: startDateInput, endDate: endDateInput };
        } else {
            const today = new Date();
            let startDate;
            if (dateOption === '7days') {
                startDate = new Date(today.setDate(today.getDate() - 7));
            } else if (dateOption === '15days') {
                startDate = new Date(today.setDate(today.getDate() - 15));
            } else {
                startDate = new Date(today.setMonth(today.getMonth() - 1));
            }
            const endDate = new Date();
            return { startDate: startDate.toISOString().split('T')[0], endDate: endDate.toISOString().split('T')[0] };
        }
    }
});
