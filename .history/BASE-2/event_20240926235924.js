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
                <p><strong>${evento.usuario}</strong> registró un vehículo con placa <strong>${evento.vehiculo_placa}</strong>, 
                Propietario <strong>${evento.propietario}</strong>, Habitación <strong>${evento.habitacion}</strong></p>
                <p class="fecha">Fecha de acción: ${new Date(evento.fecha).toLocaleString()}</p>
            `;
        } else if (evento.accion === 'Movió') {
            // Para el evento "Movió"
            eventoHTML = `
                <p><strong>${evento.usuario}</strong> movió el vehículo con placa: ${evento.vehiculo_placa}, 
                propietario: ${evento.propietario}, habitación: ${evento.habitacion}</p>
                <p>${evento.descripcion}</p>
                <p class="fecha">Fecha de acción: ${new Date(evento.fecha).toLocaleString()}</p>
            `;
        } else {
            // Para otros tipos de acciones como "Actualizó"
            eventoHTML = `
                <!-- Línea Informativa -->
                <div class="informacion">
                    <p><strong>${evento.usuario}</strong> [${evento.accion}] datos del vehículo 
                    Placa: [${evento.vehiculo_placa}] 
                    Propietario: [${evento.propietario}] 
                    Habitación: [${evento.habitacion}]</p>
                </div>
                <!-- Línea de Ejecución / Descripción de la acción -->
                <div class="accion">
                    <p>${evento.descripcion}</p>
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
