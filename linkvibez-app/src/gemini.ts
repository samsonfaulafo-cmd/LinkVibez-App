import { GoogleGenerativeAI } from "@google/generative-ai";

// This pulls the NEW key you just added to .env
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function getVibeCheck(profileBio: string) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    // 💡 COPY AND PASTE YOUR SYSTEM INSTRUCTIONS FROM AI STUDIO HERE:
    systemInstruction: "You are the LinkVibez AI Wingman. Analyze the vibe of this bio...", 
  });

  const prompt = `Profile Bio: ${profileBio}. Give me a 1-sentence cheeky chemistry analysis.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("AI Error:", error);
    return "Vibez are loading...";
  }
}