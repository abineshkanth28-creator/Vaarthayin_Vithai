
import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getDailyVerse = async (language: Language = Language.TAMIL) => {
  try {
    const langName = language === Language.TAMIL ? "Tamil" : "English";
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a powerful Christian Bible verse in ${langName} with its reference. Format as JSON with 'verse' and 'reference' keys. Return ONLY the JSON.`,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    if (language === Language.TAMIL) {
      return {
        verse: "கர்த்தர் என் மேய்ப்பராயிருக்கிறார்; நான் தாழ்ச்சியடையேன்.",
        reference: "சங்கீதம் 23:1"
      };
    } else {
      return {
        verse: "The Lord is my shepherd; I shall not want.",
        reference: "Psalm 23:1"
      };
    }
  }
};

export const searchMessages = async (query: string, messages: { id: string; title: string; subtitle?: string }[]) => {
  if (!query || query.length < 2) return messages.map(m => m.id);

  try {
    const messageList = messages.map(m => ({
      id: m.id,
      title: m.title,
      subtitle: m.subtitle || ""
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a search engine for a Christian church app. 
      User Query: "${query}"
      Available Messages: ${JSON.stringify(messageList)}
      
      The user might search in English, Tamil, or transliterated Tamil (e.g., "visuvasam" for "விசுவாசம்").
      Identify which messages best match the user's intent. 
      Return a JSON array of message IDs, ordered by relevance. 
      Return ONLY the JSON array.`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const matchedIds = JSON.parse(response.text);
    return Array.isArray(matchedIds) ? matchedIds : [];
  } catch (error) {
    console.error("Search AI Error:", error);
    // Fallback to simple filtering if AI fails
    return messages
      .filter(m => 
        m.title.toLowerCase().includes(query.toLowerCase()) || 
        m.subtitle?.toLowerCase().includes(query.toLowerCase())
      )
      .map(m => m.id);
  }
};
