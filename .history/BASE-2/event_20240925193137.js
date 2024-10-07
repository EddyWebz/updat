document.addEventListener('DOMContentLoaded', async () => {
    // Llamar a la API para obtener los eventos
    try {
        const response = await fetch('/api/eventos', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener eventos');
        }

        const eventos = await response.json();

        // Llamar a la función que mostrará los eventos
        mostrarEventos(eventos);
    } catch (error) {
        console.error('Error al cargar los eventos:', error);
        alert('No se pudieron cargar los eventos.');
    }
});

// Función para mostrar eventos en el DOM
function mostrarEventos(eventos) {
    const eventosContainer = document.getElementById('eventos-container');

    if (!eventos.length) {
        eventosContainer.innerHTML = '<p>No hay eventos registrados.</p>';
        return;
    }

    // Limpiar contenedor
    eventosContainer.innerHTML = '';

    eventos.forEach((evento) => {
        const eventoElement = document.createElement('div');
        eventoElement.classList.add('evento');

        // Formatear la fecha
        const fecha = new Date(evento.fecha).toLocaleString();

        // Crear contenido para el evento
        eventoElement.innerHTML = `
            <p><strong>Usuario:</strong> ${evento.usuario}</p>
            <p><strong>Acción:</strong> ${evento.accion}</p>
            <p><strong>Vehículo Placa:</strong> ${evento.vehiculo_placa}</p>
            <p><strong>Propietario:</strong> ${evento.propietario}</p>
            <p><strong>Habitación:</strong> ${evento.habitacion}</p>
            <p><strong>Descripción:</strong> ${evento.descripcion}</p>
            <p><strong>Fecha:</strong> ${fecha}</p>
            <hr />
        `;

        // Añadir el evento al contenedor
        eventosContainer.appendChild(eventoElement);
    });
}
