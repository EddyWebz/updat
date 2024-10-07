document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Enviar una solicitud GET al servidor para obtener los eventos
        const response = await fetch('/api/eventos', {
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
// Función para verificar si el dispositivo soporta eventos táctiles
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}

// Función para manejar la selección de tarjetas en dispositivos táctiles
function aplicarInteraccionesTarjetas() {
    if (isTouchDevice()) {
        const eventos = document.querySelectorAll('.evento');
        let selectedEvent = null;

        eventos.forEach(evento => {
            evento.addEventListener('click', () => {
                // Deseleccionar la tarjeta si ya estaba seleccionada
                if (selectedEvent === evento) {
                    evento.classList.remove('selected');
                    eventos.forEach(ev => ev.classList.remove('dim'));
                    selectedEvent = null;
                } else {
                    // Seleccionar la tarjeta y oscurecer las demás
                    if (selectedEvent) {
                        selectedEvent.classList.remove('selected');
                    }
                    selectedEvent = evento;
                    selectedEvent.classList.add('selected');
                    eventos.forEach(ev => {
                        if (ev !== evento) {
                            ev.classList.add('dim');
                        } else {
                            ev.classList.remove('dim');
                        }
                    });
                }
            });
        });
    }
}

// Ejecutar la función para manejar eventos táctiles
aplicarInteraccionesTarjetas();


// Activar el comportamiento
aplicarInteraccionesTarjetas();

