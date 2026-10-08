import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { Server } from 'socket.io';
import mqtt from 'mqtt';
import { Ollama } from '@langchain/ollama';
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Base SQLite compartida con el frontend (frontend/../data/demo.db) ──
// En modo WAL para que Next.js y este proceso escriban sin bloquearse.
const DB_PATH = path.join(__dirname, '..', 'data', 'demo.db');
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA busy_timeout = 5000;');
db.exec(`
  CREATE TABLE IF NOT EXISTS machines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nfc_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    location TEXT,
    status TEXT NOT NULL DEFAULT 'operativa',
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
`);
console.log(`🗄️  Base de datos lista (${DB_PATH})`);

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const llm = new Ollama({ 
  baseUrl: "http://localhost:11434", 
  model: "llama3.1:8b", 
  temperature: 0.1, 
  format: "json" 
});

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    severidad: z.enum(["bajo", "medio", "alto", "critico", "crítico"]),
    componente_afectado: z.string().describe("Ej: balero_frontal, eje_motor"),
    diagnostico_tecnico: z.string().describe("Causa raíz técnica estructurada"),
    conclusion_natural: z.string().describe("Explicación urgente y directa para el operador en español."),
    accion_inmediata: z.string().describe("Instrucción clara de lo que debe hacer el operador a continuación")
  })
);

const prompt = new PromptTemplate({
  template: `Evalúa la maquinaria {machineId}. Nivel de impacto/vibración: {vibration} (Escala 0-1023, Normal < 800). Corriente: {current}A (Normal < 12). Temp: {temperature}C (Normal < 65). Genera un diagnóstico técnico industrial en español. NO uses schemas en la respuesta.\n{format_instructions}`,
  inputVariables: ["machineId", "vibration", "current", "temperature"],
  partialVariables: { format_instructions: parser.getFormatInstructions() },
});

io.on('connection', (socket) => {
  console.log('💻 Dashboard Frontend conectado al WebSocket');
});

const mqttClient = mqtt.connect('mqtt://localhost'); 

mqttClient.on('connect', () => {
  console.log('📡 Conectado al Broker Mosquitto');
  mqttClient.subscribe('retrofit/telemetria', () => {
    console.log('👂 Escuchando el topic: retrofit/telemetria');
  });
});

// Candado de estado general
let isAnalyzing = false;

mqttClient.on('message', async (topic, message) => {
  // BLOQUEO TOTAL: Si la IA está procesando un golpe, ignoramos TODO el tráfico nuevo
  if (isAnalyzing) return;

  try {
    const datosHardware = JSON.parse(message.toString());
    
    const machineId = datosHardware.maquina || datosHardware.machineId || "CNC-01";
    const vibration = datosHardware.valor || datosHardware.vibration || 0;
    
    if (vibration >= 800) {
      // Cerramos las compuertas de lectura
      isAnalyzing = true;
      
      const current = 18.5; 
      const temperature = 45.0; 
      
      console.log(`\n⚠️ ¡ALTO IMPACTO DETECTADO (${vibration})! Cerrando compuertas e invocando IA...`);
      
      try {
        const formattedPrompt = await prompt.format({ machineId, vibration, current, temperature });
        const response = await llm.invoke(formattedPrompt);
        const ai_insight = await parser.parse(response);

        const dashboardPayload = {
          machineId, 
          timestamp: new Date().toISOString(),
          telemetry: { vibration_raw: vibration, current_amp: current, temperature_c: temperature },
          oee: { 
            availability: (ai_insight.severidad === 'critico' || ai_insight.severidad === 'crítico') ? 60 : 92, 
            performance: 75, 
            quality: 98 
          },
          ai_insight
        };

        // ── Persistir el diagnóstico en el histórico (ai_logs) ──
        try {
          const machineRow = db.prepare('SELECT id, name FROM machines WHERE nfc_id = ?').get(machineId);
          db.prepare(`
            INSERT INTO ai_logs
              (machine_id, machine_ref, severity, affected_component,
               technical_diagnosis, natural_conclusion, immediate_action, raw_payload)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            machineRow ? machineRow.id : null,
            machineId,
            ai_insight.severidad,
            ai_insight.componente_afectado ?? null,
            ai_insight.diagnostico_tecnico ?? null,
            ai_insight.conclusion_natural ?? null,
            ai_insight.accion_inmediata ?? null,
            JSON.stringify(dashboardPayload)
          );
          console.log('💾 Diagnóstico guardado en ai_logs');
        } catch (dbError) {
          console.error('Error guardando ai_log:', dbError.message);
        }

        io.emit('alerta_critica', dashboardPayload);
        
        console.log("🚀 JSON empujado al Frontend. Resultado maestro:");
        console.log(JSON.stringify(dashboardPayload, null, 2));
        console.log("--------------------------------------------------");
      } catch (aiError) {
        console.error("Error en la inferencia de la IA:", aiError.message);
      } finally {
        // Se abre el candado INMEDIATAMENTE después de que la IA entrega su conclusión
        isAnalyzing = false;
        console.log("✅ IA terminó. Compuertas abiertas de nuevo para leer el sensor.");
      }
    }
  } catch (error) {
    console.error("Error procesando mensaje MQTT:", error.message);
  }
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Motor RetroFit 4.0 operativo en el puerto ${PORT}`);
});