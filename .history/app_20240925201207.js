// Importar las librerías necesarias
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const alfaRoutes = require('./ALFA');
const notasRoutes = require('./notas');
const editRoutes = require('./edit');
const cron = require('node-cron');
const dragController = require('./drag-controller');
const loginRoutes = require('./login');  // Importar las rutas de login
const adminRoutes = require('./admin');  // Importar las rutas del administrador
const eventsRoutes = require('./events');
const secretKey = 'clavesecreta'; // Clave secreta para firmar los JWT
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());  // Middleware para manejar cookies

// Configuración de JWT (esta parte ya no es necesaria aquí, está en login.js)

// Middleware para verificar si el usuario está autenticado usando JWT
const JWT_SECRET = 'clavesecreta';
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
        req.userName = decoded.name;  // Extraer el `name` del token
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
// Ruta para servir admin.html
app.get('/privado/admin.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'privado', 'admin.html'));
});

app.get('/api/auth-check', isAuthenticated, (req, res) => {
    res.json({ authenticated: true });
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

// Integración de las rutas
app.use('/auth', loginRoutes); 
app.use('/api', alfaRoutes);
app.use('/api/', notasRoutes);
app.use('/api', dragController);
app.use('/api', editRoutes);
app.use('/admin', adminRoutes);
app.use('/api', eventsRoutes);

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
