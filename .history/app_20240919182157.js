// Importar las librerías necesarias
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');  // Librería para JWT
const cookieParser = require('cookie-parser');  // Para manejar las cookies
const connection = require('./database/database-promise');
const path = require('path');
const alfaRoutes = require('./ALFA');
const notasRoutes = require('./notas');
const editRoutes = require('./edit');
const cron = require('node-cron');
const dragController = require('./drag-controller');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());  // Middleware para manejar cookies

// Configuración de JWT
const JWT_SECRET = 'c7b226554f4666a11164ac960f8f807b140116defe512e297e73d1b04a043231';  // Este será el secreto para firmar los tokens JWT
const JWT_EXPIRATION = '24h';  // Duración del token

// Función para generar un JWT
function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

// Middleware para verificar si el usuario está autenticado usando JWT
function isAuthenticated(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido o expirado' });
        }
        req.userId = decoded.userId;  // Almacenar el userId del token decodificado
        next();
    });
}

// Servir archivos estáticos desde la carpeta 'BASE-2'
app.use(express.static(path.join(__dirname, 'BASE-2')));
app.use('/uploads', express.static(path.join(__dirname, 'BASE-2/uploads')));

// Rutas protegidas que sirven cuerpo.html y report.html
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'BASE-2', 'index.html'));
});

app.get('/privado/cuerpo.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'privado', 'cuerpo.html'));
});

app.get('/privado/report.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'privado', 'report.html'));
});

app.get('/privado/config.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'privado', 'config.html'));
});

// Ruta para iniciar sesión (login)
app.post('/login', async (req, res) => {
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
app.post('/register', async (req, res) => {
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
app.post('/logout', (req, res) => {
    res.clearCookie('token');  // Eliminar la cookie del token JWT
    return res.status(200).json({ success: true, message: 'Sesión cerrada exitosamente' });
});

// Integración de las rutas
app.use('/api', alfaRoutes);
app.use('/api/notas', notasRoutes);
app.use('/api', dragController);
app.use('/api', editRoutes);

// Cron job que se ejecuta a las 7:00 AM todos los días
cron.schedule('0 7 * * *', () => {
    const { reiniciarCicloNotificaciones } = require('./notas');
    reiniciarCicloNotificaciones();
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
