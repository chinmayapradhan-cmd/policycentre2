import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { runGet } from '../db';

const router = express.Router();

router.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password required' });
    }

    try {
        console.log(`[LOGIN ATTEMPT] Username: ${username}`);
        const user: any = await runGet('SELECT * FROM users WHERE username = ?', [username]);

        if (!user) {
            console.log(`[LOGIN FAILED] User not found: ${username}`);
            // LIST ALL USERS TO DEBUG
            const allUsers = await runGet('SELECT username, role FROM users');
            console.log('[DEBUG] Existing users:', JSON.stringify(allUsers));
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log(`[LOGIN DEBUG] User found: ${user.username}, Role: ${user.role}, Hash: ${user.password_hash ? user.password_hash.substring(0, 10) + '...' : 'NONE'}`);

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            console.log(`[LOGIN FAILED] Password mismatch for user: ${username}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log(`[LOGIN SUCCESS] User: ${username}`);

        (req.session as any).user = { id: user.id, username: user.username, role: user.role };
        res.json({ id: user.id, username: user.username, role: user.role });
    } catch (err: any) {
        console.error('[LOGIN ERROR]', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ ok: true });
    });
});

router.get('/me', (req, res) => {
    const user = (req.session as any).user;
    if (user) {
        res.json(user);
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

export default router;
