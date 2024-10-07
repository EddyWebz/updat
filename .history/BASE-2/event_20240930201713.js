document.addEventListener('DOMContentLoaded', function() {
    const applyFilterButton = document.getElementById('applyFilter');

    applyFilterButton.addEventListener('click', async function() {
        try {
            // Asegurarse de capturar los valores manualmente justo antes de procesarlos
            const startDateInput = document.getElementById('startDate');
            const endDateInput = document.getElementById('endDate');

            // Forzar el enfoque en los inputs de fecha para asegurar la captura de valores
            startDateInput.focus();
            endDateInput.focus();

            let startDate = startDateInput.value;
            let endDate = endDateInput.value;

            // Verificar y mostrar los valores capturados
            console.log('Valor de startDate:', startDate);
            console.log('Valor de endDate:', endDate);

            // Validar que ambos campos tengan valores
            if (!startDate || !endDate) {
                console.error('Debes seleccionar ambas fechas');
                return;
            }

            console.log('Fechas seleccionadas por el usuario:', { startDate, endDate });

            // Construir la URL con las fechas seleccionadas
            let url = `/api/eventos?startDate=${startDate}&endDate=${endDate}`;

            console.log(`Solicitando eventos con URL: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Incluir cookies para autenticación
            });

            if (!response.ok) {
                throw new Error('Error al obtener los eventos');
            }

            const data = await response.json();
            console.log('Respuesta recibida:', data);

            if (data.success && data.eventos) {
                mostrarEventos(data.eventos);
                aplicarInteraccionesTarjetas();
            } else {
                console.error('No se encontraron eventos o hubo un problema.');
            }
        } catch (error) {
            console.error('Error al cargar eventos:', error);
        }
    });
});

// Función para mostrar los eventos en el DOM
function mostrarEventos(eventos) {
    const contenedorEventos = document.getElementById('eventos-container');

    // Limpiar el contenedor antes de mostrar nuevos eventos
    contenedorEventos.innerHTML = '';

    eventos.forEach(evento => {
        const eventoElement = document.createElement('div');
        eventoElement.classList.add('evento');

        let eventoHTML;

        if (evento.accion === 'Registro') {
            eventoHTML = `
            <div class="informacion">
                <p><strong>${evento.usuario}</strong> registró un vehículo con placa <strong>${evento.vehiculo_placa}</strong>, 
                Propietario <strong>${evento.propietario}</strong>, Habitación <strong>${evento.habitacion}</strong></p>
                <p class="fecha">Fecha de acción: ${new Date(evento.fecha).toLocaleString()}</p>
            </div>   
                <hr>
            `;
        } else if (evento.accion === 'Movió') {
            eventoHTML = `
            <div class="informacion">
                <p><strong>${evento.usuario}</strong> movió el vehículo con placa: ${evento.vehiculo_placa}, 
                Propietario: ${evento.propietario}, Habitación: ${evento.habitacion}</p>
                <div class="accion">
                    <p>${evento.descripcion}</p>
                </div>    
                <p class="fecha">Fecha de acción: ${new Date(evento.fecha).toLocaleString()}</p>
            </div>   
                <hr>
            `;
        } else {
            eventoHTML = `
            <div class="informacion">
                <p><strong>${evento.usuario}</strong> actualizó datos del vehículo 
                Placa: ${evento.vehiculo_placa}, 
                Propietario: ${evento.propietario}, 
                Habitación: ${evento.habitacion}</p>
            </div>
            <div class="accion">
                ${evento.descripcion.split('\n').map(line => `<p>${line}</p>`).join('')}
            </div>
            <div class="fecha">
                <p>Fecha de acción: ${new Date(evento.fecha).toLocaleString()}</p>
            </div>
            <hr>
            `;
        }

        eventoElement.innerHTML = eventoHTML;
        contenedorEventos.appendChild(eventoElement);
    });
}

// Función para manejar la selección de tarjetas en móviles y escritorio
function aplicarInteraccionesTarjetas() {
    const eventos = document.querySelectorAll('.evento');
    let selectedEvent = null;

    eventos.forEach(evento => {
        evento.addEventListener('click', () => {
            if (selectedEvent === evento) {
                selectedEvent.classList.remove('selected');
                eventos.forEach(ev => ev.classList.remove('dim'));  // Eliminar oscurecimiento de todas
                selectedEvent = null;
            } else {
                if (selectedEvent) {
                    selectedEvent.classList.remove('selected');
                }
                selectedEvent = evento;
                selectedEvent.classList.add('selected');
                eventos.forEach(ev => {
                    if (ev !== selectedEvent) {
                        ev.classList.add('dim');
                    } else {
                        ev.classList.remove('dim');
                    }
                });
            }
        });
    });
}

aplicarInteraccionesTarjetas();
