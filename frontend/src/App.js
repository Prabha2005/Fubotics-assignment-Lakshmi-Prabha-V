import React, { useState, useEffect } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const API = "https://fubotics-assignment-lakshmi-prabha-v.onrender.com";

  // ⬇ FETCH HISTORY ON PAGE LOAD
  useEffect(() => {
    fetch(`${API}/api/messages`)
      .then((r) => r.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  // ⬇ SEND MESSAGE TO BACKEND
  async function sendMessage() {
    if (!text.trim()) return;

    const body = { author: "user", text };

    const res = await fetch(`${API}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    // update messages list
    setMessages((prev) => [...prev, data.user, data.ai]);
    setText("");
  }

  return (
    <div style={{ width: "60%", margin: "auto", padding: 20 }}>
      <h2>Mini AI Chat</h2>

      <div style={{
        border: "1px solid #ccc",
        height: 350,
        overflowY: "auto",
        padding: 10
      }}>
        {messages.map((m, i) => (
          <p key={i}>
            <b>{m.author}:</b> {m.text}
          </p>
        ))}
      </div>

      <div style={{ marginTop: 10 }}>
        <input
          style={{ width: "80%", padding: 8 }}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={sendMessage} style={{ padding: "8px 20px" }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;

