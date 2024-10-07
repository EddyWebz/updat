// event.js

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

        // Procesar la respuesta y convertirla a JSON
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

        // Construir el contenido del evento con la estructura deseada
        eventoElement.innerHTML = `
            <p><strong>Usuario:</strong> ${evento.user_id}</p>
            <p><strong>Acción:</strong> ${evento.accion}</p>
            <p><strong>Detalles:</strong> ${evento.detalles}</p>
            <p><strong>Fecha:</strong> ${new Date(evento.fecha).toLocaleString()}</p>
            <hr>
        `;

        // Añadir el evento al contenedor
        contenedorEventos.appendChild(eventoElement);
    });
}
