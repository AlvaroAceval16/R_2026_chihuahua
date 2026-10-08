import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import mqtt from 'mqtt';
import { Ollama } from '@langchain/ollama';
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

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

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Motor RetroFit 4.0 operativo en el puerto ${PORT}`);
});