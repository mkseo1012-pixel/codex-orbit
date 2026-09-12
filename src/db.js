import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
mkdirSync('data',{recursive:true});
export const db = new DatabaseSync(process.env.SQLITE_PATH||path.resolve('data/orbit.sqlite'));
db.exec('PRAGMA journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,created_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL,expires_at INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS runs(id TEXT PRIMARY KEY,user_id TEXT,goal TEXT NOT NULL,status TEXT NOT NULL,config_json TEXT NOT NULL,created_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY AUTOINCREMENT,run_id TEXT,agent_id TEXT,text TEXT,created_at TEXT NOT NULL);`);
export const q={userByEmail:db.prepare('SELECT * FROM users WHERE email=?'),insertUser:db.prepare('INSERT INTO users VALUES(?,?,?,?)'),insertSession:db.prepare('INSERT INTO sessions VALUES(?,?,?)'),session:db.prepare('SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at>?'),saveRun:db.prepare('INSERT OR REPLACE INTO runs VALUES(?,?,?,?,?,?)'),saveEvent:db.prepare('INSERT INTO events(run_id,agent_id,text,created_at) VALUES(?,?,?,?)')};
