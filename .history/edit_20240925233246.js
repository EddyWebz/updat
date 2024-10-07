const express = require('express');
const bcrypt = require('bcrypt'); 
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const connection = require('./database/database-promise');
const secretKey = 'clavesecreta'; // Clave secreta para firmar los JWT
const { v4: uuidv4 } = require('uuid');  // Generar IDs únicos
const saltRounds = 10;  // El nivel de "sal" que quieres aplicar

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
        req.role = decoded.role;  // Extraer el `role` del token
        req.userName = decoded.name || decoded.nombre;  // Extraer `name` o `nombre` según el caso
        console.log(`Token verificado correctamente, userId: ${req.userId}, role: ${req.role}, userName: ${req.userName}`);

        next();
    });
}
// VERIFICAR ROLES
router.get('/get-user-role', verifyJWT, async (req, res) => {
    try {
        // Extraer el rol desde el JWT, que ya tiene el rol del usuario
        const userRole = req.role;  // Esto viene del middleware verifyJWT

        console.log(`Rol extraído desde el JWT: ${userRole} para el userId: ${req.userId}`);

        // Devolver el rol directamente sin tener que consultar la base de datos nuevamente
        return res.json({ role: userRole });

    } catch (error) {
        console.error('Error al obtener el rol del usuario:', error);
        res.status(500).json({ message: 'Error al obtener el rol del usuario' });
    }
});



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
    const userName = req.userName;  // Obtener el nombre del usuario del token JWT
    const vehicleId = req.params.id;

    const { brand, model, clave, plate, color, owner, stayNights, habitacion, garage, observations, existingImages } = req.body;

    let imagesJson;

    try {
        // Verificar que el vehículo pertenece al usuario autenticado
        const [vehicleRows] = await connection.query('SELECT * FROM vehiculos WHERE id = ?', [vehicleId]);

        if (vehicleRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Vehículo no encontrado.' });
        }

        const currentVehicle = vehicleRows[0];  // Datos actuales del vehículo

        if (currentVehicle.user_id !== userId) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para modificar este vehículo.' });
        }

        // Capturar cambios realizados
        let cambios = [];
        if (brand !== currentVehicle.brand) cambios.push(`Se actualizó la marca de ${currentVehicle.brand} a ${brand}`);
        if (model !== currentVehicle.model) cambios.push(`Se actualizó el modelo de ${currentVehicle.model} a ${model}`);
        if (clave !== currentVehicle.clave) cambios.push(`Se actualizó la clave de ${currentVehicle.clave} a ${clave}`);
        if (plate !== currentVehicle.plate) cambios.push(`Se actualizó la placa de ${currentVehicle.plate} a ${plate}`);
        if (color !== currentVehicle.color) cambios.push(`Se actualizó el color de ${currentVehicle.color} a ${color}`);
        if (owner !== currentVehicle.owner) cambios.push(`Se actualizó el propietario de ${currentVehicle.owner} a ${owner}`);
        if (stayNights != currentVehicle.stayNights) cambios.push(`Se actualizó el número de noches de ${currentVehicle.stayNights} a ${stayNights}`);
        if (habitacion !== currentVehicle.habitacion) cambios.push(`Se actualizó la habitación de ${currentVehicle.habitacion} a ${habitacion}`);
        if (garage !== currentVehicle.garage) cambios.push(`Se actualizó el garaje de ${currentVehicle.garage} a ${garage}`);
        if (observations !== currentVehicle.observations) cambios.push(`Se actualizó la observación de ${currentVehicle.observations} a ${observations}`);

        // Actualización de imágenes
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

        // Guardar el evento en la tabla eventos solo si hubo cambios
        if (cambios.length > 0) {
            const descripcion = cambios.join(', ');
            const eventQuery = 'INSERT INTO eventos (usuario, accion, vehiculo_placa, propietario, habitacion, descripcion, fecha) VALUES (?, ?, ?, ?, ?, ?, NOW())';
            await connection.query(eventQuery, [userName, 'Actualizó', plate, owner, habitacion, descripcion]);
        }

        res.json({ success: true, message: 'Vehículo actualizado correctamente' });
    } catch (err) {
        console.error('Error al actualizar en la base de datos:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});
;


// Crear sub-usuario (en el backend)

router.post('/sub-users', verifyJWT, async (req, res) => {
    const { subUserName, subUserEmail, subUserPassword } = req.body;
    const principalUserId = req.userId;  // El userId del usuario principal que crea el sub-usuario
    
    // Validar los datos recibidos
    if (!subUserName || !subUserEmail || !subUserPassword) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        // Hash de la contraseña antes de insertarla en la base de datos
        const hashedPassword = await bcrypt.hash(subUserPassword, saltRounds);  // Hash con sal

          // Insertar el sub-usuario en la base de datos, con el `user_id` del usuario principal (principalUserId)
          await connection.query(
            'INSERT INTO sub_usuarios (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [principalUserId, subUserName, subUserEmail, hashedPassword, 'sub-user']  // Ahora usamos el campo id para el user_id del usuario principal
        );

   
        res.status(201).json({ message: 'Sub-usuario creado exitosamente' });
    } catch (error) {
        console.error('Error al crear sub-usuario:', error);
        res.status(500).json({ message: 'Error al crear sub-usuario' });
    }
});

// Obtener todos los sub-usuarios vinculados al usuario principal
router.get('/sub-users', verifyJWT, async (req, res) => {
    const userId = req.userId;  // ID del usuario principal

    try {
        const [subUsers] = await connection.query('SELECT id, name, email FROM sub_usuarios WHERE id = ?', [userId]);
        res.json(subUsers);
    } catch (error) {
        console.error('Error al obtener sub-usuarios:', error);
        res.status(500).json({ message: 'Error al obtener sub-usuarios' });
    }
});

// Eliminar sub-usuario
router.delete('/sub-users/:email', verifyJWT, async (req, res) => {
    const subUserEmail = req.params.email;  // Usar el correo electrónico como identificador único

    try {
        await connection.query('DELETE FROM sub_usuarios WHERE email = ?', [subUserEmail]);
        res.status(200).json({ message: 'Sub-usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar sub-usuario:', error);
        res.status(500).json({ message: 'Error al eliminar sub-usuario' });
    }
});

module.exports = router;
