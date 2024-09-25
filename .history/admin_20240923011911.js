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
router.put('/',verifyJWT, async (req, res) => {
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

// Ruta para registrar un nuevo usuario
router.post('/register', async (req, res) => {
    const { nombre, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)';

    try {
        const [result] = await connection.query(sql, [nombre, email, hashedPassword]);
        const userId = result.insertId;
        const token = generateToken(userId);  // Generar JWT después de registrar
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000  // 24 horas
        });
        res.status(201).json({ success: true, message: 'Usuario registrado exitosamente' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).send('El correo ya está registrado');
        } else {
            res.status(500).send('Error del servidor');
        }
    }
});
module.exports = router;
