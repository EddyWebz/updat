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
        } else {
            console.error('No se encontraron eventos o hubo un problema.');
        }
    } catch (error) {
        console.error('Error al cargar eventos:', error);
    }
});

const eventos = document.querySelectorAll('.evento');
    
    // Variable para almacenar el elemento seleccionado
    let selectedEvent = null;

    eventos.forEach(evento => {
        evento.addEventListener('click', () => {
            // Si ya había un evento seleccionado, lo deseleccionamos
            if (selectedEvent === evento) {
                // Si hacemos clic en el mismo evento seleccionado, removemos la clase de "activo" y restauramos las demás
                evento.classList.remove('selected');
                eventos.forEach(ev => ev.classList.remove('dim'));
                selectedEvent = null; // Ningún evento está seleccionado ahora
            } else {
                // Si hay otro evento seleccionado, lo restauramos
                if (selectedEvent) {
                    selectedEvent.classList.remove('selected');
                }
                // Seleccionar el nuevo evento
                evento.classList.add('selected');
                // Oscurecer todos los demás eventos
                eventos.forEach(ev => {
                    if (ev !== evento) {
                        ev.classList.add('dim');
                    } else {
                        ev.classList.remove('dim');
                    }
                });
                selectedEvent = evento; // Marcar este como seleccionado
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
        // Añadir el evento al contenedor
        contenedorEventos.appendChild(eventoElement);
    });
}
