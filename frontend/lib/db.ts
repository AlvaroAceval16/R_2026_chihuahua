import { DatabaseSync } from "node:sqlite";
import path from "node:path";

/**
 * Base SQLite compartida con retrofit-agent.
 * Se resuelve contra la raíz del repo (frontend/../data/demo.db) porque
 * retrofit-agent calcula la misma ruta desde su propia carpeta.
 */
const DB_PATH = path.join(process.cwd(), "..", "data", "demo.db");

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    // WAL: permite que Next.js y retrofit-agent escriban sin bloquearse.
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA busy_timeout = 5000;");
    db.exec("PRAGMA foreign_keys = ON;");
    migrate(db);
  }
  return db;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  role TEXT NOT NULL CHECK (role IN ('supervisor','mantenimiento')),
  full_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS machines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nfc_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'operativa' CHECK (status IN ('operativa','mantenimiento','averiada')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  machine_id INTEGER REFERENCES machines(id) ON DELETE SET NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  work_done TEXT NOT NULL,
  parts_replaced TEXT,
  observations TEXT,
  duration_min INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ai_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  machine_id INTEGER REFERENCES machines(id) ON DELETE SET NULL,
  machine_ref TEXT,
  severity TEXT NOT NULL,
  affected_component TEXT,
  technical_diagnosis TEXT,
  natural_conclusion TEXT,
  immediate_action TEXT,
  raw_payload TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

function migrate(database: DatabaseSync): void {
  database.exec(SCHEMA);
  seedIfEmpty(database);
}

/** Inserta datos demo si la BD es nueva (idempotente). */
function seedIfEmpty(database: DatabaseSync): void {
  const userCount = database
    .prepare("SELECT COUNT(*) AS c FROM users")
    .get() as { c: number };

  if (userCount.c === 0) {
    const insertUser = database.prepare(
      "INSERT INTO users (username, password_hash, role, full_name) VALUES (?, NULL, ?, ?)"
    );
    insertUser.run("supervisor", "supervisor", "Juan Pérez — Supervisor de Piso");
    insertUser.run("mantenimiento", "mantenimiento", "María López — Mantenimiento");
  }

  const machineCount = database
    .prepare("SELECT COUNT(*) AS c FROM machines")
    .get() as { c: number };

  if (machineCount.c === 0) {
    const insertMachine = database.prepare(
      "INSERT INTO machines (nfc_id, name, location, status) VALUES (?, ?, ?, 'operativa')"
    );
    insertMachine.run("motor-01", "Motor Principal — Motor-01", "Línea de producción 1");
    insertMachine.run("cnc-01", "Centro de Mecanizado CNC-01", "Celda de mecanizado");
    insertMachine.run("compresor-01", "Compresor de Aire", "Cuarto de máquinas");
  }
}