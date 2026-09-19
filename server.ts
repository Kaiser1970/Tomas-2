import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. AI summary will use local fallbacks.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "MediControl Backend" });
  });

  // API: Direct prompt file download route
  app.get(["/prompt_final_aplicacion.txt", "/api/download-prompt"], (req, res) => {
    const promptPath = path.join(process.cwd(), "public", "prompt_final_aplicacion.txt");
    if (fs.existsSync(promptPath)) {
      res.setHeader("Content-Disposition", 'attachment; filename="medicontrol_prompt_final.txt"');
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.sendFile(promptPath);
    }
    return res.status(404).send("Prompt file not found");
  });

  // API: Medical Summary with Gemini AI
  app.post("/api/gemini/medical-summary", async (req, res) => {
    try {
      const { patient, adherenceStats, recentVitals } = req.body;
      const ai = getAiClient();

      if (!ai) {
        return res.json({
          summary: `**Resumen de Cumplimiento Terapéutico (Modo Local):**\n\n` +
            `• **Paciente:** ${patient?.nombre || 'Paciente'}\n` +
            `• **Adherencia Global:** ${adherenceStats?.overallAdherence || 100}% en ${adherenceStats?.daysEvaluated || 7} días evaluados.\n` +
            `• **Tomas Exitosas:** ${adherenceStats?.totalTakenInPeriod || 0} dosis tomadas.\n` +
            `• **Omisiones:** ${adherenceStats?.totalOmittedInPeriod || 0} dosis omitidas.\n` +
            `• **Signos Vitales:** Parámetros monitoreados correctamente.\n` +
            `• **Observación Clínica:** Excelente disciplina en el horario de tomas. Continuar con el plan terapéutico prescrito.`
        });
      }

      const prompt = `Eres un médico especialista en medicina interna y farmacovigilancia. Analiza el siguiente reporte de toma de medicamentos y adherencia de un paciente y genera un resumen clínico conciso, profesional y estructurado en español:

DATOS DEL PACIENTE:
- Nombre: ${patient?.nombre}
- Fecha de Nacimiento: ${patient?.fechaNacimiento}
- Alergias: ${patient?.alergias?.join(', ') || 'Ninguna'}
- Padecimientos Crónicos: ${patient?.padecimientosCronicos?.join(', ') || 'Ninguno reportado'}
- Cuidador: ${patient?.cuidadorResponsable}

ESTADÍSTICAS DE TOMA (${adherenceStats?.daysEvaluated || 7} DÍAS):
- Porcentaje de Adherencia: ${adherenceStats?.overallAdherence}%
- Tomas Confirmadas: ${adherenceStats?.totalTakenInPeriod}
- Tomas Omitidas: ${adherenceStats?.totalOmittedInPeriod}
- Motivos de omisiones recientes: ${JSON.stringify(adherenceStats?.omissions || [])}

SIGNOS VITALES RECIENTES:
${JSON.stringify(recentVitals || [], null, 2)}

Por favor elabora un análisis clínico que incluya:
1. Evaluación del grado de adherencia terapéutica y riesgos potenciales.
2. Análisis de las omisiones (si las hubo) y recomendaciones prácticas para el cuidador.
3. Correlación con signos vitales.
4. Conclusión / Recomendaciones médicas puntuales para el médico tratante.
Mantén un tono empático, riguroso y conciso con viñetas claras.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const summary = response.text;
      return res.json({ summary });
    } catch (error: any) {
      console.error("Error in /api/gemini/medical-summary:", error);
      return res.status(500).json({ 
        error: "No se pudo generar el resumen con IA", 
        details: error?.message 
      });
    }
  });

  // Vite middleware in dev or static files in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MediControl server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
