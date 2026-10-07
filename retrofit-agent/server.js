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

// 5. El Cerebro: Qué hacer cuando llega un dato físico
mqttClient.on('message', async (topic, message) => {
  try {
    const datosHardware = JSON.parse(message.toString());
    const { machineId, vibration, current, temperature } = datosHardware;
    
    console.log(`\n[⚙️ SENSOR] Dato recibido de ${machineId} -> Vibración Cruda: ${vibration} | C:${current} | T:${temperature}`);

    // NUEVA REGLA: Disparar la IA SOLO si la vibración (amplitud del KY-002) es >= 800
    if (vibration >= 800) {
      console.log("⚠️ ¡ALTO IMPACTO DETECTADO (>= 800)! Invocando IA...");
      
      const formattedPrompt = await prompt.format({ machineId, vibration, current, temperature });
      const response = await llm.invoke(formattedPrompt);
      const ai_insight = await parser.parse(response);

      const dashboardPayload = {
        machineId, 
        timestamp: new Date().toISOString(),
        telemetry: { 
          vibration_raw: vibration, // Mandamos el valor crudo al front
          current_amp: current, 
          temperature_c: temperature 
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
      
      // MOSTRAR EN LA TERMINAL PARA VERIFICAR
      console.log("🚀 JSON empujado al Frontend. Resultado maestro:");
      console.log(JSON.stringify(dashboardPayload, null, 2));
      console.log("--------------------------------------------------");
    }
  } catch (error) {
    console.error("Error procesando mensaje MQTT o IA:", error.message);
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Motor RetroFit 4.0 operativo en el puerto ${PORT}`);
});