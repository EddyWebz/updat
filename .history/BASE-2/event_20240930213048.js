document.addEventListener('DOMContentLoaded', async () => {
    try {
        const startDateInput = document.getElementById('customStartDate').value;
        const endDateInput = document.getElementById('customEndDate').value;

        // Verificar si se seleccionan las fechas y añadir las horas correspondientes
        if (startDateInput && endDateInput) {
            const startDate = `${startDateInput} 00:00:00`; // El día comienza a las 00:00
            const endDate = `${endDateInput} 23:59:59`; // El día termina a las 23:59

            // Construir la URL con los parámetros de fecha
            let url = `/api/eventos?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;

            console.log(`Solicitando eventos desde ${startDate} hasta ${endDate}`);

            // Enviar solicitud GET con las fechas ajustadas
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

            if (data.success && data.eventos) {
                mostrarEventos(data.eventos);
                aplicarInteraccionesTarjetas();  // Aplicar las interacciones después de mostrar los eventos
            } else {
                console.error('No se encontraron eventos o hubo un problema.');
            }
        } else {
            console.error('Por favor selecciona ambas fechas.');
        }
    } catch (error) {
        console.error('Error al cargar eventos:', error);
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

