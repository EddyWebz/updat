const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const connection = require('./database/database-promise');
const { v4: uuidv4 } = require('uuid');  // Generar IDs únicos

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
router.put('/vehicle/:id', upload.array('image', 4), async (req, res) => {
    const vehicleId = req.params.id;
    const { datetime, brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations, existingImages } = req.body;

    let imagesJson;

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

    try {
        const query = 'UPDATE vehiculos SET datetime = ?, brand = ?, model = ?, clave = ?, plate = ?, color = ?, owner = ?, stayNights = ?, habitacion = ?, garage = ?, observations = ?, images = ? WHERE id = ?';
        const values = [datetime, brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations, imagesJson, vehicleId];
        
        await connection.query(query, values);
        console.log('Vehículo actualizado correctamente con ID:', vehicleId);

        res.json({ success: true, message: 'Vehículo actualizado correctamente' });
    } catch (err) {
        console.error('Error al actualizar en la base de datos:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});



module.exports = router;
