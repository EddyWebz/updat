let io;

// Inicializar WebSockets
function init(server) {
    io = require('socket.io')(server);

    io.on('connection', (socket) => {
        console.log('Nuevo cliente conectado.');

        socket.on('disconnect', () => {
            console.log('Cliente desconectado.');
        });
    });
}

// Emitir actualizaciones de eventos
function emitirActualizacionEvento(evento) {
    if (io) {
        io.emit('actualizarEventos', evento);
    }
}

module.exports = { init, emitirActualizacionEvento };
