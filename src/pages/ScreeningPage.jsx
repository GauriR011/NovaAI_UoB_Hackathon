// src/pages/ScreeningPage.jsx
import { useParams } from "react-router-dom";
import { useState } from "react";

export default function ScreeningPage() {
  const { sessionId } = useParams();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const startCall = async () => {
    setLoading(true);
    await fetch("/api/start-call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, phone }),
    });
    setLoading(false);
    alert("📞 You will receive a call shortly!");
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 40 }}>
      <h2>AI Phone Screening</h2>
      <p>This will take about 3 minutes.</p>

      <input
        placeholder="Your phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ width: "100%", padding: 10 }}
      />

      <button
        onClick={startCall}
        disabled={loading}
        style={{ marginTop: 20, padding: 12 }}
      >
        {loading ? "Calling..." : "Have phone screening call now"}
      </button>
    </div>
  );
}
