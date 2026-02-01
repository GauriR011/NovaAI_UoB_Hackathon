import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import twilio from "twilio";
import dotenv from "dotenv";
import { analyzeAnswers } from "./scoring.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Prewritten questions
const QUESTIONS = [
  "Can you briefly introduce yourself?",
  "Why are you interested in this role?"
];

// Store answers in-memory (hackathon-style)
let answers = [];

/**
 * Start call
 */
app.post("/start-call", async (req, res) => {
  const { phoneNumber } = req.body;

  await client.calls.create({
    to: phoneNumber,
    from: process.env.TWILIO_PHONE_NUMBER,
    url: `${process.env.PUBLIC_URL}/voice/start`
  });

  res.json({ success: true });
});

/**
 * Twilio Voice Flow – Intro + Q1
 */
app.post("/voice/start", (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();

  twiml.say("Hello. This is the Space 42 AI screening assistant.");
  twiml.say(QUESTIONS[0]);

  twiml.record({
    action: "/voice/q2",
    transcribe: true,
    maxLength: 30
  });

  res.type("text/xml").send(twiml.toString());
});

/**
 * Question 2
 */
app.post("/voice/q2", (req, res) => {
  answers.push(req.body.TranscriptionText);

  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say(QUESTIONS[1]);

  twiml.record({
    action: "/voice/end",
    transcribe: true,
    maxLength: 30
  });

  res.type("text/xml").send(twiml.toString());
});

/**
 * End Call + Score
 */
app.post("/voice/end", async (req, res) => {
  answers.push(req.body.TranscriptionText);

  const score = await analyzeAnswers(answers);

  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say("Thank you. This concludes the screening. Goodbye.");
  twiml.hangup();

  console.log("Final Score:", score);

  answers = []; // reset

  res.type("text/xml").send(twiml.toString());
});

app.listen(process.env.PORT, () =>
  console.log(`Backend running on port ${process.env.PORT}`)
);
