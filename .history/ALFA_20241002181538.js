const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');  // Generar IDs únicos
const connection = require('./database/database-promise');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const secretKey = 'clavesecreta'; // Clave secreta para firmar los JWT


// Configurar multer para manejar la carga de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'BASE-2/uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4();  // Generamos un UUID único
        const newFilename = `${uniqueSuffix}-${file.originalname}`;  // Asignamos el nuevo nombre
        cb(null, newFilename);  // Guardamos la imagen con el nuevo nombre
    }
});

// Limitar la cantidad de imágenes a 4
const upload = multer({
    storage: storage,
    limits: { files: 4 }  // Limitar a un máximo de 4 archivos
});

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
        req.userName = decoded.name || decoded.nombre;  // Extraer `name` o `nombre` según el caso
        next();
    });
}

// Función para detectar, convertir y comprimir imágenes
async function convertAndCompressImage(filePath) {
    try {
        console.log('Procesando imagen:', filePath);  // Verifica qué imagen se está procesando
        const metadata = await sharp(filePath).metadata();
        let outputFilePath = filePath;

        // Si la imagen no es jpeg o png, convertirla a jpeg
        if (metadata.format !== 'jpeg' && metadata.format !== 'png') {
            outputFilePath = filePath.replace(path.extname(filePath), '.jpg');
            await sharp(filePath)
                .toFormat('jpeg')
                .jpeg({ quality: 80 })  // Comprimir la imagen al 80% de calidad
                .toFile(outputFilePath);
            fs.unlinkSync(filePath);  // Eliminar el archivo original después de la conversión
        } else {
            // Si ya es jpeg o png, comprimir la imagen
            await sharp(filePath)
                .jpeg({ quality: 80 })  // Comprimir la imagen al 80% de calidad
                .toFile(outputFilePath);
        }

        console.log('Imagen procesada y comprimida guardada en:', outputFilePath);
        return outputFilePath;
    } catch (error) {
        console.error('Error al convertir y comprimir la imagen:', error);
        throw new Error('Error al convertir y comprimir la imagen: ' + error.message);
    }
}

// Ruta para registrar un nuevo vehículo
router.post('/register', [verifyJWT, upload.array('image', 4)], async (req, res) => {
    const user_id = req.userId;
    const user_name = req.userName;

    if (!user_id) {
        return res.status(400).json({ success: false, message: 'Usuario no autenticado. Por favor, inicie sesión.' });
    }

    const { datetime, brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations } = req.body;
    const images = [];

    // Procesar las imágenes: convertir y comprimir
    for (let file of req.files) {
        try {
            const compressedPath = await convertAndCompressImage(file.path);  // Convertir y comprimir la imagen si es necesario
            images.push(`/uploads/${path.basename(compressedPath)}`);
        } catch (error) {
            console.error('Error al procesar la imagen:', error);
            return res.status(500).json({ success: false, message: 'Error al procesar la imagen' });
        }
    }

    const imagesJson = JSON.stringify(images);  // Convertir a JSON para almacenar en la base de datos

    try {
        const query = 'INSERT INTO vehiculos (datetime, brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations, images, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [datetime, brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations, imagesJson, user_id];

        const [result] = await connection.query(query, values);
        console.log('Vehículo registrado correctamente, ID:', result.insertId);

        // Insertar el evento en la tabla de eventos
        const eventQuery = 'INSERT INTO eventos (usuario, accion, vehiculo_placa, propietario, habitacion, descripcion, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const eventDetails = `Registro vehículo con Placa: ${plate}, Propietario: ${owner}, Habitación: ${habitacion}`;
        await connection.query(eventQuery, [user_name, 'Registro', plate, owner, habitacion, eventDetails, datetime]);

        res.json({ success: true, vehicle: { id: result.insertId, datetime, brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations, images } });
    } catch (err) {
        console.error('Error al registrar el vehículo:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

module.exports = router;

// Ruta para obtener el historial de vehículos
router.get('/history', verifyJWT, async (req, res) => {
    const user_id = req.userId;
    let { start, end } = req.query;

    start += ' 00:00:00';
    end += ' 23:59:59';
    console.log(`Obteniendo historial para user_id: ${user_id} desde ${start} hasta ${end}`);

    try {
        const [results] = await connection.query('SELECT * FROM vehiculos WHERE user_id = ? AND datetime BETWEEN ? AND ? ORDER BY datetime DESC', [user_id, start, end]);
        console.log('Historial de vehículos recuperado:', results.length, 'registros');

        const vehicles = results.map(vehicle => {
            vehicle.datetime = new Date(new Date(vehicle.datetime).getTime() + 60 * 60 * 1000);  // Ajustar la zona horaria
            let images = [];
            try {
                images = typeof vehicle.images === 'string' && vehicle.images.startsWith('[') ? JSON.parse(vehicle.images) : [vehicle.images];
            } catch (e) {
                images = [vehicle.images];
            }
            return { ...vehicle, images };
        });

        res.json(vehicles);
    } catch (err) {
        console.error('Error al obtener el historial:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Ruta para buscar vehículos por nombre o placa
router.get('/search', verifyJWT, async (req, res) => {
    const user_id = req.userId;
    const query = req.query.query;
    let { start, end } = req.query;

    start += ' 00:00:00';
    end += ' 23:59:59';
    console.log(`Buscando vehículos para user_id: ${user_id} con query "${query}" desde ${start} hasta ${end}`);

    try {
        const [results] = await connection.query(
            'SELECT * FROM vehiculos WHERE (owner LIKE ? OR plate LIKE ?) AND user_id = ? AND datetime BETWEEN ? AND ? ORDER BY datetime DESC',
            [`%${query}%`, `%${query}%`, user_id, start, end]
        );
        console.log('Resultados de búsqueda:', results.length, 'registros encontrados');

        const vehicles = results.map(vehicle => {
            vehicle.datetime = new Date(new Date(vehicle.datetime).getTime() + 60 * 60 * 1000);
            let images = [];
            try {
                images = typeof vehicle.images === 'string' && vehicle.images.startsWith('[') ? JSON.parse(vehicle.images) : [vehicle.images];
            } catch (e) {
                images = [vehicle.images];
            }
            return { ...vehicle, images };
        });

        res.json(vehicles);
    } catch (err) {
        console.error('Error en la búsqueda:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// Ruta para obtener datos de un vehículo por placa filtrado por user_id
router.get('/vehicle/:plate', verifyJWT, async (req, res) => {
    const user_id = req.userId;
    const plate = req.params.plate;
    console.log(`Obteniendo vehículo con placa "${plate}" para user_id: ${user_id}`);

    try {
        const [results] = await connection.query('SELECT * FROM vehiculos WHERE plate = ? AND user_id = ?', [plate, user_id]);

        if (results.length > 0) {
            results[0].datetime = new Date(new Date(results[0].datetime).getTime() + 60 * 60 * 1000);
            console.log('Vehículo encontrado:', results[0]);
            res.json(results[0]);
        } else {
            console.log('No se encontró un vehículo con esa placa');
            res.json({ message: 'No se encontró un vehículo con esa placa' });
        }
    } catch (err) {
        console.error('Error al obtener el vehículo:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

module.exports = router;
