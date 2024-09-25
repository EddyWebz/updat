const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const connection = require('./database/database-promise');
const secretKey = 'clavesecreta'; // Clave secreta para firmar los JWT
const { v4: uuidv4 } = require('uuid');  // Generar IDs únicos

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

const upload = multer({ storage: storage, limits: { files: 4 } });

// Ruta para actualizar un vehículo existente
router.put('/vehicle/:id', [verifyJWT, upload.array('image', 4)], async (req, res) => {
    const userId = req.userId;  // Obtener el user_id del token JWT
    const vehicleId = req.params.id;

    const { brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations, existingImages } = req.body;

    let imagesJson;

     // Verificar que el vehículo pertenece al usuario autenticado
     try {
        const [rows] = await connection.query('SELECT user_id FROM vehiculos WHERE id = ?', [vehicleId]);
     // Verificar que el vehículo existe y que pertenece al usuario autenticado
     if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Vehículo no encontrado.' });
    }

    if (rows[0].user_id !== userId) {
        return res.status(403).json({ success: false, message: 'No tienes permiso para modificar este vehículo.' });
    }

    // Si se suben nuevas imágenes, las procesamos; de lo contrario, mantenemos las imágenes actuales
    if (req.files && req.files.length > 0) {
        const images = req.files.map(file => {
            const imagePath = `/uploads/${file.filename}`;
            return imagePath;
        });
        imagesJson = JSON.stringify(images);  // Convertir nuevas imágenes a formato JSON
    } else if (existingImages) {
        imagesJson = existingImages;  // Mantener las imágenes existentes
    }

  // Segundo bloque try para la actualización en la base de datos
        const query = 'UPDATE vehiculos SET brand = ?, model = ?, clave = ?, plate = ?, color = ?, owner = ?, stayNights = ?, habitacion = ?, garage = ?, observations = ?, images = ? WHERE id = ?';
        const values = [brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations, imagesJson, vehicleId];
    
        
        await connection.query(query, values);
        console.log('Vehículo actualizado correctamente con ID:', vehicleId);

        res.json({ success: true, message: 'Vehículo actualizado correctamente' });
    } catch (err) {
        console.error('Error al actualizar en la base de datos:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }

});



module.exports = router;
