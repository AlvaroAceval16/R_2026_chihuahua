import express from 'express';
import cors from 'cors';
import { Ollama } from '@langchain/ollama';
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

const app = express();
app.use(express.json());
app.use(cors());

// 1. Configurar Llama 3.1 local en modo JSON
const llm = new Ollama({
  baseUrl: "http://localhost:11434",
  model: "llama3.1:8b", // El nombre exacto que tienes instalado
  temperature: 0.1,
  format: "json",
});

// 2. Definir el esquema Zod (Aceptando acentos para evitar crasheos)
const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    severidad: z.enum(["bajo", "medio", "alto", "critico", "crítico"]), // Añadimos la opción con tilde
    componente_afectado: z.string().describe("Ej: balero_frontal, eje_motor. Útil para el Gemelo Digital 3D"),
    diagnostico_tecnico: z.string().describe("Causa raíz técnica estructurada"),
    conclusion_natural: z.string().describe("Explicación conversacional, urgente y directa para el operador en español."),
    accion_inmediata: z.string().describe("Instrucción clara de lo que debe hacer el operador a continuación")
  })
);

// 3. Plantilla del Prompt ultra-estricta
const prompt = new PromptTemplate({
  template: `Eres el sistema de inteligencia del proyecto 'RetroFit 4.0', analizando maquinaria industrial.
  Se ha detectado una anomalía en la máquina {machineId}.
  Datos actuales de los sensores:
  - Vibración: {vibration} G (Umbral normal: < 2.0 G)
  - Corriente: {current} Amp (Umbral normal: < 12.0 Amp)
  - Temperatura: {temperature} °C (Umbral normal: < 65 °C)
  
  REGLAS ESTRICTAS:
  1. Evalúa los datos y genera un diagnóstico en español.
  2. RESPONDE ÚNICA Y EXCLUSIVAMENTE con los valores solicitados. NO incluyas propiedades de "$schema" ni repitas el esquema en tu respuesta.
  
  \n{format_instructions}`,
  inputVariables: ["machineId", "vibration", "current", "temperature"],
  partialVariables: { format_instructions: parser.getFormatInstructions() },
});

// 4. Endpoint Principal
app.post('/api/analizar', async (req, res) => {
  try {
    const { machineId, vibration, current, temperature } = req.body;
    console.log(`[⚡ TRIGGER] Analizando ${machineId} | V: ${vibration} | C: ${current} | T: ${temperature}`);
    
    // Ejecutamos el agente de LangChain
    const formattedPrompt = await prompt.format({ machineId, vibration, current, temperature });
    const response = await llm.invoke(formattedPrompt);
    const ai_insight = await parser.parse(response);

    // 5. ENSAMBLAJE DEL MAESTRO JSON PARA EL DASHBOARD
    const dashboardPayload = {
      machineId: machineId,
      timestamp: new Date().toISOString(),
      telemetry: {
        vibration_g: vibration,
        current_amp: current,
        temperature_c: temperature
      },
      oee: {
        availability: (ai_insight.severidad === 'critico' || ai_insight.severidad === 'crítico') ? 60 : 92,
        performance: 75,
        quality: 98
      },
      lean_mudas: {
        defectos: (ai_insight.severidad === 'alto') ? 3 : 0,
        sobreprocesamiento: 15,
        esperas: 10
      },
      ai_insight: ai_insight 
    };

    console.log("Payload limpio enviado al frontend:\n", JSON.stringify(dashboardPayload, null, 2));
    res.status(200).json(dashboardPayload);

  } catch (error) {
    console.error("Error en el agente:", error);
    res.status(500).json({ error: "Fallo en la inferencia del modelo" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🤖 Agente RetroFit 4.0 corriendo en http://localhost:${PORT}`);
});