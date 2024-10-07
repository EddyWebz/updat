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
            eventoHTML = `
                <div class="informacion">
                    <p><strong>${evento.usuario}</strong> registró un vehículo <strong>${evento.vehiculo_placa}</strong></p>
                    <p class="fecha">${new Date(evento.fecha).toLocaleDateString()}</p>
                </div>
            `;
        } else if (evento.accion === 'Movió') {
            eventoHTML = `
                <div class="informacion">
                    <p><strong>${evento.usuario}</strong> movió el vehículo con placa <strong>${evento.vehiculo_placa}</strong></p>
                    <p class="accion">${evento.descripcion}</p>
                    <p class="fecha">${new Date(evento.fecha).toLocaleDateString()}</p>
                </div>
            `;
        } else {
            eventoHTML = `
                <div class="informacion">
                    <p><strong>${evento.usuario}</strong> actualizó datos del vehículo <strong>${evento.vehiculo_placa}</strong></p>
                </div>
                <div class="accion">${evento.descripcion}</div>
                <div class="fecha">${new Date(evento.fecha).toLocaleDateString()}</div>
            `;
        }

        eventoElement.innerHTML = eventoHTML;
        contenedorEventos.appendChild(eventoElement);
    });
}
