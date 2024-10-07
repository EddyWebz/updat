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
router.get('/eventos', isAuthenticated, async (req, res) => {
    try {
        let { fechaInicio, fechaFin } = req.query; // Cambiamos a fechaInicio y fechaFin

        if (!fechaInicio || !fechaFin) {
            const now = new Date();
            fechaFin = now.toISOString().split('T')[0] + ' 23:59:59';
            fechaInicio = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 00:00:00';
        }

        console.log(`Fechas recibidas en el backend: Inicio = ${fechaInicio}, Fin = ${fechaFin}`);

        const [eventos] = await db.execute(
            `SELECT * FROM eventos WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC`,
            [fechaInicio, fechaFin]
        );

        return res.json({ success: true, eventos });
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener eventos' });
    }
});




module.exports = router;
