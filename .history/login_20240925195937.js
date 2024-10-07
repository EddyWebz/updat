const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('./database/database-promise');

// Configuración de JWT
const JWT_SECRET = 'clavesecreta';  // Este será el secreto para firmar los tokens JWT
const JWT_EXPIRATION = '24h';  // Duración del token


// Función para generar un JWT
function generateToken(userId, role, name) {
    const payload = { userId, role, name };  // Asegúrate de que el `name` esté incluido en el payload
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

// Ruta para iniciar sesión (login)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Consultar la tabla de sub-usuarios y usuarios principales
    const sqlMainUser = 'SELECT * FROM usuarios WHERE email = ?';
    const sqlSubUser = 'SELECT * FROM sub_usuarios WHERE email = ?';

    try {
        // Primero, intentamos encontrar al usuario en la tabla sub_usuarios
        const [subUserResults] = await connection.query(sqlSubUser, [email]);

        if (subUserResults.length > 0) {
            const subUser = subUserResults[0];
            const isMatch = await bcrypt.compare(password, subUser.password);

            if (isMatch) {
                // Generar JWT con el nombre y rol del sub-usuario
                const token = generateToken(subUser.id, 'sub-user', subUser.name);
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 24 * 60 * 60 * 1000  // 24 horas
                });

                // Redirigir a la misma ruta para sub-usuarios
                return res.status(200).json({ success: true, redirect: '/privado/cuerpo.html' });
            } else {
                return res.status(401).send('Contraseña incorrecta');
            }
        } 

        // Si no se encuentra en la tabla de sub-usuarios, buscar en usuarios principales
        const [mainUserResults] = await connection.query(sqlMainUser, [email]);

        if (mainUserResults.length > 0) {
            const mainUser = mainUserResults[0];
            const isMatch = await bcrypt.compare(password, mainUser.password);

            if (isMatch) {
                // Generar JWT para el usuario principal
                const token = generateToken(mainUser.id, mainUser.role);
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 24 * 60 * 60 * 1000  // 24 horas
                });

                // Si es un administrador, redirigir a una ruta especial
                if (mainUser.role === 'admin') {
                    return res.status(200).json({ success: true, message: 'Inicio de sesión exitoso', redirect: '/privado/admin.html' });
                }

                // Para usuarios normales, redirigir a la ruta cuerpo.html
                return res.status(200).json({ success: true, redirect: '/privado/cuerpo.html' });
            } else {
                return res.status(401).send('Contraseña incorrecta');
            }
        } else {
            return res.status(404).send('Usuario no encontrado');
        }
    } catch (err) {
        console.error('Error del servidor:', err);
        res.status(500).send('Error del servidor');
    }
});



// Ruta para cerrar sesión (logout)
router.post('/logout', (req, res) => {
    res.clearCookie('token');  // Eliminar la cookie del token JWT
    return res.status(200).json({ success: true, message: 'Sesión cerrada exitosamente' });
});

module.exports = router;
