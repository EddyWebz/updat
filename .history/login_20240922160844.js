const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('./database/database-promise');

// Configuración de JWT
const JWT_SECRET = 'clavesecreta';  // Este será el secreto para firmar los tokens JWT
const JWT_EXPIRATION = '24h';  // Duración del token

// Función para generar un JWT
function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

// Ruta para iniciar sesión (login)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM usuarios WHERE email = ?';

    try {
        const [results] = await connection.query(sql, [email]);
        if (results.length > 0) {
            const isMatch = await bcrypt.compare(password, results[0].password);
            if (isMatch) {
                const token = generateToken(results[0].id);  // Generar el JWT
                res.cookie('token', token, {
                    httpOnly: true,  // Asegurarse de que la cookie no sea accesible desde JavaScript
                    secure: process.env.NODE_ENV === 'production',  // Usar secure solo en producción
                    maxAge: 24 * 60 * 60 * 1000  // Duración: 24 horas
                });
                res.status(200).json({ success: true, message: 'Inicio de sesión exitoso' });
            } else {
                res.status(401).send('Contraseña incorrecta');
            }
        } else {
            res.status(404).send('Usuario no encontrado');
        }
    } catch (err) {
        res.status(500).send('Error del servidor');
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

// Ruta para cerrar sesión (logout)
router.post('/auth/logout', (req, res) => {
    res.clearCookie('token');  // Eliminar la cookie del token JWT
    return res.status(200).json({ success: true, message: 'Sesión cerrada exitosamente' });
});

module.exports = router;
