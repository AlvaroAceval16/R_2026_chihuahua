export type PlantSeverity = "normal" | "advertencia" | "critico";

export interface PlantMachine {
  machineId: string;
  telemetry: {
    vibration_raw?: number;
    current_amp: number;
    temperature_c: number;
    humidity_percent: number;
  };
  oee: {
    availability: number;
    performance: number;
    quality: number;
  };
  ai_insight: {
    severidad: PlantSeverity;
    componente_afectado: string;
    diagnostico_tecnico: string;
    conclusion_natural: string;
    accion_inmediata: string;
  };
}

export type ResolutionStatus = "abierto" | "en curso" | "cerrado";

export interface HistoryEntry {
  timestamp: string;
  machineId: string;
  sensor: string;
  diagnosis: string;
  resolution: ResolutionStatus;
}

export interface MachineData {
  machineId: string;
  timestamp: string;

  telemetry: {
    vibration_g: number;
    current_amp: number;
    temperature_c: number;
  };

  oee: {
    availability: number;
    performance: number;
    quality: number;
  };

  lean_mudas: {
    defectos: number;
    sobreprocesamiento: number;
    esperas: number;
  };

  ai_insight: {
    severidad: "normal" | "advertencia" | "crítico";
    componente_afectado: "carcasa" | "ventilador" | "tapas" | null;
    diagnostico_tecnico: string;
    conclusion_natural: string;
    accion_inmediata: string;
  };
}
