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
        console.log('Respuesta del backend en /api/auth-check:', result);

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

async function generarReporteAutomatico() {
    const isAuthenticated = await checkAuthentication();  // Verifica si está autenticado antes de enviar la petición
    if (!isAuthenticated) return;  // Si no está autenticado, detener la ejecución
    try {
        const response = await fetch('/api/reportes', {
            
            credentials: 'include'  // Incluir las cookies con el token JWT
        });
        const data = await response.json();

        const tbodyP1 = document.getElementById('tabla-reporte-P1').querySelector('tbody');
        const tbodyP2 = document.getElementById('tabla-reporte-P2').querySelector('tbody');
        tbodyP1.innerHTML = '';
        tbodyP2.innerHTML = '';

        data.P1.forEach(registro => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td data-id="${registro.id}">${registro.habitacion}</td><td>${registro.plate}</td>`;

            tbodyP1.appendChild(tr);
        });

        data.P2.forEach(registro => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td data-id="${registro.id}">${registro.habitacion}</td><td>${registro.plate}</td>`;

            tbodyP2.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al generar el reporte:', error);
    }
}

function imprimirReporte() {
    if (!window.location.hash) {
        window.location = window.location + '#imprimir';
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

window.addEventListener('afterprint', function() {
    window.location.reload();
});
