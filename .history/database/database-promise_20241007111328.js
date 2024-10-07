const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'kali',
    password: 'kali',
    database: 'kali',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: 'Z', // Esto fuerza UTC
});

module.exports = pool;
