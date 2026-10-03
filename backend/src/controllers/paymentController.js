import pool from '../db/pool.js';

export const submitCost = async (req, res) => {
    try {
        const { id } = req.params;
        const { cost_of_goods } = req.body;
        
        const requestRes = await pool.query('SELECT * FROM pickup_requests WHERE id = $1', [id]);
        if (requestRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        
        if (requestRes.rows[0].runner_id !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        const result = await pool.query(
            "UPDATE pickup_requests SET cost_of_goods = $1, status = 'COST_SUBMITTED' WHERE id = $2 AND status = 'ACCEPTED' RETURNING *",
            [cost_of_goods, id]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const requesterConfirmPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { declared_amount } = req.body;
        
        const requestRes = await pool.query('SELECT * FROM pickup_requests WHERE id = $1', [id]);
        if (requestRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        
        if (requestRes.rows[0].requester_id !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        let paymentRes = await pool.query('SELECT * FROM payments WHERE request_id = $1', [id]);
        
        if (paymentRes.rows.length === 0) {
            paymentRes = await pool.query(
                `INSERT INTO payments (request_id, declared_amount, requester_confirmed_at) 
                 VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *`,
                [id, declared_amount]
            );
        } else {
            paymentRes = await pool.query(
                `UPDATE payments SET requester_confirmed_at = CURRENT_TIMESTAMP WHERE request_id = $1 RETURNING *`,
                [id]
            );
        }
        
        await pool.query(
            "UPDATE pickup_requests SET status = 'PAYMENT_PENDING' WHERE id = $1 AND status = 'COST_SUBMITTED'",
            [id]
        );
        
        res.json(paymentRes.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const runnerConfirmPayment = async (req, res) => {
    try {
        const { id } = req.params;
        
        const requestRes = await pool.query('SELECT * FROM pickup_requests WHERE id = $1', [id]);
        if (requestRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        
        if (requestRes.rows[0].runner_id !== req.user.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        const paymentRes = await pool.query(
            `UPDATE payments SET runner_confirmed_at = CURRENT_TIMESTAMP WHERE request_id = $1 RETURNING *`,
            [id]
        );
        
        await pool.query(
            "UPDATE pickup_requests SET status = 'PAID' WHERE id = $1",
            [id]
        );
        
        res.json(paymentRes.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};
