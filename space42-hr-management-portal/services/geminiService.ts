
import { GoogleGenAI, Type } from "@google/genai";
import { Candidate, Message } from "../types";

// Always use a named parameter for apiKey and use the process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeCandidate = async (candidate: Candidate, jobRequirement: string) => {
  const prompt = `
    Analyze this candidate for the role: ${jobRequirement}
    Candidate Name: ${candidate.name}
    Current Role: ${candidate.role}
    AI Summary: ${candidate.summary}

    Provide a detailed evaluation:
    1. Why are they a good fit?
    2. What are the potential gaps?
    3. Suggested interview questions.
    Return the response as a clear structured summary.
  `;

  try {
    // Correct usage of generateContent with both model and prompt.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error generating analysis. Please try again.";
  }
};

export const getCoPilotResponse = async (history: Message[], userInput: string) => {
  const systemInstruction = `
    You are Space42 AI Co-pilot, an expert HR assistant. 
    You help HR managers analyze candidates, draft interview invites, and manage the recruitment pipeline.
    You are professional, concise, and helpful. 
    You have access to candidate data (assume a pool of top-tier talent).
    Always maintain transparency in why you suggest specific actions.
  `;

  // Construct history parts as Content objects for generateContent.
  const contents = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  // Append the latest user message.
  contents.push({ role: 'user', parts: [{ text: userInput }] });

  try {
    // Correctly query GenAI with model name and history contents.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: { systemInstruction }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Co-pilot Error:", error);
    return "I'm having trouble connecting right now. How else can I assist with your recruitment needs?";
  }
};
