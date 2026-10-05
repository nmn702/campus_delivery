import pool from '../db/pool.js';

export const createRunnerSession = async (req, res) => {
    try {
        const { store_ids, latitude, longitude, duration_minutes = 60 } = req.body;
        
        if (!store_ids || !Array.isArray(store_ids) || store_ids.length === 0 || store_ids.length > 3) {
            return res.status(400).json({ error: 'Must provide between 1 and 3 store_ids' });
        }

        // Disable any existing active session for this user
        await pool.query(
            "UPDATE runner_sessions SET status = 'OFFLINE' WHERE user_id = $1 AND status != 'OFFLINE'",
            [req.user.id]
        );

        const expires_at = new Date(Date.now() + duration_minutes * 60000);
        const insertedSessions = [];

        for (const store_id of store_ids) {
            const result = await pool.query(
                `INSERT INTO runner_sessions (user_id, store_id, latitude, longitude, expires_at) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [req.user.id, store_id, latitude, longitude, expires_at]
            );
            insertedSessions.push(result.rows[0]);
        }

        res.status(201).json(insertedSessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const updateRunnerSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { latitude, longitude, status } = req.body;

        const session = await pool.query('SELECT * FROM runner_sessions WHERE id = $1', [id]);
        if (session.rows.length === 0) return res.status(404).json({ error: 'Session not found' });
        if (session.rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

        const result = await pool.query(
            `UPDATE runner_sessions 
             SET latitude = COALESCE($1, latitude), 
                 longitude = COALESCE($2, longitude), 
                 status = COALESCE($3, status),
                 last_location_update = CURRENT_TIMESTAMP
             WHERE id = $4 RETURNING *`,
            [latitude, longitude, status, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const deleteMySessions = async (req, res) => {
    try {
        await pool.query("UPDATE runner_sessions SET status = 'OFFLINE' WHERE user_id = $1 AND status != 'OFFLINE'", [req.user.id]);
        res.json({ message: 'All sessions ended' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const deleteRunnerSession = async (req, res) => {
    try {
        const { id } = req.params;
        
        const session = await pool.query('SELECT * FROM runner_sessions WHERE id = $1', [id]);
        if (session.rows.length === 0) return res.status(404).json({ error: 'Session not found' });
        if (session.rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

        await pool.query("UPDATE runner_sessions SET status = 'OFFLINE' WHERE id = $1", [id]);
        res.json({ message: 'Session ended' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const getRunners = async (req, res) => {
    try {
        const { store_id } = req.query;
        if (!store_id) return res.status(400).json({ error: 'store_id is required' });

        // Get available runners for a store whose session hasn't expired, excluding the requester
        const result = await pool.query(
            `SELECT rs.*, u.name, u.avatar_url, u.rating_average, u.rating_count 
             FROM runner_sessions rs
             JOIN users u ON rs.user_id = u.id
             WHERE rs.store_id = $1 AND rs.status = 'AVAILABLE' AND rs.expires_at > CURRENT_TIMESTAMP AND rs.user_id != $2`,
            [store_id, req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const getMySession = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT rs.*, s.name as store_name 
             FROM runner_sessions rs
             JOIN stores s ON rs.store_id = s.id
             WHERE rs.user_id = $1 AND rs.status != 'OFFLINE' AND rs.expires_at > CURRENT_TIMESTAMP`,
            [req.user.id]
        );
        // Return array of active sessions
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};
