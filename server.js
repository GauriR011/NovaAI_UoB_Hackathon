// const express = require('express');
// const twilio = require('twilio');
// const { GoogleGenerativeAI } = require('@google/generative-ai');  // Changed
// const { v4: uuidv4 } = require('uuid');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cors());
// app.use(express.json());

// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);  // Changed
// const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });  // Changed

// const screenings = new Map(); // sessionId -> {phone, responses: [], results}

// app.post('/voice', (req, res) => {
//   const sessionId = req.query.sessionId;
//   const session = screenings.get(sessionId);
//   if (!session) return res.status(404).send('Session not found');

//   let twiml = '<Response><Say>Hello, this is the AI screening agent. ';
//   if (session.responses.length === 0) {
//     twiml += 'Question 1: Tell me about your relevant experience.</Say><Gather input="speech" action="/voice?sessionId=' + sessionId + '" speechTimeout="auto" />';
//   } else if (session.responses.length === 1) {
//     twiml += 'Question 2: Why do you want this role?</Say><Gather input="speech" action="/voice?sessionId=' + sessionId + '" speechTimeout="auto" />';
//   } else {
//     twiml += 'Thank you. Screening complete.</Say><Say>Goodbye.</Say></Response>';
//     // Trigger scoring with Gemini
//     scoreScreening(sessionId);
//     return res.type('text/xml').send(twiml);
//   }
//   session.responses.push(req.body.RecordingUrl || 'No response');
//   res.type('text/xml').send(twiml);
// });

// async function scoreScreening(sessionId) {
//   const session = screenings.get(sessionId);
//   const transcript = session.responses.join('\n');

//   const prompt = `Analyze this screening transcript. Score:
// - Confidence (0-100): based on speech fluency, pauses, tone indicators.
// - Answer Quality (0-100): relevance, depth for 2 questions.
// - Overall (average, 0-100).
// Respond ONLY with valid JSON: {"confidence": 85, "quality": 90, "overall": 87, "feedback": "Strong answers, confident delivery."}

// Transcript: ${transcript}`;

//   try {
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();
    
//     // Extract JSON from response (Gemini sometimes adds extra text)
//     const jsonMatch = text.match(/\{.*\}/s);
//     const scores = jsonMatch ? JSON.parse(jsonMatch[0]) : { confidence: 0, quality: 0, overall: 0, feedback: 'Error parsing response' };
    
//     session.results = scores;
//     console.log(`Gemini scores for ${session.phone}:`, scores);
//   } catch (error) {
//     console.error('Gemini scoring error:', error);
//     session.results = { confidence: 0, quality: 0, overall: 0, feedback: 'Scoring failed' };
//   }
// }

// app.post('/generate-link', (req, res) => {
//   const { phone } = req.body;
//   const sessionId = uuidv4();
//   screenings.set(sessionId, { phone, responses: [] });

//   const callUrl = `http://your-ngrok-url/voice?sessionId=${sessionId}`;
//   client.calls.create({
//     url: callUrl,
//     to: phone,
//     from: process.env.TWILIO_PHONE_NUMBER
//   }).then(call => console.log(call.sid));

//   res.json({ link: `http://your-frontend-url/screen?sessionId=${sessionId}` });
// });

// app.get('/results/:sessionId', (req, res) => {
//   const session = screenings.get(req.params.sessionId);
//   res.json(session?.results || { error: 'Not found' });
// });

// app.listen(process.env.PORT || 3000, () => console.log('Server running with Gemini'));


// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(bodyParser.json());

app.listen(3000, () => console.log("Server running on port 3000"));
