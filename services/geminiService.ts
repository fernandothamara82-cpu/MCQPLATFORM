import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

export const extractMCQsFromImages = async (
  paperImages: string[], 
  markingSchemeImages: string[] = []
): Promise<Question[]> => {
  // Initialize AI inside the function to ensure it uses the latest environment variables
// @ts-ignore - bypassing type check to allow baseUrl for OpenRouter
// @ts-ignore - bypassing type check for OpenRouter proxy
// 1. Point the SDK to your Netlify Proxy
// @ts-ignore
const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || '', 
  // This tells the SDK: "Go to my site's tunnel, not Google"
  baseUrl: window.location.origin + "/api/ai" 
} as any);

// 2. Use the OpenRouter-specific Model Name
// Note: OpenRouter names for Gemini 3 differ from Google's names
const model = ai.getGenerativeModel({ 
  model: "google/gemini-3-flash-preview:free" 
});
  
  const promptText = `
    Analyze the provided images of a Physics or Chemistry exam paper.
    Convert them into a clean JSON array of MCQ questions.

    CRITICAL INSTRUCTIONS:
    1. SINHALA SUPPORT: If the paper is in Sinhala, preserve all characters exactly as they appear.
    2. SCIENTIFIC NOTATION: Use HTML tags for scientific symbols (e.g., H<sub>2</sub>O, 10<sup>5</sup>).
    3. JSON STRUCTURE: Return ONLY the raw JSON array. Do not include markdown blocks.
    4. OPTIONAL DIAGRAMS: If a question has a figure/diagram, include its bounding box.
    5. COORDINATES: Bounding box format is [ymin, xmin, ymax, xmax] in 0-1000 scale.
  `;

  const prepareParts = (paper: string[], marking: string[]) => {
    const parts: any[] = [];
    paper.forEach((img, i) => {
      parts.push({ text: `PAGE_${i}:` });
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: img.split(',')[1] || img } });
    });
    if (marking.length > 0) {
      parts.push({ text: "MARKING_SCHEME_REFERENCE:" });
      marking.forEach((img) => {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: img.split(',')[1] || img } });
      });
    }
    parts.push({ text: promptText });
    return parts;
  };

  const parts = prepareParts(paperImages, markingSchemeImages);

  const result = await ai.models.generateContent({
model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            questionNumber: { type: Type.STRING },
            questionText: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswerIndices: { type: Type.ARRAY, items: { type: Type.INTEGER } },
            explanation: { type: Type.STRING },
            subject: { type: Type.STRING, enum: ['Physics', 'Chemistry', 'General'] },
            hasVisualElements: { type: Type.BOOLEAN },
            diagram: {
              type: Type.OBJECT,
              properties: {
                sourceImageIndex: { type: Type.INTEGER },
                boundingBox: { type: Type.ARRAY, items: { type: Type.NUMBER } }
              }
            }
          },
          required: ["questionNumber", "questionText", "options", "correctAnswerIndices", "explanation", "subject", "hasVisualElements"]
        }
      }
    }
  });

  const text = result.text?.trim();
  if (!text) throw new Error("AI returned an empty response.");
  
  try {
    const cleanJson = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const parsed: any[] = JSON.parse(cleanJson);
    
    return parsed.map((item, index) => ({
      ...item,
      id: `q-${Date.now()}-${index}`
    }));
  } catch (e: any) {
    console.error("Parse Error:", text);
    throw new Error(`Failed to read the AI results. Please try with 1-2 pages first.`);
  }
};
