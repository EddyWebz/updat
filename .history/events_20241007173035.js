const express = require('express');
const router = express.Router();
const connection = require('./database/database-promise');
const jwt = require('jsonwebtoken');
const secretKey = 'clavesecreta'; // Clave secreta para firmar los JWT
const moment = require('moment-timezone');

// Middleware para verificar el JWT en las cookies
router.get('/eventos', async (req, res) => {
    let { fechaInicio, fechaFin } = req.query;

    // Si no se proporcionan fechas, usar el día actual desde las 00:00 hasta las 23:59
    if (!fechaInicio || !fechaFin) {
        const now = new Date();
        const today = now.toISOString().split('T')[0];  // Obtener la fecha de hoy en formato YYYY-MM-DD
        
        // Establecer fechaInicio a las 00:00 del día actual y fechaFin a las 23:59 del día actual
        fechaInicio = today + ' 00:00:00';
        fechaFin = today + ' 23:59:59';
    } else {
        // Si se proporcionan fechas, asegurarse de que cubran desde las 00:00 hasta las 23:59 del mismo día
        fechaInicio = fechaInicio.split(' ')[0] + ' 00:00:00';  // Asegurarse de que fechaInicio comience a las 00:00:00
        fechaFin = fechaFin.split(' ')[0] + ' 23:59:59';        // Asegurarse de que fechaFin termine a las 23:59:59
    }

    // Convertir las fechas a UTC antes de ejecutar la consulta
    const fechaInicioUTC = moment.tz(fechaInicio, "America/Guayaquil").utc().format('YYYY-MM-DD HH:mm:ss');
    const fechaFinUTC = moment.tz(fechaFin, "America/Guayaquil").utc().format('YYYY-MM-DD HH:mm:ss');

    try {
        const [results] = await connection.query(
            'SELECT * FROM eventos WHERE fecha BETWEEN ? AND ? ORDER BY fecha ASC',
            [fechaInicioUTC, fechaFinUTC]
        );

        res.json(results);
    } catch (err) {
        console.error('Error al obtener los eventos:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});


module.exports = router;
