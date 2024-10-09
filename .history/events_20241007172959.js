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


// Ruta para obtener eventos filtrados por fecha
router.get('/eventos', verifyJWT, async (req, res) => {
    try {
        // Verificar las fechas recibidas en la solicitud
        let { fechaInicio, fechaFin } = req.query;

        // Imprimir las fechas recibidas
        console.log("Fechas recibidas en la solicitud:");
        console.log(`Fecha de inicio: ${fechaInicio}, Fecha de fin: ${fechaFin}`);

        // Si no se proporciona fechaInicio o fechaFin, asignar el rango predeterminado de las últimas 24 horas
        if (!fechaInicio || !fechaFin) {
            const now = new Date();
            fechaFin = now.toISOString().split('T')[0] + ' 23:59:59';
            fechaInicio = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 00:00:00';
        }

        // Imprimir las fechas que serán usadas para la consulta SQL
        console.log(`Usando las fechas para la consulta: Inicio = ${fechaInicio}, Fin = ${fechaFin}`);

        // Ejecutar la consulta para obtener los eventos en el rango de fechas especificado
        const [eventos] = await connection.execute(
            `SELECT * FROM eventos WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC`,
            [fechaInicio, fechaFin]
        );

        // Si hay eventos, imprimir cuántos fueron encontrados
        console.log(`${eventos.length} eventos encontrados.`);

        return res.json({ success: true, eventos });
    } catch (error) {
        // Manejo de errores y mostrar el error en la consola
        console.error('Error al obtener eventos:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener eventos' });
    }
});


module.exports = router;
