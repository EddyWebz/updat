const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('./database/database-promise');

// Configuración de JWT
const JWT_SECRET = 'clavesecreta';  // Este será el secreto para firmar los tokens JWT
const JWT_EXPIRATION = '24h';  // Duración del token

// Función para generar un JWT
function generateToken(userId,role) {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
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
                const role = results[0].role; // Asumiendo que tienes una columna 'role' que define si es 'admin' o 'user'
                const token = generateToken(results[0].id, role);  // Generar el JWT con el rol
                res.cookie('token', token, {
                    httpOnly: true,  // Asegurarse de que la cookie no sea accesible desde JavaScript
                    secure: process.env.NODE_ENV === 'production',  // Usar secure solo en producción
                    maxAge: 24 * 60 * 60 * 1000  // Duración: 24 horas
                });

                // Redirigir a la sección correcta basada en el rol
                if (role === 'admin') {
                    res.status(200).json({ success: true, message: 'Inicio de sesión exitoso', redirect: '/admin/dashboard' });
                } else {
                    res.status(200).json({ success: true, message: 'Inicio de sesión exitoso', redirect: '/user/dashboard' });
                }
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



// Ruta para cerrar sesión (logout)
router.post('/logout', (req, res) => {
    res.clearCookie('token');  // Eliminar la cookie del token JWT
    return res.status(200).json({ success: true, message: 'Sesión cerrada exitosamente' });
});

module.exports = router;
