const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
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
        console.log(`Token verificado correctamente, userId: ${req.userId}`);
        next();
    });
}


// Ruta para actualizar el correo y la contraseña del administrador
router.put('/', verifyJWT, async (req, res) => {
    const { email, password } = req.body;

    try {
        const updates = [];
        const values = [];

        if (email) {
            updates.push('email = ?');
            values.push(email);
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push('password = ?');
            values.push(hashedPassword);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No se proporcionaron datos para actualizar.' });
        }

        const query = `UPDATE usuarios SET ${updates.join(', ')} WHERE id = 16`;
        await connection.query(query, values);

        res.json({ success: true, message: 'Datos actualizados correctamente.' });
    } catch (error) {
        console.error('Error al actualizar los datos del administrador:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar los datos.' });
    }
});

module.exports = router;
