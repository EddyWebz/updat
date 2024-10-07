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
        const { startDate, endDate } = req.query;

        // Validar que se proporcionen las fechas
        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Debe proporcionar un rango de fechas válido.' });
        }

        // Consulta a la base de datos con el rango de fechas
        const [eventos] = await connection.query(
            'SELECT usuario, accion, vehiculo_placa, propietario, habitacion, descripcion, fecha FROM eventos WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC', 
            [startDate, endDate]
        );

        res.json({ success: true, eventos });
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        res.status(500).json({ success: false, message: 'Error al obtener los eventos' });
    }
});


module.exports = router;
