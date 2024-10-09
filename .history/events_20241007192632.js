const express = require('express');
const router = express.Router();
const connection = require('./database/database-promise');
const jwt = require('jsonwebtoken');
const secretKey = 'clavesecreta'; // Clave secreta para firmar los JWT
const moment = require('moment-timezone');


// Middleware para verificar el JWT en las cookies
function verifyJWT(req, res, next) {
    const token = req.cookies.token; // Leer la cookie llamada "token"

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


// Función para convertir UTC a la hora local
function convertirUTCaLocal(fechaUTC) {
    const fecha = new Date(fechaUTC);
    const offset = -5 * 60; // UTC-5 (América/Guayaquil)
    const fechaLocal = new Date(fecha.getTime() + offset * 60000);
    return fechaLocal;
}

// Ruta para obtener eventos filtrados por fecha
router.get('/eventos', verifyJWT, async (req, res) => {
    try {
        let { fechaInicio, fechaFin } = req.query;

        if (!fechaInicio || !fechaFin) {
            const now = new Date();
            fechaInicio = now.toISOString().split('T')[0] + ' 00:00:00'; // Inicio del día actual
            fechaFin = now.toISOString().split('T')[0] + ' 23:59:59'; // Fin del día actual
        }

        const [eventos] = await connection.execute(
            `SELECT * FROM eventos WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC`,
            [fechaInicio, fechaFin]
        );

        // Convertir las fechas de los eventos a la hora local
        const eventosConvertidos = eventos.map(evento => ({
            ...evento,
            fecha: convertirUTCaLocal(evento.fecha)
        }));

        console.log(`${eventosConvertidos.length} eventos encontrados.`);
        return res.json({ success: true, eventos: eventosConvertidos });
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener eventos' });
    }
});


module.exports = router;
