import { GoogleGenAI } from "@google/genai";

export const generateCozyMessage = async (
  score: number,
  treats: number,
  theme: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API Key missing for Gemini Service");
    return "Great job, Cookie Monster! (Add API Key for more stories)";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are the narrator for a cute video game called "Cookie's Great Escape" about a Cavalier King Charles Spaniel.
    
    The dog just finished a run with these stats:
    - Distance Score: ${Math.floor(score)}
    - Treats Collected: ${treats}
    - Last Location: ${theme}
    
    Write a VERY short (max 1 sentence), cozy, cute, and encouraging message about what Cookie did. 
    Example: "Cookie chased three butterflies in the park and found a delicious bone!"
    Tone: Whimsical, supportive, adorable.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Cookie is wagging his tail happily!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Cookie is resting by the fireplace.";
  }
};