import pool from '../db/pool.js';

export const getStores = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM stores WHERE active = TRUE');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};
