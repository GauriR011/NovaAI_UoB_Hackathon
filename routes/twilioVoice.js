// routes/twilioVoice.js
export function twilioVoice(req, res) {
  const twiml = `
    <Response>
      <Say voice="Polly.Joanna">
        Hi, I am an AI recruiting assistant.
        I will ask you two short questions.
      </Say>

      <Gather input="speech" action="/twilio/q1" timeout="5">
        <Say>
          Question one. Can you briefly introduce yourself?
        </Say>
      </Gather>
    </Response>
  `;

  res.type("text/xml").send(twiml);
}

export function questionTwo(req, res) {
  const answer1 = req.body.SpeechResult;

  // store answer1 in DB

  const twiml = `
    <Response>
      <Gather input="speech" action="/twilio/end" timeout="5">
        <Say>
          Question two.
          Why are you interested in this role?
        </Say>
      </Gather>
    </Response>
  `;

  res.type("text/xml").send(twiml);
}

import { scoreInterview } from "./geminiScoring.js";

export async function endCall(req, res) {
  const answer2 = req.body.SpeechResult;

  // fetch answer1 from DB
  const transcript = `
  Q1: Introduce yourself
  A1: ${answer1}

  Q2: Why this role?
  A2: ${answer2}
  `;

  const scores = await scoreInterview(transcript);

  // store scores in DB

  const twiml = `
    <Response>
      <Say>
        Thank you. Your screening is complete.
        Have a great day.
      </Say>
      <Hangup/>
    </Response>
  `;

  res.type("text/xml").send(twiml);
}
