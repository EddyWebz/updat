const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');  // Generar IDs únicos
const connection = require('./database/database-promise');

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

// Ruta para registrar un nuevo vehículo
router.post('/register', upload.array('image', 4), async (req, res) => {
    const user_id = req.session.userId;  // Obtener el user_id de la sesión

    if (!user_id) {
        return res.status(400).json({ success: false, message: 'Usuario no autenticado. Por favor, inicie sesión.' });
    }

    const { datetime, brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations } = req.body;
    
    // Generar la ruta de la imagen con el nuevo nombre asignado por multer
    const images = req.files.map(file => {
        const imagePath = `/uploads/${file.filename}`;
        console.log('Imagen guardada en:', imagePath);  // Verificar la ruta
        return imagePath;
    });

    const imagesJson = JSON.stringify(images);  // Convertir a JSON válido para almacenar en la base de datos

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

// Ruta para obtener el historial de vehículos
// Ruta para obtener el historial de vehículos con filtro de fechas
router.get('/history', async (req, res) => {
    const user_id = req.session.userId;  // Obtener el user_id de la sesión para asegurarnos de que solo se traigan los registros del usuario actual
    let { start, end } = req.query;    // Obtener las fechas de inicio (start) y fin (end) que fueron enviadas desde el frontend como parámetros de la URL
    console.log('Fetching history for user_id:', user_id, 'from', start, 'to', end); // Depuración para ver en el servidor las fechas y el user_id que se están usando


    // Ajustar la fecha de fin al final del día en todos los casos
    end += ' 23:59:59';
    

    try {
        // Realizar la consulta a la base de datos. Filtramos los registros entre las fechas start y end, y solo los que pertenecen al user_id actual
        const [results] = await connection.query('SELECT * FROM vehiculos WHERE user_id = ? AND datetime BETWEEN ? AND ? ORDER BY datetime DESC', [user_id, start, end]);
        
        // Mapear los resultados para procesar los datos
        const vehicles = results.map(vehicle => {
            // Convertir la hora a un formato ajustado (sumando 1 hora) para que coincida con la zona horaria deseada
            vehicle.datetime = new Date(new Date(vehicle.datetime).getTime() + 60 * 60 * 1000);

            let images = [];
            try {
                // Si las imágenes están almacenadas como un JSON (array), las parseamos
                if (typeof vehicle.images === 'string' && vehicle.images.startsWith('[')) {
                    images = JSON.parse(vehicle.images);
                } else if (vehicle.images) {
                    // Si no es un JSON, tratamos las imágenes como una cadena simple
                    images = [vehicle.images];
                }
            } catch (e) {
                console.error('Error al parsear imágenes:', e); // Mostrar error en caso de que falle el parseo
                images = [vehicle.images];  // Usar la imagen como está si falla el parseo
            }

            // Retornar el objeto del vehículo con las imágenes procesadas
            return { ...vehicle, images };
        });

        // Enviar el resultado final en formato JSON al frontend
        res.json(vehicles);
    } catch (err) {
        console.error('Error al ejecutar la consulta:', err);  // Mostrar error en el servidor si falla la consulta a la base de datos
        res.status(500).json({ success: false, message: 'Error en el servidor' });  // Devolver una respuesta de error al frontend
    }
});

// Ruta para buscar vehículos por nombre o placa
// Ruta para buscar vehículos por nombre o placa con filtro de fechas
router.get('/search', async (req, res) => {
    const user_id = req.session.userId;  // Obtener el user_id de la sesión para asegurarnos de que solo se traigan los registros del usuario actual
    const query = req.query.query;       // Obtener la consulta de búsqueda enviada por el frontend (nombre o placa)
    let { start, end } = req.query;    // Obtener las fechas de inicio y fin enviadas como parámetros de la URL
   // Ajustar la fecha de fin al final del día
   end += ' 23:59:59';
    console.log('Search query:', query, 'from', start, 'to', end); // Depuración para verificar la consulta y el rango de fechas que se están usando

    try {
        // Realizar la consulta a la base de datos. Filtramos por el nombre o placa que coincida con la consulta y por el rango de fechas
        const [results] = await connection.query(
            'SELECT * FROM vehiculos WHERE (owner LIKE ? OR plate LIKE ?) AND user_id = ? AND datetime BETWEEN ? AND ? ORDER BY datetime DESC',
            [`%${query}%`, `%${query}%`, user_id, start, end]
        );

        // Procesar los resultados
        const vehicles = results.map(vehicle => {
            // Ajustar la hora (sumar 1 hora)
            vehicle.datetime = new Date(new Date(vehicle.datetime).getTime() + 60 * 60 * 1000);

            let images = [];
            try {
                // Parsear imágenes si están en formato JSON
                if (typeof vehicle.images === 'string' && vehicle.images.startsWith('[')) {
                    images = JSON.parse(vehicle.images);
                } else if (vehicle.images) {
                    images = [vehicle.images];  // Tratar imágenes como una cadena simple si no es JSON
                }
            } catch (e) {
                console.error('Error al parsear imágenes:', e);
                images = [vehicle.images];  // Manejar la imagen como cadena simple en caso de error
            }

            // Retornar el vehículo procesado
            return { ...vehicle, images };
        });

        // Enviar la respuesta final en formato JSON al frontend
        res.json(vehicles);
    } catch (err) {
        console.error('Error al ejecutar la consulta:', err);  // Manejar error si falla la consulta a la base de datos
        res.status(500).json({ success: false, message: 'Error en el servidor' });  // Responder al frontend con un error
    }
});


// Ruta para obtener datos de un vehículo por placa filtrado por user_id
router.get('/vehicle/:plate', async (req, res) => {
    const user_id = req.session.userId;  // Obtener el user_id de la sesión
    const plate = req.params.plate;

    if (!user_id) {
        return res.status(400).json({ success: false, message: 'Usuario no autenticado. Por favor, inicie sesión.' });
    }

    try {
        const [results] = await connection.query('SELECT * FROM vehiculos WHERE plate = ? AND user_id = ?', [plate, user_id]);

        if (results.length > 0) {
            // Añadir una hora al campo datetime
            results[0].datetime = new Date(new Date(results[0].datetime).getTime() + 60 * 60 * 1000);
            res.json(results[0]);  // Devolver el primer resultado
        } else {
            res.json({ message: 'No se encontró un vehículo con esa placa' });
        }
    } catch (err) {
        console.error('Error al ejecutar la consulta:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

module.exports = router;
