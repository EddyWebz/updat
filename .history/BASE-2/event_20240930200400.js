document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Establecer las fechas por defecto (últimas 24 horas)
        const now = new Date();
        const endDate = now.toISOString().split('T')[0]; // Fecha de hoy
        const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Fecha de ayer

        // Mostrar las fechas por defecto en los inputs
        document.getElementById('startDate').value = startDate;
        document.getElementById('endDate').value = endDate;

        // Hacer una solicitud solo si no hay fechas manuales
        let url = `/api/eventos?startDate=${startDate}&endDate=${endDate} 23:59:59`;

        // Log para ver la URL que se está enviando por defecto
        console.log(`Solicitando eventos por defecto con URL: ${url}`);

        // Enviar solicitud GET con las fechas por defecto
        const response = await fetch(url, {
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

        // Log para ver los datos recibidos por defecto
        console.log('Respuesta por defecto recibida:', data);

        if (data.success && data.eventos) {
            mostrarEventos(data.eventos);
            aplicarInteraccionesTarjetas();  // Aplicar las interacciones después de mostrar los eventos
        } else {
            console.error('No se encontraron eventos o hubo un problema.');
        }
    } catch (error) {
        console.error('Error al cargar eventos por defecto:', error);
    }
});

// Añadir el event listener para el botón de aplicar filtro
document.getElementById('applyFilter').addEventListener('click', async function() {
    try {
        // Capturar los valores de las fechas seleccionadas
        let startDate = document.getElementById('startDate').value;
        let endDate = document.getElementById('endDate').value;

        // Si los campos tienen valores, usar las fechas seleccionadas
        if (startDate && endDate) {
            // Añadir la hora final para que termine a las 23:59:59
            endDate += ' 23:59:59';
            console.log('Fechas seleccionadas por el usuario:', { startDate, endDate });
        } else {
            // Si no hay fechas seleccionadas, usar fechas por defecto (últimas 24 horas)
            const now = new Date();
            endDate = now.toISOString().split('T')[0] + ' 23:59:59'; // Fecha de hoy, final del día
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            console.log('Usando fechas por defecto:', { startDate, endDate });
        }

        // Construir la URL con las fechas seleccionadas o por defecto
        let url = `/api/eventos?startDate=${startDate}&endDate=${endDate}`;

        // Log para ver la URL que se está enviando
        console.log(`Solicitando eventos con URL: ${url}`);

        // Enviar solicitud GET con las fechas seleccionadas o por defecto
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Incluir cookies para autenticación
        });

        // Verificar si la respuesta es correcta
        if (!response.ok) {
            throw new Error('Error al obtener los eventos');
        }

        const data = await response.json();

        // Log para ver si los datos se han recibido correctamente
        console.log('Respuesta recibida:', data);

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
document.getElementById('applyFilter').addEventListener('click', function() {
    console.log('Aplicar filtro presionado');
    // Llamar al evento de carga de eventos con las fechas seleccionadas
    document.dispatchEvent(new Event('DOMContentLoaded'));
});
