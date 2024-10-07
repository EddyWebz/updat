const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('./database/database-promise'); // Asegúrate de que la conexión a la base de datos esté bien configurada
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
        req.userName = decoded.name || decoded.nombre;  // Extraer `name` o `nombre` según el caso
        console.log(`Token verificado correctamente, userId: ${req.userId}`);
        next();
    });
}


// Endpoint para actualizar el garaje cuando se mueve un vehículo
router.post('/actualizar-garaje', verifyJWT, async (req, res) => {
    const { id, nuevoGaraje } = req.body;
    const userName = req.userName;

    try {
        // Obtener el estado actual del vehículo antes de moverlo
        const [vehicleRows] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [id]);

        if (vehicleRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Vehículo no encontrado.' });
        }

        const currentVehicle = vehicleRows[0];

        // Verificar si el garaje ha cambiado
        if (currentVehicle.garage === nuevoGaraje) {
            return res.status(400).json({ success: false, message: 'El vehículo ya está en este garaje.' });
        }

        // Actualizar el garaje
        const [result] = await pool.query('UPDATE vehiculos SET garage = ? WHERE id = ?', [nuevoGaraje, id]);

        if (result.affectedRows > 0) {
            // Registro del evento en la tabla de eventos
            const eventQuery = 'INSERT INTO eventos (usuario, accion, vehiculo_placa, propietario, habitacion, descripcion, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const eventDetails = `Se movió del garaje ${currentVehicle.garage} al garaje ${nuevoGaraje}`;
            const datetime = new Date();
            await pool.query(eventQuery, [userName, 'Movió', currentVehicle.plate, currentVehicle.owner, currentVehicle.habitacion, eventDetails, datetime]);

            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ success: false, message: 'No se pudo actualizar el garaje.' });
        }
    } catch (error) {
        console.error('Error al actualizar el garaje:', error);
        res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
});

module.exports = router;