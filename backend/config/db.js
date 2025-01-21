//db.js'
import mysql from 'mysql2';

// create the connection to database
const pool = mysql.createPool({
    port:process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    supportBigNumbers: true,
    bigNumberStrings: true,
});

const promisePool = pool.promise();

export default promisePool;