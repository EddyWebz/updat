document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/eventos', {
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

function mostrarEventos(eventos) {
    const contenedorEventos = document.getElementById('eventos-container');
    contenedorEventos.innerHTML = ''; // Limpiar contenedor

    eventos.forEach(evento => {
        const eventoElement = document.createElement('div');
        eventoElement.classList.add('evento');

        let detalles = ''; // Variable para almacenar los detalles formateados

        // Modelo de presentación según el tipo de acción
        if (evento.accion === 'Registro') {
            detalles = `
                <p><strong>Usuario:</strong> ${evento.usuario}</p>
                <p><strong>Acción:</strong> Registro</p>
                <p><strong>Detalles:</strong> Vehículo Placa: ${evento.vehiculo_placa}, Propietario: ${evento.propietario}, Habitación: ${evento.habitacion}</p>
                <p><strong>Fecha:</strong> ${new Date(evento.fecha).toLocaleString()}</p>
                <hr>
            `;
        } else if (evento.accion === 'Actualización') {
            detalles = `
                <p><strong>Usuario:</strong> ${evento.usuario}</p>
                <p><strong>Acción:</strong> Actualización</p>
                <p><strong>Detalles:</strong> ${evento.descripcion}</p>
                <p><strong>Fecha:</strong> ${new Date(evento.fecha).toLocaleString()}</p>
                <hr>
            `;
        }

        eventoElement.innerHTML = detalles;
        contenedorEventos.appendChild(eventoElement);
    });
}
