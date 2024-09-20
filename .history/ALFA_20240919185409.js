const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const connection = require('./database/database-promise');
const jwt = require('jsonwebtoken');
const secretKey = 'clave-secreta'; // Clave secreta para firmar y verificar los tokens JWT

// Configurar multer para manejar la carga de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'BASE-2/uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4();
        const newFilename = `${uniqueSuffix}-${file.originalname}`;
        cb(null, newFilename);
    }
});

// Limitar la cantidad de imágenes a 4
const upload = multer({ 
    storage: storage,
    limits: { files: 4 }
});

// Middleware para verificar el JWT desde las cookies HttpOnly
function verifyJWT(req, res, next) {
    const token = req.cookies.token; // Extraer el JWT de las cookies

    if (!token) {
        return res.status(403).json({ success: false, message: 'No se proporcionó token.' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Token inválido.' });
        }
        req.userId = decoded.id;  // Extraer el `userId` del token
        next();
    });
}

// Ruta para registrar un nuevo vehículo
router.post('/register', [verifyJWT, upload.array('image', 4)], async (req, res) => {
    const user_id = req.userId;

    if (!user_id) {
        return res.status(400).json({ success: false, message: 'Usuario no autenticado. Por favor, inicie sesión.' });
    }

    const { datetime, brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations } = req.body;

    const images = req.files.map(file => {
        const imagePath = `/uploads/${file.filename}`;
        console.log('Imagen guardada en:', imagePath);
        return imagePath;
    });

    const imagesJson = JSON.stringify(images);

    try {
        const query = 'INSERT INTO vehiculos (datetime, brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations, images, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [datetime, brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations, imagesJson, user_id];

        const [result] = await connection.query(query, values);
        console.log('Vehículo registrado correctamente con ID:', result.insertId);

        const vehicle = { id: result.insertId, datetime, brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations, images };
        res.json({ success: true, vehicle });
    } catch (err) {
        console.error('Error al insertar en la base de datos:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Ruta para obtener el historial de vehículos con filtro de fechas
router.get('/history', verifyJWT, async (req, res) => {
    const user_id = req.userId;
    let { start, end } = req.query;

    start += ' 00:00:00';
    end += ' 23:59:59';

    console.log('Fetching history for user_id:', user_id, 'from', start, 'to', end);

    try {
        const [results] = await connection.query('SELECT * FROM vehiculos WHERE user_id = ? AND datetime BETWEEN ? AND ? ORDER BY datetime DESC', [user_id, start, end]);

        const vehicles = results.map(vehicle => {
            vehicle.datetime = new Date(new Date(vehicle.datetime).getTime() + 60 * 60 * 1000);
            let images = [];
            try {
                if (typeof vehicle.images === 'string' && vehicle.images.startsWith('[')) {
                    images = JSON.parse(vehicle.images);
                } else if (vehicle.images) {
                    images = [vehicle.images];
                }
            } catch (e) {
                console.error('Error al parsear imágenes:', e);
                images = [vehicle.images];
            }
            return { ...vehicle, images };
        });

        res.json(vehicles);
    } catch (err) {
        console.error('Error al ejecutar la consulta:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Ruta para buscar vehículos por nombre o placa con filtro de fechas
router.get('/search', verifyJWT, async (req, res) => {
    const user_id = req.userId;
    const query = req.query.query;
    let { start, end } = req.query;

    start += ' 00:00:00';
    end += ' 23:59:59';

    console.log('Search query:', query, 'from', start, 'to', end);

    try {
        const [results] = await connection.query(
            'SELECT * FROM vehiculos WHERE (owner LIKE ? OR plate LIKE ?) AND user_id = ? AND datetime BETWEEN ? AND ? ORDER BY datetime DESC',
            [`%${query}%`, `%${query}%`, user_id, start, end]
        );

        const vehicles = results.map(vehicle => {
            vehicle.datetime = new Date(new Date(vehicle.datetime).getTime() + 60 * 60 * 1000);
            let images = [];
            try {
                if (typeof vehicle.images === 'string' && vehicle.images.startsWith('[')) {
                    images = JSON.parse(vehicle.images);
                } else if (vehicle.images) {
                    images = [vehicle.images];
                }
            } catch (e) {
                console.error('Error al parsear imágenes:', e);
                images = [vehicle.images];
            }
            return { ...vehicle, images };
        });

        res.json(vehicles);
    } catch (err) {
        console.error('Error al ejecutar la consulta:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Ruta para obtener datos de un vehículo por placa filtrado por user_id
router.get('/vehicle/:plate', verifyJWT, async (req, res) => {
    const user_id = req.userId;
    const plate = req.params.plate;

    try {
        const [results] = await connection.query('SELECT * FROM vehiculos WHERE plate = ? AND user_id = ?', [plate, user_id]);

        if (results.length > 0) {
            results[0].datetime = new Date(new Date(results[0].datetime).getTime() + 60 * 60 * 1000);
            res.json(results[0]);
        } else {
            res.json({ message: 'No se encontró un vehículo con esa placa' });
        }
    } catch (err) {
        console.error('Error al ejecutar la consulta:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

module.exports = router;
