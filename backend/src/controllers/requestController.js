import pool from '../db/pool.js';

export const createRequest = async (req, res) => {
    try {
        const { store_id, items, commission_type, commission_amount, pickup_location, notes } = req.body;
        
        const result = await pool.query(
            `INSERT INTO pickup_requests 
             (requester_id, store_id, items, commission_type, commission_amount, pickup_location, notes) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [req.user.id, store_id, items, commission_type, commission_amount, pickup_location, notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const getRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT pr.*, 
                    req.name as requester_name, req.avatar_url as requester_avatar, req.firebase_uid as requester_firebase_uid, req.phone_number as requester_phone,
                    run.name as runner_name, run.avatar_url as runner_avatar, run.firebase_uid as runner_firebase_uid, run.phone_number as runner_phone,
                    s.name as store_name
             FROM pickup_requests pr
             JOIN users req ON pr.requester_id = req.id
             LEFT JOIN users run ON pr.runner_id = run.id
             JOIN stores s ON pr.store_id = s.id
             WHERE pr.id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) return res.status(404).json({ error: 'Request not found' });
        
        const request = result.rows[0];
        // Only participants can view
        if (request.requester_id !== req.user.id && request.runner_id !== req.user.id) {
            // Need to allow runner to view before accepting? 
            // In a real app, maybe only if status is PENDING, or they discovered it.
            // Let's allow viewing if it's PENDING and in their active store, but for simplicity:
            if (request.status !== 'PENDING') {
                return res.status(403).json({ error: 'Forbidden' });
            }
        }
        
        res.json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const acceptRequest = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        
        await client.query('BEGIN');
        
        // Lock the row for update
        const requestRes = await client.query(
            'SELECT * FROM pickup_requests WHERE id = $1 FOR UPDATE',
            [id]
        );
        
        if (requestRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Request not found' });
        }
        
        const request = requestRes.rows[0];
        
        if (request.requester_id === req.user.id) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Cannot accept your own request' });
        }
        
        if (request.status !== 'PENDING') {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'Request is no longer pending' });
        }
        
        const updateRes = await client.query(
            `UPDATE pickup_requests 
             SET status = 'ACCEPTED', runner_id = $1, accepted_at = CURRENT_TIMESTAMP
             WHERE id = $2 RETURNING *`,
            [req.user.id, id]
        );
        
        // Also update runner session to BUSY
        await client.query(
            `UPDATE runner_sessions SET status = 'BUSY' 
             WHERE user_id = $1 AND store_id = $2 AND status = 'AVAILABLE'`,
            [req.user.id, request.store_id]
        );

        await client.query('COMMIT');
        res.json(updateRes.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    } finally {
        client.release();
    }
};

export const cancelRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const requestRes = await pool.query('SELECT * FROM pickup_requests WHERE id = $1', [id]);
        
        if (requestRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        
        const request = requestRes.rows[0];
        if (request.requester_id !== req.user.id && request.runner_id !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        if (request.status === 'COMPLETED' || request.status === 'CANCELLED') {
            return res.status(400).json({ error: 'Cannot cancel' });
        }

        const result = await pool.query(
            "UPDATE pickup_requests SET status = 'CANCELLED' WHERE id = $1 RETURNING *",
            [id]
        );
        
        if (request.runner_id) {
            await pool.query(
                "UPDATE runner_sessions SET status = 'AVAILABLE' WHERE user_id = $1 AND status = 'BUSY'",
                [request.runner_id]
            );
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const completeRequest = async (req, res) => {
    try {
        const { id } = req.params;
        
        const requestRes = await pool.query('SELECT * FROM pickup_requests WHERE id = $1', [id]);
        if (requestRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        
        const request = requestRes.rows[0];
        if (request.runner_id !== req.user.id) {
            return res.status(403).json({ error: 'Only the runner can complete the request' });
        }
        
        if (request.status !== 'PAID' && request.status !== 'ACCEPTED') { // simplified, usually PAID -> COMPLETED
             return res.status(400).json({ error: 'Invalid state transition' });
        }

        const result = await pool.query(
            "UPDATE pickup_requests SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
            [id]
        );
        
        await pool.query(
            "UPDATE runner_sessions SET status = 'AVAILABLE' WHERE user_id = $1 AND status = 'BUSY'",
            [req.user.id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const getHistory = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT pr.*, s.name as store_name 
             FROM pickup_requests pr
             JOIN stores s ON pr.store_id = s.id
             WHERE pr.requester_id = $1 OR pr.runner_id = $1
             ORDER BY pr.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const getPendingRequests = async (req, res) => {
    try {
        const { store_id } = req.query;
        if (!store_id) return res.status(400).json({ error: 'store_id is required' });

        const result = await pool.query(
            `SELECT pr.*, s.name as store_name 
             FROM pickup_requests pr
             JOIN stores s ON pr.store_id = s.id
             WHERE pr.store_id = $1 AND pr.status = 'PENDING'
             ORDER BY pr.created_at ASC`,
            [store_id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};
