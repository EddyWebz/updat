document.addEventListener('DOMContentLoaded', function() {
    const startDateInput = document.getElementById('customStartDate');
    const endDateInput = document.getElementById('customEndDate');
    const applyFilterButton = document.getElementById('applyCustomFilter');

    // Validar si los valores son capturados correctamente
    applyFilterButton.addEventListener('click', function() {
        let startDate = startDateInput.value;
        let endDate = endDateInput.value;

        console.log('Fecha de inicio seleccionada:', startDate);
        console.log('Fecha de fin seleccionada:', endDate);

        if (!startDate || !endDate) {
            console.error('Por favor selecciona ambas fechas.');
            return;
        }

        // Continuar con el proceso de la solicitud si las fechas son válidas
        fetchEventos(startDate, endDate);
    });

    function fetchEventos(startDate, endDate) {
        let url = `/api/eventos?startDate=${startDate}&endDate=${endDate}`;
        console.log(`Solicitando eventos con URL: ${url}`);

        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log('Eventos recibidos:', data);
                // Aquí puedes manejar la visualización de los eventos
            })
            .catch(error => {
                console.error('Error al obtener los eventos:', error);
            });
    }
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

        // Verificar si es un registro
        if (evento.accion === 'Registro') {
            // Para el evento de registro, mostrar una línea simplificada
            eventoHTML = `
             <div class="informacion">
                <p><strong>${evento.usuario}</strong> registró un vehículo con placa <strong>${evento.vehiculo_placa}</strong>, 
                Propietario <strong>${evento.propietario}</strong>, Habitación <strong>${evento.habitacion}</strong></p>
                <p class="fecha">Fecha de acción: ${new Date(evento.fecha).toLocaleString()}</p>
             </div>   
                <hr>
            `;
        } else if (evento.accion === 'Movió') {
            // Para el evento "Movió"
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
            // Para otros tipos de acciones como "Actualizó"
            eventoHTML = `
              <!-- Línea Informativa -->
              <div class="informacion">
                  <p><strong>${evento.usuario}</strong> actualizó datos del vehículo 
                  Placa: ${evento.vehiculo_placa}, 
                  Propietario: ${evento.propietario}, 
                  Habitación: ${evento.habitacion}</p>
              </div>
              <!-- Línea de Ejecución / Descripción de la acción -->
              <div class="accion">
                  ${evento.descripcion.split('\n').map(line => `<p>${line}</p>`).join('')}
              </div>
              <!-- Fecha de acción -->
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
            // Si la tarjeta ya está seleccionada, deseleccionarla
            if (selectedEvent === evento) {
                selectedEvent.classList.remove('selected');
                eventos.forEach(ev => ev.classList.remove('dim'));  // Eliminar oscurecimiento de todas
                selectedEvent = null;  // Deseleccionar
            } else {
                // Seleccionar la nueva tarjeta
                if (selectedEvent) {
                    selectedEvent.classList.remove('selected');
                }

                selectedEvent = evento;
                selectedEvent.classList.add('selected');

                // Oscurecer todas las demás tarjetas
                eventos.forEach(ev => {
                    if (ev !== selectedEvent) {
                        ev.classList.add('dim');  // Oscurecer las demás
                    } else {
                        ev.classList.remove('dim');  // Quitar oscurecimiento de la seleccionada
                    }
                });
            }
        });
    });
}

// Activar el comportamiento
aplicarInteraccionesTarjetas();

