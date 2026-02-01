import { useState } from "react";

function App() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const startCall = async () => {
    setLoading(true);
    await fetch("http://localhost:3000/start-call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: phone })
    });
    setLoading(false);
    alert("You will receive a call shortly!");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>AI Phone Screening</h1>
      <p>Click below to start your phone screening now.</p>

      <input
        placeholder="+9715xxxxxxx"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <br /><br />

      <button onClick={startCall} disabled={loading}>
        {loading ? "Calling..." : "Start Phone Screening"}
      </button>
    </div>
  );
}

export default App;
