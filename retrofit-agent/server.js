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
    const rawData = message.toString();
    const datosHardware = JSON.parse(rawData);
    
    const machineId = datosHardware.maquina || datosHardware.machineId || "CNC-01";
    const vibration = datosHardware.valor || datosHardware.vibration || 0;
    
    // 🔥 RAYOS X 1: Imprimir cada latido para verificar qué lee Node.js
    console.log(`[LATIDO] ${machineId} -> V: ${vibration} | Candado: ${locks[machineId] ? 'CERRADO 🔴' : 'ABIERTO 🟢'}`);

    // Si la máquina actual ya se está analizando, ignoramos el mensaje
    if (locks[machineId]) return;

    if (vibration >= 800) {
      // Cierre de compuerta exclusivo para esta máquina
      locks[machineId] = true;
      
      const current = 18.5; // Simulación de pico
      const temperature = datosHardware.temperature || 45.0; 
      const humidity = datosHardware.humidity || 50.0; 
      
      console.log(`\n⚠️ ¡IMPACTO EN ${machineId} (${vibration})! Invocando IA (Ollama)...`);
      
      // 🔥 RAYOS X 2: Cronometrar cuánto tarda Llama 3.1 en responder
      const startTime = Date.now();
      
      try {
        const formattedPrompt = await prompt.format({ machineId, vibration, current, temperature });
        
        // Invocación del modelo local
        const response = await llm.invoke(formattedPrompt);
        
        const tiempoRespuesta = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`🧠 [IA RESPONDIÓ EN ${tiempoRespuesta}s] Formateando respuesta...`);
        
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

        io.emit('alerta_critica', dashboardPayload);
        console.log(`🚀 Alerta enviada al frontend con éxito.`);
        
      } catch (aiError) {
        // 🔥 RAYOS X 3: Capturar si la IA escupe texto basura o si falla la red
        console.error(`❌ Error crítico en la IA tras ${((Date.now() - startTime) / 1000).toFixed(2)}s:`, aiError.message);
      } finally {
        // Apertura del candado de esta máquina
        locks[machineId] = false;
        console.log(`✅ Candado de ${machineId} ABIERTO 🟢 de nuevo.`);
      }
    }
  } catch (error) {
    console.error("Error procesando JSON de MQTT:", error.message);
  }
});

// Arrancamos en el puerto 4000
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Motor RetroFit 4.0 operativo en el puerto ${PORT}`);
});