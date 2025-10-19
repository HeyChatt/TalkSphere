
import { GoogleGenAI, Chat } from "@google/genai";

let ai: GoogleGenAI | null = null;
let chatInstances: Map<string, Chat> = new Map();

const getAI = () => {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const getGeminiResponse = async (prompt: string, userId: string): Promise<string> => {
  try {
    const genAI = getAI();
    let chat = chatInstances.get(userId);

    if (!chat) {
      chat = genAI.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: 'You are a helpful and friendly chat bot integrated into a chat application. Keep your responses concise and conversational.',
        },
      });
      chatInstances.set(userId, chat);
    }
    
    const result = await chat.sendMessage({ message: prompt });
    return result.text;
  } catch (error) {
    console.error("Error getting response from Gemini:", error);
    return "Sorry, I'm having trouble connecting to my brain right now. Please try again later.";
  }
};
