-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER'
);

-- Message Queues Table
CREATE TABLE IF NOT EXISTS message_queues (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    server_id TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Queue Stats Table
CREATE TABLE IF NOT EXISTS queue_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    queue_id INTEGER NOT NULL,
    started INTEGER NOT NULL DEFAULT 0,
    failed INTEGER NOT NULL DEFAULT 0,
    retryable_error INTEGER NOT NULL DEFAULT 0,
    in_flight INTEGER NOT NULL DEFAULT 0,
    unsent INTEGER NOT NULL DEFAULT 0,
    batched INTEGER NOT NULL DEFAULT 0,
    awaiting_retry INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(queue_id) REFERENCES message_queues(id)
);

-- Queue Messages Table
CREATE TABLE IF NOT EXISTS queue_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    queue_id INTEGER NOT NULL,
    message_id TEXT NOT NULL,
    account TEXT,
    send_time TEXT NOT NULL,
    failed INTEGER NOT NULL DEFAULT 0,
    retryable_error INTEGER NOT NULL DEFAULT 0,
    in_flight INTEGER NOT NULL DEFAULT 0,
    unsent INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    FOREIGN KEY(queue_id) REFERENCES message_queues(id)
);
