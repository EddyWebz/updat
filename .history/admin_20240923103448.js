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

// Ruta para obtener todos los usuarios (solo ID, nombre y email)
router.get('/users', verifyJWT, async (req, res) => {
    try {
        const [users] = await connection.query('SELECT id, nombre, email FROM usuarios');
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
});

// Ruta para obtener los datos de un usuario específico
router.get('/user/:id', verifyJWT, async (req, res) => {
    const userId = req.params.id;
    try {
        const [user] = await connection.query('SELECT email FROM usuarios WHERE id = ?', [userId]);
        if (user.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los datos del usuario' });
    }
});

// Ruta para actualizar el correo y la contraseña de un usuario específico
router.put('/update/:id', verifyJWT, async (req, res) => {
    const userId = req.params.id;
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'UPDATE usuarios SET email = ?, password = ? WHERE id = ?';
        await connection.query(query, [email, hashedPassword, userId]);

        res.json({ success: true, message: 'Usuario actualizado exitosamente.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar los datos.' });
    }
});

// Ruta para registrar un nuevo usuario
router.post('/register', verifyJWT, async (req, res) => {
    const { nombre, email, password, role } = req.body;

    // Validación de campos
    if (!nombre || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios, incluyendo el rol.' });
    }

    // Validación del rol (solo permitir 'admin' o 'user')
    if (role !== 'admin' && role !== 'user') {
        return res.status(400).json({ success: false, message: 'Rol inválido. Debe ser "admin" o "user".' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO usuarios (nombre, email, password, role) VALUES (?, ?, ?, ?)';

        const [result] = await connection.query(sql, [nombre, email, hashedPassword, role]);
        res.status(201).json({ success: true, message: 'Usuario registrado exitosamente' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ success: false, message: 'El correo ya está registrado.' });
        } else {
            res.status(500).json({ success: false, message: 'Error del servidor. Inténtalo de nuevo más tarde.' });
        }
    }
});


module.exports = router;
