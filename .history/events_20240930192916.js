const express = require('express');
const router = express.Router();
const connection = require('./database/database-promise');
const jwt = require('jsonwebtoken');
const secretKey = 'clavesecreta'; // Clave secreta para firmar los JWT

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

router.get('/eventos', verifyJWT, async (req, res) => {
    try {
        let { startDate, endDate } = req.query;

        // Si no se proporciona una fecha, por defecto se muestran los eventos de las últimas 24 horas
        if (!startDate || !endDate) {
            const now = new Date();
            endDate = now.toISOString().slice(0, 19).replace('T', ' ');
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
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



module.exports = router;
