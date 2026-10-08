import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import mqtt from 'mqtt';
import { Ollama } from '@langchain/ollama';
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

// 1. Inicializar Express y WebSockets (Socket.io)
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// 2. Configurar IA (Llama 3.1) y Zod
const llm = new Ollama({ 
  baseUrl: "http://localhost:11434", 
  model: "llama3.1:8b", 
  temperature: 0.1, 
  format: "json" 
});

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    severidad: z.enum(["bajo", "medio", "alto", "critico", "crítico"]),
    componente_afectado: z.string().describe("Ej: balero_frontal, eje_motor. Útil para el Gemelo Digital 3D"),
    diagnostico_tecnico: z.string().describe("Causa raíz técnica estructurada"),
    conclusion_natural: z.string().describe("Explicación conversacional, urgente y directa para el operador en español."),
    accion_inmediata: z.string().describe("Instrucción clara de lo que debe hacer el operador a continuación")
  })
);

const prompt = new PromptTemplate({
  template: `Evalúa la maquinaria {machineId}. Nivel de impacto/vibración: {vibration} (Escala 0-1023, Normal < 800). Corriente: {current}A (Normal < 12). Temp: {temperature}C (Normal < 65). Genera un diagnóstico técnico industrial en español. NO uses schemas en la respuesta.\n{format_instructions}`,
  inputVariables: ["machineId", "vibration", "current", "temperature"],
  partialVariables: { format_instructions: parser.getFormatInstructions() },
});

// 3. Conexión WebSocket con el Frontend
io.on('connection', (socket) => {
  console.log('💻 Dashboard Frontend conectado al WebSocket');
});

// 4. Conexión MQTT (Escuchando a la Raspberry/Arduino)
const mqttClient = mqtt.connect('mqtt://localhost'); 

mqttClient.on('connect', () => {
  console.log('📡 Conectado al Broker Mosquitto');
  mqttClient.subscribe('retrofit/telemetria', () => {
    console.log('👂 Escuchando el topic: retrofit/telemetria');
  });
});

// 5. El Cerebro: Diccionario de candados por máquina
const locks = {}; 

mqttClient.on('message', async (topic, message) => {
  try {
    const datosHardware = JSON.parse(message.toString());
    
    // Mapeo flexible de la llave primaria
    const machineId = datosHardware.maquina || datosHardware.machineId || "CNC-01";
    
    // BLOQUEO INDIVIDUAL: Ignorar tráfico solo si esta máquina específica está en análisis
    if (locks[machineId]) return;

    const vibration = datosHardware.valor || datosHardware.vibration || 0;
    
    if (vibration >= 800) {
      // Cierre de compuerta exclusivo para esta máquina
      locks[machineId] = true;
      
      const current = 18.5; // Corriente simulada por pico de vibración
      const temperature = datosHardware.temperature || 45.0; // Lectura real del Arduino o fallback
      const humidity = datosHardware.humidity || 50.0; // Lectura real del DHT11 o fallback
      
      console.log(`\n⚠️ ¡ALTO IMPACTO DETECTADO EN ${machineId} (${vibration})! Invocando IA...`);
      
      try {
        const formattedPrompt = await prompt.format({ machineId, vibration, current, temperature });
        const response = await llm.invoke(formattedPrompt);
        const ai_insight = await parser.parse(response);

        const dashboardPayload = {
          machineId, 
          timestamp: new Date().toISOString(),
          telemetry: { 
            vibration_raw: vibration, 
            current_amp: current, 
            temperature_c: temperature,
            humidity_percent: humidity
          },
          oee: { 
            availability: (ai_insight.severidad === 'critico' || ai_insight.severidad === 'crítico') ? 60 : 92, 
            performance: 75, 
            quality: 98 
          },
          ai_insight
        };

        // EMPUJAR DATOS AL FRONTEND AL INSTANTE
        io.emit('alerta_critica', dashboardPayload);
        
        console.log(`🚀 JSON