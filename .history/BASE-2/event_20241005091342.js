document.addEventListener('DOMContentLoaded', async () => {
    try {
        const fechaInicioInput = document.getElementById('fechaInicio').value;
        const fechaFinInput = document.getElementById('fechaFin').value;

        let fechaInicio, fechaFin;

        if (!fechaInicioInput || !fechaFinInput) {
            const now = new Date();
            fechaFin = now.toISOString().split('T')[0] + ' 23:59:59';
            fechaInicio = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 00:00:00';
            console.log('Usando rango predeterminado de las últimas 24 horas:', { fechaInicio, fechaFin });
        } else {
            fechaInicio = `${fechaInicioInput} 00:00:00`;
            fechaFin = `${fechaFinInput} 23:59:59`;
        }

        console.log(`Fechas enviadas al backend: Inicio = ${fechaInicio}, Fin = ${fechaFin}`);

        // Cambiamos startDate y endDate por fechaInicio y fechaFin en la URL
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
            aplicarInteraccionesTarjetas();
        } else {
            console.error('No se encontraron eventos o hubo un problema.');
        }
    } catch (error) {
        console.error('Error al cargar eventos:', error);
    }
});

document.getElementById('applyCustomFilter').addEventListener('click', function() {
    document.dispatchEvent(new Event('DOMContentLoaded'));
});


/// Función para mostrar los eventos en el DOM
function mostrarEventos(eventos) {
    const contenedorEventos = document.getElementById('eventos-container');

    // Limpiar el contenedor antes de mostrar nuevos eventos
    contenedorEventos.innerHTML = '';

    eventos.forEach(evento => {
        const eventoElement = document.createElement('div');
        eventoElement.classList.add('evento');

        let eventoHTML;

        // Verificar el tipo de acción del evento
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
                <div class="accion" style="display:none;">
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
                <div class="accion" style="display:none;">
                    ${evento.descripcion.split('\n').map(line => `<p>${line}</p>`).join('')}
                </div>
                <div class="fecha">${new Date(evento.fecha).toLocaleString()}</div>
            `;
        }

        eventoElement.innerHTML = eventoHTML;
        contenedorEventos.appendChild(eventoElement);

        // Añadir el comportamiento para expandir/contraer contenido
        eventoElement.addEventListener('click', () => {
            const accionElement = eventoElement.querySelector('.accion');
            if (accionElement.style.display === 'none') {
                accionElement.style.display = 'block';  // Expandir el contenido
            } else {
                accionElement.style.display = 'none';  // Contraer el contenido
            }

            // Alternar la clase "selected" para el estilo visual
            eventoElement.classList.toggle('selected');
        });
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
