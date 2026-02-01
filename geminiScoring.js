// geminiScoring.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function scoreInterview(transcript) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
You are an AI recruiter.

Evaluate the candidate based on the transcript below.

Return JSON only in this format:
{
  "overall_score": number (0-100),
  "confidence_score": number (0-100),
  "answer_quality_score": number (0-100),
  "brief_feedback": string
}

Transcript:
${transcript}
`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
