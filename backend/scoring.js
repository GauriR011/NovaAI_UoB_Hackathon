import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeAnswers(answers) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an AI interviewer.

Analyze the following answers and return a JSON object:
{
  "overallScore": number (0-100),
  "confidenceScore": number (0-100),
  "answerQualityScore": number (0-100),
  "summary": string
}

Answers:
${answers.map((a, i) => `Q${i + 1}: ${a}`).join("\n")}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return JSON.parse(text);
}
