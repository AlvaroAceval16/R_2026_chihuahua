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

// machineId del agente (plant.json) → nfc_id del catálogo compartido.
const PLANT_TO_NFC = {
  "CNC-01": "cnc-01",
  "CNC-02": "motor-01",
  "CNC-03": "compresor-01",
};

function saveDiagnosis(machineId, aiInsight, payload) {
  try {
    const nfcId = PLANT_TO_NFC[machineId] || machineId;
    const machineRow = db
      .prepare("SELECT id FROM machines WHERE lower(nfc_id) = lower(?)")
      .get(nfcId);
    db.prepare(`
      INSERT INTO ai_logs
        (machine_id, machine_ref, severity, affected_component,
         technical_diagnosis, natural_conclusion, immediate_action, raw_payload)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      machineRow ? machineRow.id : null,
      machineId,
      aiInsight.severidad,
      aiInsight.componente_afectado ?? null,
      aiInsight.diagnostico_tecnico ?? null,
      aiInsight.conclusion_natural ?? null,
      aiInsight.accion_inmediata ?? null,
      JSON.stringify(payload)
    );
    console.log(`💾 Diagnóstico ${aiInsight.severidad} de ${machineId} guardado en ai_logs`);
  } catch (dbError) {
    console.error("Error guardando ai_log:", dbError.message);
  }
}

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
    severidad: z.enum(["advertencia", "critico", "crítico"]),
    componente_afectado: z.string().describe("CNC-01: balero o motor. CNC-02: ventilador, bornes o clima."),
    diagnostico_tecnico: z.string().describe("Causa raíz técnica en una o dos frases."),
    conclusion_natural: z.string().describe("Explicación directa para el operador, citando las lecturas."),
    accion_inmediata: z.string().describe("Una instrucción concreta para el operador.")
  })
);

const VIBRATION_WARN = 500;
const VIBRATION_LIMIT = 800;
const TEMPERATURE_WARN = 50;
const TEMPERATURE_LIMIT = 65;
const HUMIDITY_WARN = 55;
const HUMIDITY_LIMIT = 70;
const HEARTBEAT_MS = 300;
const RANK = { normal: 0, advertencia: 1, critico: 2 };

function zone(value, warn, crit) {
  if (value >= crit) return "error";
  if (value >= warn) return "advertencia";
  return "normal";
}

function alertFromZones(...zones) {
  if (zones.includes("error")) return "critico";
  if (zones.includes("advertencia")) return "advertencia";
  return "normal";
}

const promptImpacto = new PromptTemplate({
  template: `Eres el agente de diagnóstico de RetroFit para {machineId}.
Esta máquina SOLO mide vibración (0-1023) y temperatura (°C). NO hay sensor de humedad. PROHIBIDO mencionar humedad, HR, clima o condensación.

Umbrales:
- Vibración: normal < ${VIBRATION_WARN}, advertencia ${VIBRATION_WARN}–${VIBRATION_LIMIT - 1}, error ≥ ${VIBRATION_LIMIT}
- Temperatura: normal < ${TEMPERATURE_WARN}°C, advertencia ${TEMPERATURE_WARN}–${TEMPERATURE_LIMIT - 1}°C, error ≥ ${TEMPERATURE_LIMIT}°C

Lecturas:
- Vibración: {vibration} → {vibZone}
- Temperatura: {temperature}°C → {tempZone}
- Nivel de alerta a reportar: {alertLevel}

Reglas:
- Si alertLevel es advertencia: severidad "advertencia". Habla de desgaste temprano, no de parada de emergencia.
- Si alertLevel es critico: severidad "critico". Habla de falla inminente.
- Si vibZone es error o advertencia y tempZone es normal: componente_afectado "balero" (rodamiento lado acople).
- Si tempZone es error o advertencia y vibZone es normal: componente_afectado "motor" (carcasa / estator).
- Si ambos salen de normal: el de zona error gana; si empate, el más desviado.
- Cita las lecturas numéricas. No inventes sensores que esta máquina no tiene.
NO uses schemas en la respuesta.
{format_instructions}`,
  inputVariables: ["machineId", "vibration", "temperature", "vibZone", "tempZone", "alertLevel"],
  partialVariables: { format_instructions: parser.getFormatInstructions() },
});

const promptClima = new PromptTemplate({
  template: `Eres el agente de diagnóstico de RetroFit para {machineId}.
Esta máquina SOLO mide temperatura (°C) y humedad relativa (%). NO hay sensor de vibración. PROHIBIDO mencionar vibración, impacto, rodamiento, balero o eje.

Umbrales:
- Temperatura: normal < ${TEMPERATURE_WARN}°C, advertencia ${TEMPERATURE_WARN}–${TEMPERATURE_LIMIT - 1}°C, error ≥ ${TEMPERATURE_LIMIT}°C
- Humedad: normal < ${HUMIDITY_WARN}% HR, advertencia ${HUMIDITY_WARN}–${HUMIDITY_LIMIT - 1}% HR, error ≥ ${HUMIDITY_LIMIT}% HR

Lecturas:
- Temperatura: {temperature}°C → {tempZone}
- Humedad: {humidity}% HR → {humZone}
- Nivel de alerta a reportar: {alertLevel}

Reglas:
- Si alertLevel es advertencia: severidad "advertencia". Riesgo de sobrecalentamiento o condensación, todavía reversible.
- Si alertLevel es critico: severidad "critico". Riesgo de daño en aislamiento o bornes.
- Si solo temperatura sale de normal: componente_afectado "ventilador" (refrigeración).
- Si solo humedad sale de normal: componente_afectado "bornes" (caja de conexiones).
- Si ambos salen de normal: componente_afectado "clima".
- Cita las lecturas. No inventes vibración.
NO uses schemas en la respuesta.
{format_instructions}`,
  inputVariables: ["machineId", "temperature", "humidity", "tempZone", "humZone", "alertLevel"],
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

const thinking = {};
const peakArmed = {};
const lastAlertLevel = {};
const lastNormalUpdate = {};

function emitHeartbeat(machineId, telemetry) {
  const now = Date.now();
  lastNormalUpdate[machineId] = now;
  io.emit('telemetria_normal', {
    machineId,
    timestamp: new Date().toISOString(),
    telemetry
  });
  const bits = [`Temp: ${telemetry.temperature_c}°C`];
  if (telemetry.vibration_raw != null) bits.unshift(`Vib: ${telemetry.vibration_raw}`);
  if (telemetry.humidity_percent != null) bits.push(`Hum: ${telemetry.humidity_percent}%`);
  console.log(`[LATIDO] ${machineId} -> ${bits.join(" | ")}`);
}

mqttClient.on('message', async (topic, message) => {
  try {
    const rawData = message.toString();
    const datosHardware = JSON.parse(rawData);

    const machineId = datosHardware.maquina || datosHardware.machineId || "CNC-01";
    const climateOnly = machineId === "CNC-02";
    const vibration = climateOnly ? null : (datosHardware.valor || datosHardware.vibration || 0);
    const temperature = datosHardware.temperature || 35.0;
    const humidity = datosHardware.humidity || 45.0;

    const vibZone = climateOnly ? "normal" : zone(vibration, VIBRATION_WARN, VIBRATION_LIMIT);
    const tempZone = zone(temperature, TEMPERATURE_WARN, TEMPERATURE_LIMIT);
    const humZone = climateOnly ? zone(humidity, HUMIDITY_WARN, HUMIDITY_LIMIT) : "normal";
    const alertLevel = climateOnly
      ? alertFromZones(tempZone, humZone)
      : alertFromZones(vibZone, tempZone);
    const shouldAlert = alertLevel !== "normal";

    const telemetry = {
      current_amp: datosHardware.current || datosHardware.corriente || (shouldAlert ? 14.8 : 12.5),
      temperature_c: temperature,
      ...(climateOnly ? { humidity_percent: humidity } : { vibration_raw: vibration })
    };

    const now = Date.now();
    const dueHeartbeat = !lastNormalUpdate[machineId] || now - lastNormalUpdate[machineId] > HEARTBEAT_MS;
    const risingEdge = shouldAlert && RANK[alertLevel] > RANK[lastAlertLevel[machineId] || "normal"];
    if (dueHeartbeat || risingEdge) emitHeartbeat(machineId, telemetry);

    if (!shouldAlert) {
      peakArmed[machineId] = false;
      lastAlertLevel[machineId] = "normal";
      return;
    }

    if (thinking[machineId]) return;
    if (peakArmed[machineId] && RANK[alertLevel] <= RANK[lastAlertLevel[machineId] || "normal"]) return;

    peakArmed[machineId] = true;
    lastAlertLevel[machineId] = alertLevel;
    thinking[machineId] = true;
    console.log(`\n⚠️ ¡ALERTA ${alertLevel.toUpperCase()} EN ${machineId}! Invocando IA (Ollama)...`);
    const startTime = Date.now();

    try {
      const formattedPrompt = climateOnly
        ? await promptClima.format({
            machineId,
            temperature,
            humidity,
            tempZone,
            humZone,
            alertLevel
          })
        : await promptImpacto.format({
            machineId,
            vibration,
            temperature,
            vibZone,
            tempZone,
            alertLevel
          });
      const response = await llm.invoke(formattedPrompt);
      const tiempoRespuesta = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`🧠 [IA RESPONDIÓ EN ${tiempoRespuesta}s] Formateando respuesta...`);
      const ai_insight = await parser.parse(response);
      if (alertLevel === "advertencia") ai_insight.severidad = "advertencia";
      else ai_insight.severidad = "critico";

      const payload = {
        machineId,
        timestamp: new Date().toISOString(),
        telemetry,
        oee: {
          availability: alertLevel === "critico" ? 60 : 82,
          performance: alertLevel === "critico" ? 75 : 88,
          quality: 98
        },
        ai_insight
      };
      io.emit('alerta_critica', payload);
      saveDiagnosis(machineId, ai_insight, payload);
      console.log(`🚀 [ALERTA_CRITICA] ${alertLevel} enviada al frontend para ${machineId}.`);
    } catch (aiError) {
      console.error(`❌ Error crítico en la IA tras ${((Date.now() - startTime) / 1000).toFixed(2)}s:`, aiError.message);
      peakArmed[machineId] = false;
      lastAlertLevel[machineId] = "normal";
    } finally {
      thinking[machineId] = false;
      console.log(`✅ Llama libre para el siguiente pico de ${machineId}.`);
    }
  } catch (error) {
    console.error("Error procesando JSON de MQTT:", error.message);
  }
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Motor RetroFit 4.0 operativo en el puerto ${PORT}`);
});
