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
        const user: any = await runGet('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        (req.session as any).user = { id: user.id, username: user.username, role: user.role };
        res.json({ id: user.id, username: user.username, role: user.role });
    } catch (err: any) {
        console.error(err);
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
