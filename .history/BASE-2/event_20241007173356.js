document.addEventListener('DOMContentLoaded', function () {
    const fechaInicioInput = document.getElementById('fechaInicio');
    const fechaFinInput = document.getElementById('fechaFin');
    
    // Obtener eventos al cargar la página
    fetchEventos();

    // Escuchar el cambio de fechas
    document.getElementById('filtroFechas').addEventListener('submit', function (event) {
        event.preventDefault();
        fetchEventos();
    });

    function fetchEventos() {
        let fechaInicio = fechaInicioInput.value;
        let fechaFin = fechaFinInput.value;

        // Si no se proporciona ninguna fecha, usar el día actual
        if (!fechaInicio || !fechaFin) {
            const now = new Date();
            const today = now.toISOString().split('T')[0];  // Obtener la fecha actual en formato YYYY-MM-DD
            fechaInicio = today + ' 00:00:00';  // Inicio del día actual
            fechaFin = today + ' 23:59:59';     // Fin del día actual
        } else {
            // Si se proporciona una fecha, asegurarse de que cubra desde las 00:00 hasta las 23:59
            fechaInicio = fechaInicio + ' 00:00:00';
            fechaFin = fechaFin + ' 23:59:59';
        }

        // Enviar la solicitud con las fechas al backend
        fetch(`/eventos?fechaInicio=${encodeURIComponent(fechaInicio)}&fechaFin=${encodeURIComponent(fechaFin)}`)
            .then(response => response.json())
            .then(data => {
                console.log('Eventos recibidos:', data);
                // Aquí puedes procesar los datos y mostrarlos en tu frontend
            })
            .catch(error => {
                console.error('Error al obtener los eventos:', error);
            });
    }
});


document.getElementById('applyCustomFilter').addEventListener('click', function() {
    document.dispatchEvent(new Event('DOMContentLoaded'));
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

// Añadir el event listener para el botón de aplicar filtro
document.getElementById('applyCustomFilter').addEventListener('click', function() {
    // Llamar al evento de carga de eventos con las fechas seleccionadas
    document.dispatchEvent(new Event('DOMContentLoaded'));
});
