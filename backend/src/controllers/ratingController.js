import pool from '../db/pool.js';

export const submitRating = async (req, res) => {
    try {
        const { id } = req.params;
        const { score, comment } = req.body;
        
        const requestRes = await pool.query('SELECT * FROM pickup_requests WHERE id = $1', [id]);
        if (requestRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        
        const request = requestRes.rows[0];
        
        if (request.status !== 'COMPLETED') {
            return res.status(400).json({ error: 'Request not completed' });
        }
        
        let to_user_id;
        if (request.requester_id === req.user.id) {
            to_user_id = request.runner_id;
        } else if (request.runner_id === req.user.id) {
            to_user_id = request.requester_id;
        } else {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        const result = await pool.query(
            `INSERT INTO ratings (request_id, from_user_id, to_user_id, score, comment) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [id, req.user.id, to_user_id, score, comment]
        );
        
        // Update user's average rating
        await pool.query(
            `UPDATE users 
             SET rating_average = (SELECT AVG(score) FROM ratings WHERE to_user_id = $1),
                 rating_count = (SELECT COUNT(*) FROM ratings WHERE to_user_id = $1)
             WHERE id = $1`,
            [to_user_id]
        );
        
        // Mark request as RATED if both have rated, or maybe just transition to RATED for now
        await pool.query("UPDATE pickup_requests SET status = 'RATED' WHERE id = $1", [id]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};
