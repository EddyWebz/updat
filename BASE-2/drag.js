document.addEventListener('DOMContentLoaded', () => {
    const p1List = document.querySelector('#tabla-reporte-P1 tbody');
    const p2List = document.querySelector('#tabla-reporte-P2 tbody');

    Sortable.create(p1List, {
        group: 'shared',
        animation: 150, // Animación suave de las filas
        handle: 'tr', // Se puede arrastrar la fila completa
        delay: 300, // 300 milisegundos de retraso antes de activar el arrastre
        delayOnTouchOnly: true, // Retraso solo en dispositivos táctiles
        onStart: function (evt) {
            evt.item.classList.add('sortable-selected'); // Agrega clase para la animación
        },
        onEnd: async function (evt) {
            evt.item.classList.remove('sortable-selected'); // Remueve la clase al terminar
            // Aquí va el código para actualizar la base de datos
            const itemEl = evt.item;
            const nuevoGaraje = evt.to.closest('table').id === 'tabla-reporte-P1' ? 'P1' : 'P2';
            const id = itemEl.querySelector('td[data-id]').getAttribute('data-id');

            const response = await fetch('/api/actualizar-garaje', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, nuevoGaraje })
            });

            if (!response.ok) {
                evt.from.appendChild(itemEl); // Si hay un error, revierte el movimiento
            }
        }
    });

    Sortable.create(p2List, {
        group: 'shared',
        animation: 150,
        handle: 'tr',
        delay: 300,
        delayOnTouchOnly: true,
        onStart: function (evt) {
            evt.item.classList.add('sortable-selected');
        },
        onEnd: async function (evt) {
            evt.item.classList.remove('sortable-selected');
            const itemEl = evt.item;
            const nuevoGaraje = evt.to.closest('table').id === 'tabla-reporte-P1' ? 'P1' : 'P2';
            const id = itemEl.querySelector('td[data-id]').getAttribute('data-id');

            const response = await fetch('/api/actualizar-garaje', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, nuevoGaraje })
            });

            if (!response.ok) {
                evt.from.appendChild(itemEl); // Si hay un error, revierte el movimiento
            }
        }
    });
});
