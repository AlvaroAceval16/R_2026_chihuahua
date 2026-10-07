import express from 'express';
import cors from 'cors';
import { Ollama } from '@langchain/community/llms/ollama';
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

const app = express();
app.use(express.json());
app.use(cors());

// 1. Configurar Llama 3.1 local en modo JSON
const llm = new Ollama({
  baseUrl: "http://localhost:11434",
  model: "llama3.1",
  temperature: 0.1, // Baja temperatura para respuestas lógicas y predecibles
  format: "json",
});

// 2. Definir el esquema Zod (Incluyendo el lenguaje natural)
const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    severidad: z.enum(["bajo", "medio", "alto", "critico"]),
    componente_afectado: z.string().describe("Ej: balero_frontal, eje_motor. Útil para el Gemelo Digital 3D"),
    diagnostico_tecnico: z.string().describe("Causa raíz técnica estructurada"),
    conclusion_natural: z.string().describe("Explicación conversacional, urgente y directa para el operador en español. Ej: '¡Atención! El motor presenta una vibración atípica.'"),
    accion_inmediata: z.string().describe("Instrucción clara de lo que debe hacer el operador a continuación")
  })
);

// 3. Plantilla del Prompt optimizada para Llama 3.1
const prompt = new PromptTemplate({
  template: `Eres el sistema de inteligencia del proyecto 'RetroFit 4.0', analizando maquinaria industrial.
  Se ha detectado una anomalía en la máquina {machineId}.
  Datos actuales de los sensores:
  - Vibración: {vibration} G (Umbral normal: < 2.0 G)
  - Corriente: {current} Amp (Umbral normal: < 12.0 Amp)
  - Temperatura: {temperature} °C (Umbral normal: < 65 °C)
  
  Evalúa estos datos y genera un diagnóstico preciso en español.
  \n{format_instructions}`,
  inputVariables: ["machineId", "vibration", "current", "temperature"],
  partialVariables: { format_instructions: parser.getFormatInstructions() },
});

// 4. Endpoint Principal
app.post('/api/analizar', async (req, res) => {
  try {
    // Recibimos los datos físicos del Arduino/Raspberry
    const { machineId, vibration, current, temperature } = req.body;
    console.log(`[⚡ TRIGGER] Analizando ${machineId} | V: ${vibration} | C: ${current} | T: ${temperature}`);
    
    // Ejecutamos el agente de LangChain
    const formattedPrompt = await prompt.format({ machineId, vibration, current, temperature });
    const response = await llm.invoke(formattedPrompt);
    const ai_insight = await parser.parse(response);

    // 5. ENSAMBLAJE DEL MAESTRO JSON PARA EL DASHBOARD
    // Aquí juntamos la telemetría real con métricas Lean calculadas/simuladas
    // y la conclusión de la IA, todo en un solo paquete.
    const dashboardPayload = {
      machineId: machineId,
      timestamp: new Date().toISOString(),
      telemetry: {
        vibration_g: vibration,
        current_amp: current,
        temperature_c: temperature
      },
      oee: {
        availability: ai_insight.severidad === 'critico' ? 60 : 92, // Baja si es crítico
        performance: 75,
        quality: 98
      },
      lean_mudas: {
        defectos: ai_insight.severidad === 'alto' ? 3 : 0,
        sobreprocesamiento: 15,
        esperas: 10
      },
      ai_insight: ai_insight // Inyectamos el JSON de Llama 3.1 directamente aquí
    };

    console.log("Payload enviado al frontend:", JSON.stringify(dashboardPayload, null, 2));
    res.status(200).json(dashboardPayload);

  } catch (error) {
    console.error("Error en el agente:", error);
    res.status(500).json({ error: "Fallo en la inferencia del modelo" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🤖 Agente RetroFit 4.0 corriendo con Llama 3.1 en http://localhost:${PORT}`);
});