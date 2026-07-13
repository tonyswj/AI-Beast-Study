import { GoogleGenAI } from "@google/genai";
import { Beast, Subject, LearningPathNode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiService = {
  /**
   * Generates a personalized learning path recommendation based on beast levels and subject.
   */
  async generateLearningPathTips(subject: Subject, beast: Beast): Promise<string> {
    const prompt = `
      You are a wise study beast mentor. 
      The user is studying ${subject}. 
      Their beast is at level ${beast.level} with ${beast.xp} XP.
      Provide 3 short, encouraging study tips or "next steps" for this subject to help them level up their beast.
      Keep it under 100 words.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      return response.text || "继续努力，你的灵兽正在变强！";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "灵兽感应到了你的勤奋，继续加油吧！";
    }
  },

  /**
   * Chat with the AI Companion (represented by a beast).
   */
  async chatWithCompanion(
    message: string, 
    beast: Beast, 
    beastName: string,
    history: { role: 'user' | 'assistant', content: string }[]
  ): Promise<string> {
    const systemInstruction = `
      You are ${beastName}, a magical study beast for the subject ${beast.subject}. 
      Your personality is encouraging, slightly mystical, and very focused on helping the user learn.
      The user is currently studying. 
      Respond to their message in character. 
      Keep responses concise and helpful.
    `;

    try {
      const chatHistory = history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...chatHistory.map(h => ({ role: h.role, parts: h.parts })),
          { role: 'user', parts: [{ text: message }] }
        ] as any,
        config: {
          systemInstruction
        }
      });

      return response.text || "呜呜... (灵兽似乎在思考)";
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      return "吼！(灵兽打了个哈欠，似乎累了)";
    }
  }
};
