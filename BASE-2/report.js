document.addEventListener('DOMContentLoaded', async () => {
    
    actualizarNotificaciones();
    generarReporteAutomatico();

    const script = document.createElement('script');
    script.src = '/drag.js';
    document.body.appendChild(script);

    setInterval(actualizarNotificaciones, 1 * 60 * 60 * 1000);
    setInterval(generarReporteAutomatico, 1 * 60 * 60 * 1000);

    document.getElementById('btn-imprimir').addEventListener('click', imprimirReporte);
//RUTA PARA REDIRIGIR A INICIO
    const homeLink = document.getElementById('home-link');
    homeLink.addEventListener('click', () => {
        window.location.href = '/privado/cuerpo.html';
    });
    
    //RUTA PARA REDIRIGIR A CONFIGURACION
    const config = document.getElementById('button_config');
    config.addEventListener('click', () => {
        window.location.href = '/privado/config.html';
    });
    
//RUTA PARA CERRAR SESION
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', async () => {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            window.location.href = '/login';
        }
    });

    const menuIcon = document.querySelector('.menu-icon');
    const dropdownContent = document.querySelector('.dropdown-content');

    menuIcon.addEventListener('click', () => {
        dropdownContent.classList.toggle('show');
        menuIcon.classList.toggle('open');
    });

    window.addEventListener('click', (e) => {
        if (!menuIcon.contains(e.target) && !dropdownContent.contains(e.target)) {
            dropdownContent.classList.remove('show');
            menuIcon.classList.remove('open');
        }
    });
});
async function checkAuthentication() {
    try {
        const response = await fetch('/api/auth-check', {
            method: 'GET',
            credentials: 'include'  // Incluir las cookies en la petición
        });

        const result = await response.json();

        if (!result.authenticated) {
            window.location.href = '/login';  // Redirigir al login si no está autenticado
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error al verificar la autenticación:', error);
        window.location.href = '/login';  // Redirigir en caso de error
        return false;
    }
}


async function actualizarNotificaciones() {
    const isAuthenticated = await checkAuthentication();  // Verifica si está autenticado antes de enviar la petición
    if (!isAuthenticated) return;  // Si no está autenticado, detener la ejecución
    try {
        const response = await fetch('/api/notificaciones', {
            
            credentials: 'include'  // Incluir las cookies con el token JWT
        });
        const data = await response.json();

        const contenedorP1 = document.getElementById('notificaciones-contenedor-P1');
        const contenedorP2 = document.getElementById('notificaciones-contenedor-P2');
        contenedorP1.innerHTML = '';
        contenedorP2.innerHTML = '';

        data.P1.forEach(notificacion => {
            const div = document.createElement('div');
            div.classList.add('notificacion');
            div.innerHTML = `<p><strong>Habitación:</strong> ${notificacion.habitacion} <strong>Placa:</strong> ${notificacion.plate}</p>`;
            contenedorP1.appendChild(div);
        });

        data.P2.forEach(notificacion => {
            const div = document.createElement('div');
            div.classList.add('notificacion');
            div.innerHTML = `<p><strong>Habitación:</strong> ${notificacion.habitacion} <strong>Placa:</strong> ${notificacion.plate}</p>`;
            contenedorP2.appendChild(div);
        });
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
    }
}

// Delegación de eventos en el contenedor padre
document.getElementById('Imprimir').addEventListener('click', function(event) {
    if (event.target && event.target.tagName === 'TD' && event.target.classList.contains('celda-habitacion')) {
        const id = event.target.getAttribute('data-id');
        openCommentInput(event.target, id);
    }
});



// Función para guardar el comentario en la base de datos
async function guardarComentarioEnBaseDatos(id, comentario) {
    try {
        const response = await fetch('/api/comentario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, comentario })
        });

        if (response.ok) {
            return true;
        } else {
            console.error('Error al guardar el comentario en la base de datos');
            return false;
        }
    } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        return false;
    }
}

