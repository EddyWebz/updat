const express = require('express');
const router = express.Router();
const connection = require('./database/database-promise');
const jwt = require('jsonwebtoken');
const { emitirActualizacionEvento } = require('./websockets');  // Importar la función desde websockets.js
const secretKey = 'clavesecreta';  // Clave secreta para firmar los JWT

// Middleware para verificar el JWT en las cookies
function verifyJWT(req, res, next) {
    const token = req.cookies.token;  // Leer la cookie llamada "token"
    if (!token) {
        return res.status(403).json({ success: false, message: 'No se proporcionó token.' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Token inválido.' });
        }
        req.userId = decoded.userId;  // Extraer el `userId` del token
        next();
    });
}

// Ruta para obtener eventos
router.get('/eventos', verifyJWT, async (req, res) => {
    try {
        let { startDate, endDate } = req.query;

        // Si no se proporciona una fecha, se configura el rango para las últimas 24 horas
        if (!startDate || !endDate) {
            const now = new Date();
            endDate = new Date(now.setHours(23, 59, 59, 999)).toISOString().slice(0, 19).replace('T', ' ');
            startDate = new Date(now.setDate(now.getDate() - 1)).toISOString().slice(0, 19).replace('T', ' ');
        }

        // Consulta a la base de datos con el rango de fechas
        const [eventos] = await connection.query(
            'SELECT usuario, accion, vehiculo_placa, propietario, habitacion, descripcion, fecha FROM eventos WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC', 
            [startDate, endDate]
        );

        // Enviar la lista de eventos al frontend
        res.json({ success: true, eventos });
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        res.status(500).json({ success: false, message: 'Error al obtener los eventos' });
    }
});

// Ruta para crear un nuevo evento y emitir una actualización en vivo
router.post('/eventos', verifyJWT, async (req, res) => {
    try {
        const { usuario, accion, vehiculo_placa, propietario, habitacion, descripcion, fecha } = req.body;

        // Insertar el evento en la base de datos
        const [resultado] = await connection.query(
            'INSERT INTO eventos (usuario, accion, vehiculo_placa, propietario, habitacion, descripcion, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [usuario, accion, vehiculo_placa, propietario, habitacion, descripcion, fecha]
        );

        // Emitir evento para actualizar en vivo
        emitirActualizacionEvento({
            usuario,
            accion,
            vehiculo_placa,
            propietario,
            habitacion,
            descripcion,
            fecha
        });

        res.json({ success: true, message: 'Evento registrado correctamente' });
    } catch (error) {
        console.error('Error al registrar evento:', error);
        res.status(500).json({ success: false, message: 'Error al registrar evento' });
    }
});

module.exports = router;
