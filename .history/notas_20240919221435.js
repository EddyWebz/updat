const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const connection = require('./database/database-promise');
const secretKey = 'clavesecreta'; // Clave secreta para firmar los JWT
// Función para calcular la hora de salida basándose en la hora de ingreso y el número de noches
function calcularHoraSalida(horaIngreso, numeroNoches) {
    const fechaHoraIngreso = new Date(horaIngreso);

    let horaSalidaEstimada;

    if (fechaHoraIngreso.getHours() >= 15 || fechaHoraIngreso.getHours() < 7) {
        if (fechaHoraIngreso.getHours() < 7) {
            fechaHoraIngreso.setDate(fechaHoraIngreso.getDate() - 1);
        }
        horaSalidaEstimada = new Date(fechaHoraIngreso.setHours(12, 30, 0, 0));
        horaSalidaEstimada.setDate(horaSalidaEstimada.getDate() + numeroNoches);
    } else if (fechaHoraIngreso.getHours() >= 7 && fechaHoraIngreso.getHours() < 15) {
        horaSalidaEstimada = new Date(fechaHoraIngreso.setHours(12, 30, 0, 0));
        horaSalidaEstimada.setDate(horaSalidaEstimada.getDate() + numeroNoches);
    }

    return horaSalidaEstimada;
}

// Función para obtener la fecha y hora actual del dispositivo
function obtenerFechaHoraActual() {
    return new Date();
}

// Función para calcular el ciclo actual de 24 horas basado en la hora del dispositivo
function calcularCicloActual() {
    const now = obtenerFechaHoraActual();

    let inicioCiclo = new Date(now);
    inicioCiclo.setHours(7, 0, 0, 0);

    let finCiclo = new Date(inicioCiclo);
    finCiclo.setDate(inicioCiclo.getDate() + 1);

    if (now.getHours() < 7) {
        inicioCiclo.setDate(inicioCiclo.getDate() - 1);
        finCiclo.setDate(finCiclo.getDate() - 1);
    }

    return { inicioCiclo, finCiclo };
}

// Función para verificar si un vehículo debe mostrarse en las notificaciones según el ciclo actual
function verificarNotificacionVehiculo(horaIngreso) {
    const { inicioCiclo, finCiclo } = calcularCicloActual();
    const fechaHoraIngreso = new Date(horaIngreso);

    return fechaHoraIngreso >= inicioCiclo && fechaHoraIngreso < finCiclo;
}

// Ruta para obtener notificaciones activas filtradas por user_id
router.get('/notificaciones', verifyJWT, async (req, res) => {
    const user_id = req.userId;

    try {
        const [notificaciones] = await pool.query(`
            SELECT habitacion, plate, garage, datetime
            FROM vehiculos
            WHERE user_id = ?
            ORDER BY garage ASC, habitacion ASC
        `, [user_id]);

        const data = {
            P1: [],
            P2: []
        };

        notificaciones.forEach(registro => {
            if (verificarNotificacionVehiculo(registro.datetime)) {
                if (registro.garage === 'P1') {
                    data.P1.push({
                        habitacion: registro.habitacion,
                        plate: registro.plate
                    });
                } else if (registro.garage === 'P2') {
                    data.P2.push({
                        habitacion: registro.habitacion,
                        plate: registro.plate
                    });
                }
            }
        });

        res.json(data);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).send('Error del servidor');
    }
});
// Nueva lógica para generar el reporte automático de vehículos en garajes P1 y P2
router.get('/reportes', verifyJWT, async (req, res) => {
    const user_id = req.userId;

    try {
        const currentDate = new Date();
        const pastDate = new Date();
        pastDate.setMonth(pastDate.getMonth() - 1);

        const startDate = pastDate.toISOString().split('T')[0];
        const endDate = currentDate.toISOString().split('T')[0];

        const [reportes] = await pool.query(`
            SELECT id, habitacion, plate, garage, datetime, stayNights
            FROM vehiculos
            WHERE user_id = ?
            AND DATE(datetime) BETWEEN ? AND ?
            ORDER BY garage ASC, habitacion ASC
        `, [user_id, startDate, endDate]);

        const data = {
            P1: [],
            P2: []
        };

        reportes.forEach(registro => {
            const horaSalidaEstimada = calcularHoraSalida(registro.datetime, registro.stayNights);

            if (new Date() < horaSalidaEstimada) {
                if (registro.garage === 'P1') {
                    data.P1.push({
                        habitacion: registro.habitacion,
                        plate: registro.plate,
                        id: registro.id
                    });
                } else if (registro.garage === 'P2') {
                    data.P2.push({
                        habitacion: registro.habitacion,
                        plate: registro.plate,
                        id: registro.id
                    });
                }
            }
        });

        res.json(data);
    } catch (error) {
        console.error('Error al generar el reporte:', error);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
