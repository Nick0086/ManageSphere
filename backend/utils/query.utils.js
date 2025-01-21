//queryHelper.js
import promisePool from '../config/db.js';

const query = async (sql, values, retries = 3) => {
    try {
        const [rows, fields] = await promisePool.query(sql, values);
        return rows;
    } catch (error) {
        if (error.code === 'ECONNRESET' && retries > 0) {
            console.log("Reconnecting to the database. Attempts remaining:", retries);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return query(sql, values, retries - 1);
        }
        throw error;
    }
}

export default query;