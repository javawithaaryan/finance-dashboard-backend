const Database = require('better-sqlite3');
const db = new Database('finance.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'viewer' CHECK(role IN ('viewer','analyst','admin')),
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    type TEXT CHECK(type IN ('income','expense')) NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    notes TEXT,
    created_by INTEGER,
    is_deleted INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

module.exports = db;
