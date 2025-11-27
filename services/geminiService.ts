import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Ensure this is set in your environment
const ai = new GoogleGenAI({ apiKey });

export const generateCompanyContent = async (
  name: string,
  industry: string
): Promise<{ vision: string; mission: string; about: string } | null> => {
  if (!name || !industry) return null;

  try {
    const prompt = `Generate a professional corporate profile content for a company named "${name}" in the "${industry}" industry. 
    Provide a Vision statement, a Mission statement, and a short About Us paragraph (approx 50 words).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vision: { type: Type.STRING },
            mission: { type: Type.STRING },
            about: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const generateSectionContent = async (section: string, context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, professional "${section}" section for a company profile. Context: ${context}. Keep it under 40 words.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error", error);
    return "Content generation failed. Please try again.";
  }
}