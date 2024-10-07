// Ya no es necesario manejar la interacción de clic
// Sólo necesitamos mantener la lógica para mostrar los eventos

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const fechaInicioInput = document.getElementById('fechaInicio').value;
        const fechaFinInput = document.getElementById('fechaFin').value;

        let fechaInicio, fechaFin;

        if (!fechaInicioInput || !fechaFinInput) {
            const now = new Date();
            fechaFin = now.toISOString().split('T')[0] + ' 23:59:59';
            fechaInicio = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 00:00:00';
        } else {
            fechaInicio = `${fechaInicioInput} 00:00:00`;
            fechaFin = `${fechaFinInput} 23:59:59`;
        }

        let url = `/api/eventos?fechaInicio=${encodeURIComponent(fechaInicio)}&fechaFin=${encodeURIComponent(fechaFin)}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
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
    contenedorEventos.innerHTML = '';

    eventos.forEach(evento => {
        const eventoElement = document.createElement('div');
        eventoElement.classList.add('evento');

        let eventoHTML;

        if (evento.accion === 'Registro') {
            eventoHTML = `
                <div class="informacion">
                    <strong>${evento.usuario}</strong> registró un vehículo con placa <strong>${evento.vehiculo_placa}</strong>, 
                    Propietario: <strong>${evento.propietario}</strong>, Habitación: <strong>${evento.habitacion}</strong>
                </div>
                <div class="fecha">${new Date(evento.fecha).toLocaleString()}</div>
            `;
        } else if (evento.accion === 'Movió') {
            eventoHTML = `
                <div class="informacion">
                    <strong>${evento.usuario}</strong> movió el vehículo con placa: <strong>${evento.vehiculo_placa}</strong>,
                    Propietario: <strong>${evento.propietario}</strong>, Habitación: <strong>${evento.habitacion}</strong>
                </div>
                <div class="accion">
                    ${evento.descripcion}
                </div>
                <div class="fecha">${new Date(evento.fecha).toLocaleString()}</div>
            `;
        } else {
            eventoHTML = `
                <div class="informacion">
                    <strong>${evento.usuario}</strong> actualizó datos del vehículo Placa: <strong>${evento.vehiculo_placa}</strong>, 
                    Propietario: <strong>${evento.propietario}</strong>, Habitación: <strong>${evento.habitacion}</strong>
                </div>
                <div class="accion">
                    ${evento.descripcion.split('\n').map(line => `<p>${line}</p>`).join('')}
                </div>
                <div class="fecha">${new Date(evento.fecha).toLocaleString()}</div>
            `;
        }

        eventoElement.innerHTML = eventoHTML;
        contenedorEventos.appendChild(eventoElement);
    });
}
