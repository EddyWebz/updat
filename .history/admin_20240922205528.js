const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const connection = require('./database/database-promise');

// Ruta para actualizar el correo y la contraseña del administrador
router.put('/admin/update', async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // Actualizar la cuenta del administrador con id = 10
        const query = 'UPDATE usuarios SET email = ?, password = ? WHERE id = 16';
        await connection.query(query, [email, hashedPassword]);

        res.json({ success: true, message: 'Correo y contraseña actualizados correctamente.' });
    } catch (error) {
        console.error('Error al actualizar los datos del administrador:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar los datos.' });
    }
});

module.exports = router;
