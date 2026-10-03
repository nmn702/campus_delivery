import pool from '../db/pool.js';

export const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        // MOCK FIREBASE AUTH: Using the token string directly as firebase_uid for local testing
        const token = authHeader.split(' ')[1];
        const firebase_uid = token;

        // Check if user exists in PostgreSQL
        let result = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [firebase_uid]);
        let user = result.rows[0];
        
        // Auto-create user if missing (simulates a first login after Firebase signup)
        if (!user) {
            const insertResult = await pool.query(
                'INSERT INTO users (firebase_uid, name, email) VALUES ($1, $2, $3) RETURNING *',
                [firebase_uid, `User_${firebase_uid.substring(0,5)}`, `${firebase_uid}@example.com`]
            );
            user = insertResult.rows[0];
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
