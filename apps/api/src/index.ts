import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { db } from './db';
import authRoutes from './routes/auth';
import queueRoutes from './routes/message-queues';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: 'supersecretkey_change_in_production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using https
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Routes
app.use('/api/auth', authRoutes);
// ==================================================================
// DATA EXTRACTION PORTS
// Use these endpoints to fetch data for the replica UI.
// No extra extraction logic is implemented, just pure data access.
// ==================================================================
app.use('/api/message-queues', queueRoutes);

app.get('/api/health', (req, res) => {
    res.send('API is running');
});

// For Vercel, we need to export the app
export default app;

// Only listen if running locally (not imported as a module)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
