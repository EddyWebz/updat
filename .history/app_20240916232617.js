const express = require('express');
const bcrypt = require('bcrypt');
const connection = require('./database/database-promise');  // Asegurar que utiliza database-promise
const path = require('path');
const jwt = require('jsonwebtoken');  // Importamos jsonwebtoken
const alfaRoutes = require('./ALFA');
const notasRoutes = require('./notas');
const editRoutes = require('./edit');  // Añadir la ruta de actualización
const cron = require('node-cron');
const dragController = require('./drag-controller');
const cookieParser = require('cookie-parser');  // Importamos cookie-parser

const app = express();
const SECRET_KEY = 'tu_clave_secreta';  // Cambia esto a una clave segura

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());  // Usamos cookie-parser para manejar cookies

// Servir archivos estáticos desde la carpeta 'BASE-2'
app.use(express.static(path.join(__dirname, 'BASE-2')));
app.use('/uploads', express.static(path.join(__dirname, 'BASE-2/uploads')));

// Generar y enviar el JWT en una cookie httpOnly
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM usuarios WHERE email = ?';

    try {
        const [results] = await connection.query(sql, [email]);
        if (results.length > 0) {
            const isMatch = await bcrypt.compare(password, results[0].password);
            if (isMatch) {
                // Generar JWT
                const token = jwt.sign({ userId: results[0].id }, SECRET_KEY, { expiresIn: '24h' });

                // Enviar el token en una cookie httpOnly
                res.cookie('token', token, {
                    httpOnly: true,  // No accesible desde JavaScript
                    secure: true,    // Solo se envía en HTTPS
                    maxAge: 24 * 60 * 60 * 1000  // Expira en 24 horas
                });

                res.status(200).json({ success: true });
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

// Registro de usuario con envío de JWT en cookie
app.post('/register', async (req, res) => {
    const { nombre, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)';

    try {
        const [result] = await connection.query(sql, [nombre, email, hashedPassword]);
        const userId = result.insertId;

        // Generar JWT
        const token = jwt.sign({ userId }, SECRET_KEY, { expiresIn: '24h' });

        // Enviar el token en una cookie httpOnly
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(201).json({ success: true });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).send('El correo ya está registrado');
        } else {
            res.status(500).send('Error del servidor');
        }
    }
});

// Middleware para verificar el token desde la cookie
function authenticateToken(req, res, next) {
    const token = req.cookies.token;  // Obtenemos el token de la cookie
    if (!token) return res.status(401).send('Token requerido');

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).send('Token inválido o expirado');
        req.user = user;
        next();
    });
}

// Proteger las rutas usando el middleware authenticateToken
app.get('/privado/cuerpo.html', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'privado', 'cuerpo.html'));
});

app.get('/privado/report.html', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'privado', 'report.html'));
});

app.get('/privado/config.html', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'privado', 'config.html'));
});

// Ruta para cerrar sesión (eliminar la cookie con el token)
app.post('/logout', (req, res) => {
    res.clearCookie('token');  // Limpiar la cookie del token
    res.status(200).json({ success: true, message: 'Sesión cerrada exitosamente' });
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
