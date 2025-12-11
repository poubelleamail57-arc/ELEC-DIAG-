import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, Anomaly } from "../types";
import { SYSTEM_INSTRUCTION_DIAG, SYSTEM_INSTRUCTION_ASSISTANT } from "../constants";

// Initialize Gemini Client
// WARNING: In a real production app, API calls should be proxied through a backend to hide the key.
// For this frontend-only demo, we use the env variable directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    equipmentDetected: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Liste des équipements identifiés (ex: Disjoncteur 16A, ID 30mA Type AC)"
    },
    compliant: {
      type: Type.BOOLEAN,
      description: "L'installation visible semble-t-elle conforme à première vue ?"
    },
    anomalies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          code: { type: Type.STRING, description: "Code anomalie estimé ou référence NF C 16-600" },
          description: { type: Type.STRING, description: "Description technique de l'anomalie" },
          severity: { type: Type.STRING, enum: ["DANGER", "AVERTISSEMENT", "INFO"] },
          recommendation: { type: Type.STRING, description: "Action corrective recommandée" }
        },
        required: ["description", "severity", "recommendation"]
      }
    },
    summary: {
      type: Type.STRING,
      description: "Un résumé professionnel prêt à copier-coller dans un rapport."
    },
    technicalNotes: {
      type: Type.STRING,
      description: "Détails techniques : sections estimées, marques, calibres."
    }
  },
  required: ["equipmentDetected", "compliant", "anomalies", "summary", "technicalNotes"]
};

/**
 * Analyzes an electrical installation image using Gemini 2.5 Flash.
 */
export const analyzeElectricalImage = async (base64Image: string): Promise<Omit<AnalysisResult, 'id' | 'timestamp' | 'imageUrl'>> => {
  try {
    // Remove header if present (data:image/jpeg;base64,)
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: "Analyse cette installation électrique selon la norme NF C 16-600. Détecte les anomalies et les risques." }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_DIAG,
        responseMimeType: "application/json",
        responseSchema: analysisResponseSchema,
        temperature: 0.2, // Low temperature for factual analysis
      }
    });

    const text = response.text;
    if (!text) throw new Error("Réponse vide de l'IA");

    return JSON.parse(text);

  } catch (error) {
    console.error("Erreur lors de l'analyse:", error);
    throw error;
  }
};

/**
 * Chat with the assistant about electrical norms.
 */
export const sendAssistantMessage = async (message: string, history: {role: 'user' | 'model', text: string}[] = []) => {
  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_ASSISTANT,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Erreur assistant:", error);
    throw error;
  }
};