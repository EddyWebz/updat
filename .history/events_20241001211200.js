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
        let { fechaInicio, fechaFin } = req.query; // Cambiamos a fechaInicio y fechaFin

        // Log para ver las fechas iniciales recibidas del frontend
        console.log(`Fechas recibidas del frontend: Inicio = ${fechaInicio}, Fin = ${fechaFin}`);

        // Si no se proporcionan fechas, establecer rango predeterminado de 24 horas
        if (!fechaInicio || !fechaFin) {
            const now = new Date();
            fechaFin = now.toISOString().split('T')[0] + ' 23:59:59';
            fechaInicio = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 00:00:00';
        }

        // Log para ver cómo se procesan las fechas antes de hacer la consulta SQL
        console.log(`Fechas procesadas en el backend: Inicio = ${fechaInicio}, Fin = ${fechaFin}`);

        const [eventos] = await connection.execute(
            `SELECT * FROM eventos WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC`,
            [fechaInicio, fechaFin]
        );

        // Log para ver el resultado de la consulta antes de enviarlo al frontend
        console.log('Eventos obtenidos:', eventos);

        return res.json({ success: true, eventos });
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener eventos' });
    }
});



module.exports = router;
