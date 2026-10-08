/** Registro de mantenimiento (creado por el rol mantenimiento). */
export interface MaintenanceLog {
  id: number;
  machine_id: number | null;
  machine_nfc: string | null;
  machine_name: string | null;
  user_id: number;
  username: string;
  full_name: string;
  work_done: string;
  parts_replaced: string | null;
  observations: string | null;
  duration_min: number | null;
  created_at: string;
}

/** Payload para crear un mantenimiento. */
export interface MaintenanceInput {
  machineNfc: string;
  workDone: string;
  partsReplaced?: string | null;
  observations?: string | null;
  durationMin?: number | null;
}