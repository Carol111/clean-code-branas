import { useState } from "react";
import { useSocketMarketDepth } from "./hooks/useSocketMarketDepth";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [document, setDocument] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("BTC/USD");
  const { depth, connected, error } = useSocketMarketDepth(selectedMarket);

  async function confirm() {
    const payload = {
      name,
      email,
      document,
      password,
    };

    const response = await fetch("http://localhost:3000/signup", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    await response.json();

    setMessage("success");
  }

  function fill() {
    setName("John Doe");
    setEmail("john.doe@gmail.com");
    setDocument("97456321558");
    setPassword("asdQWE123");
  }

  return (
    <div>
      <div className="websocket-status">
        <p>
          WebSocket Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}
        </p>
        {error && <p className="error">Error: {error}</p>}
        <div>
          <label>Market: </label>
          <select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
          >
            <option>BTC/USD</option>
            <option>USD/BTC</option>
          </select>
        </div>
        {depth && (
          <div className="depth-display">
            <h3>Market Depth - {selectedMarket}</h3>
            <div>
              <h4>Buy Orders</h4>
              {depth.buys.map((order, idx) => (
                <div key={idx}>
                  Price: {order.price} | Quantity: {order.quantity}
                </div>
              ))}
            </div>
            <div>
              <h4>Sell Orders</h4>
              {depth.sells.map((order, idx) => (
                <div key={idx}>
                  Price: {order.price} | Quantity: {order.quantity}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <input
          className="input-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <input
          className="input-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <input
          className="input-document"
          value={document}
          onChange={(e) => setDocument(e.target.value)}
        />
      </div>
      <div>
        <input
          className="input-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <span className="span-message">{message}</span>

      <button className="button-fill" onClick={() => fill()}>
        Fill
      </button>

      <button className="button-confirm" onClick={() => confirm()}>
        Confirm
      </button>
    </div>
  );
}

export default App;
