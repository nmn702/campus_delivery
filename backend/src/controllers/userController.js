import pool from '../db/pool.js';

export const getMe = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const updateMe = async (req, res) => {
    try {
        const { name, avatar_url, phone_number } = req.body;
        const result = await pool.query(
            'UPDATE users SET name = COALESCE($1, name), avatar_url = COALESCE($2, avatar_url), phone_number = COALESCE($3, phone_number), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
            [name, avatar_url, phone_number, req.user.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};
