// routes/startCall.js
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);

export async function startCall(req, res) {
  const { phone, sessionId } = req.body;

  await client.calls.create({
    to: phone,
    from: process.env.TWILIO_PHONE,
    url: `${process.env.BASE_URL}/twilio/voice?sessionId=${sessionId}`,
  });

  res.send({ success: true });
}
