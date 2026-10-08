/** Diagnóstico de IA persistido (escrito por retrofit-agent, leído por el frontend). */
export interface AiLog {
  id: number;
  machine_id: number | null;
  machine_ref: string | null;
  machine_name: string | null;
  severity: string;
  affected_component: string | null;
  technical_diagnosis: string | null;
  natural_conclusion: string | null;
  immediate_action: string | null;
  raw_payload: string | null;
  created_at: string;
}