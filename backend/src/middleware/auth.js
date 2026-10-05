import pool from '../db/pool.js';
import '../firebase.js'; // Ensure it's initialized
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';

export const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        
        // Verify Firebase ID Token
        let decodedToken;
        try {
            decodedToken = await getAuth().verifyIdToken(token);
        } catch (error) {
            console.error('Error verifying Firebase token:', error);
            fs.appendFileSync('auth-error.log', new Date().toISOString() + ': ' + error.toString() + '\n' + (error.stack || '') + '\n');
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        const firebase_uid = decodedToken.uid;
        const email = decodedToken.email || `${firebase_uid}@example.com`;

        // Check if user exists in PostgreSQL by firebase_uid
        let result = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [firebase_uid]);
        let user = result.rows[0];
        
        if (!user && decodedToken.email) {
            // Check if user exists by email (in case Firebase project was recreated)
            result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (result.rows[0]) {
                // Update their firebase_uid to the new one
                const updateRes = await pool.query(
                    'UPDATE users SET firebase_uid = $1 WHERE email = $2 RETURNING *',
                    [firebase_uid, email]
                );
                user = updateRes.rows[0];
            }
        }

        // Auto-create user if missing (simulates a first login after Firebase signup)
        if (!user) {
            const insertResult = await pool.query(
                'INSERT INTO users (firebase_uid, name, email) VALUES ($1, $2, $3) RETURNING *',
                [firebase_uid, decodedToken.name || `User_${firebase_uid.substring(0,5)}`, email]
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
