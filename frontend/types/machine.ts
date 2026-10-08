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
