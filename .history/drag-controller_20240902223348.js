const express = require('express');
const router = express.Router();
const pool = require('./database/database-promise'); // Asegúrate de que la conexión a la base de datos esté bien configurada

// Endpoint to update the garage when a vehicle is moved
router.post('/actualizar-garaje', async (req, res) => {
    const { id, nuevoGaraje } = req.body;

    try {
        const [result] = await pool.query(`
            UPDATE vehiculos
            SET garage = ?
            WHERE id = ?
        `, [nuevoGaraje, id]);

        if (result.affectedRows > 0) {
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