// Función para abrir un cuadro de texto que permita modificar o eliminar el comentario si ya existe
function openCommentInput(celdaHabitacion, id) {
    if (celdaHabitacion) {
        if (!celdaHabitacion.querySelector('input')) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'input-comentario';

            // Cargar el comentario existente
            const comentarioDiv = celdaHabitacion.querySelector('.comentario');
            const comentarioExistente = comentarioDiv ? comentarioDiv.innerText : '';
            input.value = comentarioExistente;
            input.placeholder = 'Agregar o editar comentario';

            // Botón de Guardar
            const guardarBtn = document.createElement('button');
            guardarBtn.innerText = 'Guardar';
            guardarBtn.className = 'guardar-btn';

            // Botón de Eliminar
            const eliminarBtn = document.createElement('button');
            eliminarBtn.innerText = 'Eliminar';
            eliminarBtn.className = 'eliminar-btn';

            // Lógica para guardar el comentario
            guardarBtn.addEventListener('click', async function () {
                try {
                    const success = await guardarComentarioEnBaseDatos(id, input.value || '');
                    if (success) {
                        mostrarComentario(celdaHabitacion, input.value);
                        input.remove();
                        guardarBtn.remove();
                        eliminarBtn.remove();
                    }
                } catch (error) {
                    console.error('Error al guardar el comentario:', error);
                }
            });

            // Lógica para eliminar el comentario
            eliminarBtn.addEventListener('click', async function () {
                try {
                    const success = await guardarComentarioEnBaseDatos(id, '');
                    if (success) {
                        mostrarComentario(celdaHabitacion, '');
                        input.remove();
                        guardarBtn.remove();
                        eliminarBtn.remove();
                    }
                } catch (error) {
                    console.error('Error al eliminar el comentario:', error);
                }
            });

            celdaHabitacion.appendChild(input);
            celdaHabitacion.appendChild(guardarBtn);
            celdaHabitacion.appendChild(eliminarBtn);

            input.focus();
        }
    } else {
        console.error(`La celda con el id ${id} no se encontró en el DOM`);
    }
}

// MOSTRAR COMENTARIO
// Función para mostrar el comentario debajo de la habitación y actualizar la UI
function mostrarComentario(celdaHabitacion, comentario) {
    if (celdaHabitacion) {
        let comentarioExistente = celdaHabitacion.querySelector('.comentario');

        if (comentario) {
            if (comentarioExistente) {
                comentarioExistente.innerText = comentario;
            } else {
                const comentarioDiv = document.createElement('div');
                comentarioDiv.className = 'comentario';
                comentarioDiv.innerText = comentario;
                celdaHabitacion.appendChild(comentarioDiv);
            }
        } else {
            if (comentarioExistente) {
                comentarioExistente.remove();
            }
        }
    } else {
        console.error(`La celda no se encontró en el DOM`);
    }
}



// Función para generar el reporte automático
async function generarReporteAutomatico() {
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) return;

    try {
        const response = await fetch('/api/reportes', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) throw new Error('Error en la respuesta del servidor');

        const data = await response.json();

        const tbodyP1 = document.getElementById('tabla-reporte-P1').querySelector('tbody');
        const tbodyP2 = document.getElementById('tabla-reporte-P2').querySelector('tbody');

        tbodyP1.innerHTML = '';
        tbodyP2.innerHTML = '';

        // Generar la tabla para P1
        data.P1.forEach((registro) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td class="celda-habitacion" data-id="${registro.id}">
                                ${registro.habitacion}
                                ${registro.comentario ? `<div class="comentario">${registro.comentario}</div>` : ''}
                            </td>
                            <td data-id="${registro.id}" data-placa="${registro.plate}">${registro.plate}</td>`;
            tbodyP1.appendChild(tr);
        });

        // Generar la tabla para P2
        data.P2.forEach((registro) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td class="celda-habitacion" data-id="${registro.id}">
                                ${registro.habitacion}
                                ${registro.comentario ? `<div class="comentario">${registro.comentario}</div>` : ''}
                            </td>
                            <td data-id="${registro.id}" data-placa="${registro.plate}">${registro.plate}</td>`;
            tbodyP2.appendChild(tr);
        });

    } catch (error) {
        console.error('Error al generar el reporte:', error);
    }
}

function imprimirReporte() {
    if (!window.location.hash) {
        window.location.hash = 'imprimir';  // Añadir hash para evitar bucles infinitos de recarga
        window.location.reload();
    } else {
        const printContents = document.getElementById('Imprimir').innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;

        window.history.replaceState('', document.title, window.location.pathname);
    }
}

// Escucha el evento 'afterprint' para recargar la página automáticamente después de imprimir
window.addEventListener('afterprint', function() {
    window.location.reload();
});
