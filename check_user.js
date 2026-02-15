const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const DB_PATH = path.join(__dirname, 'db', 'app.db');
const db = new sqlite3.Database(DB_PATH);

db.get('SELECT * FROM users WHERE username = ?', ['admin'], async (err, row) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('User found:', row);
    if (row) {
        const match = await bcrypt.compare('admin123', row.password_hash);
        console.log('Password match for "admin123":', match);
    }
});
