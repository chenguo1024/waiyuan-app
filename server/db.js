import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.DATA_DIR || __dirname
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })
const db = new Database(join(dataDir, 'waiyuan.db'))

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    email TEXT DEFAULT '',
    name TEXT DEFAULT '',
    student_id TEXT DEFAULT '',
    id_card TEXT DEFAULT '',
    password_hash TEXT NOT NULL,
    credit_score INTEGER DEFAULT 100,
    coin_balance INTEGER DEFAULT 0,
    membership TEXT DEFAULT 'none',
    membership_expire_at TEXT,
    free_urgent_count INTEGER DEFAULT 0,
    avatar TEXT DEFAULT '',
    gender TEXT DEFAULT '',
    major TEXT DEFAULT '',
    qq TEXT DEFAULT '',
    birthday TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS email_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sms_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    pickup_location TEXT DEFAULT '',
    delivery_location TEXT DEFAULT '',
    reward REAL DEFAULT 0,
    is_urgent INTEGER DEFAULT 0,
    urgent_fee REAL DEFAULT 0,
    urgent_deadline TEXT,
    status TEXT DEFAULT 'open',
    publisher_id TEXT NOT NULL,
    publisher_name TEXT DEFAULT '',
    publisher_credit INTEGER DEFAULT 100,
    is_publisher_member INTEGER DEFAULT 0,
    accepted_by TEXT,
    accepted_name TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    price REAL DEFAULT 0,
    original_price REAL,
    condition_text TEXT DEFAULT 'good',
    is_urgent INTEGER DEFAULT 0,
    seller_id TEXT NOT NULL,
    seller_name TEXT DEFAULT '',
    seller_credit INTEGER DEFAULT 100,
    seller_phone TEXT DEFAULT '',
    is_seller_member INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    item_id TEXT NOT NULL,
    title TEXT DEFAULT '',
    amount REAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    user_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL DEFAULT 0,
    description TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS study_resources (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    price REAL DEFAULT 0,
    publisher_id TEXT NOT NULL,
    publisher_name TEXT DEFAULT '',
    tags TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS carpool_rides (
    id TEXT PRIMARY KEY,
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    seats INTEGER DEFAULT 4,
    seats_left INTEGER DEFAULT 4,
    fee REAL DEFAULT 0,
    publisher_id TEXT NOT NULL,
    publisher_name TEXT DEFAULT '',
    publisher_phone TEXT DEFAULT '',
    note TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT DEFAULT 'system',
    title TEXT DEFAULT '',
    message TEXT DEFAULT '',
    read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, date)
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user1_id TEXT NOT NULL,
    user2_id TEXT NOT NULL,
    last_message TEXT DEFAULT '',
    last_message_at TEXT DEFAULT (datetime('now')),
    unread_user1 INTEGER DEFAULT 0,
    unread_user2 INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, item_id, item_type)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT DEFAULT '',
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS wall_posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT DEFAULT '',
    content TEXT NOT NULL,
    images TEXT DEFAULT '',
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    friend_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, friend_id)
  );
')

// add like_count and comment_count columns to existing tables
try { db.exec('ALTER TABLE tasks ADD COLUMN like_count INTEGER DEFAULT 0') } catch {}
try { db.exec('ALTER TABLE tasks ADD COLUMN comment_count INTEGER DEFAULT 0') } catch {}
try { db.exec('ALTER TABLE products ADD COLUMN like_count INTEGER DEFAULT 0') } catch {}
try { db.exec('ALTER TABLE products ADD COLUMN comment_count INTEGER DEFAULT 0') } catch {}

export default db

