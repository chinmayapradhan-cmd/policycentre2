const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'app.db');
const INIT_SQL_PATH = path.join(__dirname, 'init.sql');
const SEED_DATA_PATH = path.join(__dirname, 'seed-data.json');

async function initDb() {
    console.log('Initializing database...');

    if (!fs.existsSync(path.dirname(DB_PATH))) {
        fs.mkdirSync(path.dirname(DB_PATH));
    }



    const db = new sqlite3.Database(DB_PATH);

    const runRun = (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    };

    const runExec = (sql) => {
        return new Promise((resolve, reject) => {
            db.exec(sql, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    };

    // Clear existing data (DELETE to avoid locking issues)
    try {
        await runRun("DELETE FROM queue_messages");
        await runRun("DELETE FROM queue_stats");
        await runRun("DELETE FROM message_queues");
        await runRun("DELETE FROM users");
        await runRun("DELETE FROM sqlite_sequence");
        console.log('Cleared existing data.');
    } catch (e) {
        console.log('Tables likely do not exist yet, skipping delete.');
    }

    // Read and execute init.sql
    const initSql = fs.readFileSync(INIT_SQL_PATH, 'utf-8');
    await runExec(initSql);

    console.log('Seeding data from JSON...');

    if (!fs.existsSync(SEED_DATA_PATH)) {
        console.error('seed-data.json not found!');
        process.exit(1);
    }

    const seedData = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf-8'));

    // Seed Users
    if (seedData.users) {
        for (const user of seedData.users) {
            // Re-hash for security consistency, or use provided hash if known good
            // Here we'll just hash 'admin123' if the username is admin, or use a default
            const password = 'admin123';
            const hashedPassword = await bcrypt.hash(password, 10);
            await runRun("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", [user.username, hashedPassword, user.role]);
        }
    }

    // Helper for safe integers (default 0)
    const safeInt = (val) => (val === null || val === undefined) ? 0 : val;
    // Helper for safe dates (default now)
    const safeDate = (val) => val || new Date().toISOString();

    // Seed Message Queues
    if (seedData.queues) {
        for (const q of seedData.queues) {
            await runRun(
                "INSERT INTO message_queues (id, name, status, server_id, updated_at) VALUES (?, ?, ?, ?, ?)",
                [q.id, q.name, q.status, q.server_id, safeDate(q.updated_at)]
            );
        }
    }

    // Seed Stats
    if (seedData.stats) {
        for (const s of seedData.stats) {
            await runRun(
                `INSERT INTO queue_stats 
                (queue_id, started, failed, retryable_error, in_flight, unsent, batched, awaiting_retry, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    s.queue_id,
                    safeInt(s.started),
                    safeInt(s.failed),
                    safeInt(s.retryable_error),
                    safeInt(s.in_flight),
                    safeInt(s.unsent),
                    safeInt(s.batched),
                    safeInt(s.awaiting_retry),
                    safeDate(s.created_at)
                ]
            );
        }
    }

    // Seed Messages
    if (seedData.messages) {
        for (const m of seedData.messages) {
            await runRun(
                `INSERT INTO queue_messages
                (queue_id, message_id, account, send_time, failed, retryable_error, in_flight, unsent, error_message)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    m.queue_id,
                    m.message_id,
                    m.account,
                    safeDate(m.send_time),
                    safeInt(m.failed),
                    safeInt(m.retryable_error),
                    safeInt(m.in_flight),
                    safeInt(m.unsent),
                    m.error_message
                ]
            );
        }
    }

    console.log('Seeding completed.');
    db.close();
}

initDb().catch(console.error);

