import { getDb } from "@/lib/db";
import type { Machine } from "@/types/machine";
import type { MaintenanceLog, MaintenanceInput } from "@/types/maintenance";
import type { AiLog } from "@/types/ai";

/* ─────────────────────────────── Máquinas ─────────────────────────────── */

export function listMachines(): Machine[] {
  return getDb()
    .prepare("SELECT * FROM machines ORDER BY id")
    .all() as unknown as Machine[];
}

/** Resuelve una máquina por nfc_id (o por id numérico). */
export function getMachine(ref: string): Machine | undefined {
  const isNumeric = /^\d+$/.test(ref);
  const row = isNumeric
    ? getDb().prepare("SELECT * FROM machines WHERE id = ?").get(Number(ref))
    : getDb().prepare("SELECT * FROM machines WHERE nfc_id = ?").get(ref);
  return row as unknown as Machine | undefined;
}

export interface MachineState {
  machine: Machine;
  latest_ai_log: AiLog | null;
  maintenance_count: number;
}

/** Estado de una máquina: catálogo + último diagnóstico de IA + nº de mantenimientos. */
export function getMachineState(ref: string): MachineState | null {
  const machine = getMachine(ref);
  if (!machine) return null;

  const latest = getDb()
    .prepare("SELECT * FROM ai_logs WHERE machine_id = ? ORDER BY id DESC LIMIT 1")
    .get(machine.id) as unknown as AiLog | undefined;

  const count = getDb()
    .prepare("SELECT COUNT(*) AS c FROM maintenance_logs WHERE machine_id = ?")
    .get(machine.id) as unknown as { c: number };

  return {
    machine,
    latest_ai_log: latest ?? null,
    maintenance_count: Number(count.c),
  };
}

/* ───────────────────────────── Mantenimiento ──────────────────────────── */

export function createMaintenance(
  input: MaintenanceInput & { machineId: number; userId: number }
): MaintenanceLog {
  const result = getDb()
    .prepare(
      `INSERT INTO maintenance_logs
         (machine_id, user_id, work_done, parts_replaced, observations, duration_min, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .run(
      input.machineId,
      input.userId,
      input.workDone,
      input.partsReplaced ?? null,
      input.observations ?? null,
      input.durationMin ?? null
    );

  return getDb()
    .prepare(
      `SELECT ml.*, u.username, u.full_name,
              m.nfc_id AS machine_nfc, m.name AS machine_name
       FROM maintenance_logs ml
       JOIN users u ON u.id = ml.user_id
       LEFT JOIN machines m ON m.id = ml.machine_id
       WHERE ml.id = ?`
    )
    .get(Number(result.lastInsertRowid)) as unknown as MaintenanceLog;
}

/* ───────────────────────────────── Logs ───────────────────────────────── */

export interface LogFilters {
  machine?: string;
  from?: string;
  to?: string;
}

export function listMaintenanceLogs(filters: LogFilters = {}): MaintenanceLog[] {
  const where: string[] = [];
  const params: (string | number)[] = [];

  if (filters.machine) {
    where.push(
      "(ml.machine_id = ? OR (SELECT nfc_id FROM machines WHERE id = ml.machine_id) = ?)"
    );
    params.push(Number(filters.machine) || 0, filters.machine);
  }
  if (filters.from) {
    where.push("ml.created_at >= ?");
    params.push(filters.from);
  }
  if (filters.to) {
    where.push("ml.created_at <= ?");
    params.push(filters.to);
  }

  const sql = `
    SELECT ml.*, u.username, u.full_name,
           m.nfc_id AS machine_nfc, m.name AS machine_name
    FROM maintenance_logs ml
    JOIN users u ON u.id = ml.user_id
    LEFT JOIN machines m ON m.id = ml.machine_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY ml.id DESC
    LIMIT 200`;

  return getDb().prepare(sql).all(...params) as unknown as MaintenanceLog[];
}

export function listAiLogs(filters: LogFilters = {}): AiLog[] {
  const where: string[] = [];
  const params: (string | number)[] = [];

  if (filters.machine) {
    where.push("(al.machine_id = ? OR al.machine_ref = ?)");
    params.push(Number(filters.machine) || 0, filters.machine);
  }
  if (filters.from) {
    where.push("al.created_at >= ?");
    params.push(filters.from);
  }
  if (filters.to) {
    where.push("al.created_at <= ?");
    params.push(filters.to);
  }

  const sql = `
    SELECT al.*, m.name AS machine_name
    FROM ai_logs al
    LEFT JOIN machines m ON m.id = al.machine_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY al.id DESC
    LIMIT 200`;

  return getDb().prepare(sql).all(...params) as unknown as AiLog[];
}