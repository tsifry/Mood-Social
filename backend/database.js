const mysql = require('mysql2')

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'SADSsfadfsdf1',
    database: 'mood_app',
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0
})

module.exports = pool.promise();