import express, { Request, Response } from 'express';
import { runQuery, runGet } from '../db';

const router = express.Router();

// Middleware to ensure authentication
const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!(req.session as any).user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

router.use(requireAuth);

// List Message Queues
router.get('/', async (req: Request, res: Response) => {
    try {
        const { q, status, page = 1, pageSize = 25, sort = 'name', order = 'asc' } = req.query;
        const limit = Number(pageSize);
        const offset = (Number(page) - 1) * limit;

        let sql = 'SELECT * FROM message_queues WHERE 1=1';
        const params: any[] = [];

        if (q) {
            sql += ' AND name LIKE ?';
            params.push(`%${q}%`);
        }

        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }

        // Count total
        const countResult: any = await runGet(`SELECT COUNT(*) as count FROM (${sql.replace('SELECT *', 'SELECT id')})`, params);
        const total = countResult.count;

        // Sorting
        const allowedSorts = ['name', 'status', 'server_id', 'id'];
        const sortCol = allowedSorts.includes(String(sort)) ? String(sort) : 'name';
        const sortOrder = order === 'desc' ? 'DESC' : 'ASC';

        sql += ` ORDER BY ${sortCol} ${sortOrder} LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const items = await runQuery(sql, params);

        // Map to camelCase
        const mappedItems = items.map(item => ({
            id: item.id,
            name: item.name,
            status: item.status,
            serverId: item.server_id,
            updatedAt: item.updated_at
        }));

        res.json({
            items: mappedItems,
            page: Number(page),
            pageSize: limit,
            total
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching message queues' });
    }
});

// Get Detail
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const queue: any = await runGet('SELECT * FROM message_queues WHERE id = ?', [id]);

        if (!queue) {
            return res.status(404).json({ message: 'Queue not found' });
        }

        const stats: any = await runGet('SELECT * FROM queue_stats WHERE queue_id = ? ORDER BY created_at DESC LIMIT 1', [id]);

        // Calculate real counts from messages table to ensure consistency
        const realCounts: any = await runGet(`
            SELECT 
                SUM(failed) as failed,
                SUM(retryable_error) as retryableError,
                SUM(in_flight) as inFlight,
                SUM(unsent) as unsent
            FROM queue_messages 
            WHERE queue_id = ?
        `, [id]);

        res.json({
            id: queue.id,
            name: queue.name,
            status: queue.status,
            serverId: queue.server_id,
            updatedAt: queue.updated_at,
            totals: {
                started: stats ? stats.started : 0, // Keep from stats or 0
                failed: realCounts ? (realCounts.failed || 0) : 0,
                retryableError: realCounts ? (realCounts.retryableError || 0) : 0,
                inFlight: realCounts ? (realCounts.inFlight || 0) : 0,
                unsent: realCounts ? (realCounts.unsent || 0) : 0,
                batched: stats ? stats.batched : 0,
                awaitingRetry: stats ? stats.awaiting_retry : 0
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching queue details' });
    }
});

// Get Messages
router.get('/:id/messages', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { page = 1, pageSize = 25, filter } = req.query;
        const limit = Number(pageSize);
        const offset = (Number(page) - 1) * limit;

        let sql = 'SELECT * FROM queue_messages WHERE queue_id = ?';
        const params: any[] = [id];

        if (filter) {
            if (filter === 'failed') {
                sql += ' AND failed > 0';
            } else if (filter === 'retryable') {
                sql += ' AND retryable_error > 0';
            } else if (filter === 'inflight') {
                sql += ' AND in_flight > 0';
            } else if (filter === 'unsent') {
                sql += ' AND unsent > 0';
            } else if (filter === 'problems') {
                sql += ' AND (failed > 0 OR retryable_error > 0 OR in_flight > 0 OR unsent > 0)';
            }
        }

        const countResult: any = await runGet(`SELECT COUNT(*) as count FROM (${sql.replace('SELECT *', 'SELECT id')})`, params);
        const total = countResult.count;

        sql += ' ORDER BY send_time DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const items = await runQuery(sql, params);

        const mappedItems = items.map(item => ({
            rowId: item.id,
            messageId: item.message_id,
            account: item.account,
            sendTime: item.send_time,
            failed: item.failed,
            retryableError: item.retryable_error,
            inFlight: item.in_flight,
            unsent: item.unsent,
            errorMessage: item.error_message
        }));

        res.json({
            items: mappedItems,
            page: Number(page),
            pageSize: limit,
            total
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

export default router;
