import { useState } from "react";

function App() {
  const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [document, setDocument] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");

	async function confirm () {
		const payload = {
			name,
			email,
			document,
			password
		}

		const response = await fetch("http://localhost:3000/signup", {
			method: "post",
			headers: {
				"content-type": "application/json"
			},
			body: JSON.stringify(payload)
		});

		await response.json();

		setMessage("success");
	}

	function fill () {
		setName("John Doe");
		setEmail("john.doe@gmail.com");
		setDocument("97456321558");
		setPassword("asdQWE123");
	}

	return (
		<div>
			<div>
				<input className="input-name" value={name} onChange={(e) => setName(e.target.value)}/>
			</div>
			<div>
				<input className="input-email" value={email} onChange={(e) => setEmail(e.target.value)}/>
			</div>
			<div>
				<input className="input-document" value={document} onChange={(e) => setDocument(e.target.value)}/>
			</div>
			<div>
				<input className="input-password" value={password} onChange={(e) => setPassword(e.target.value)}/>
			</div>

			<span className="span-message">{ message }</span>

			<button className="button-fill" onClick={() => fill()}>Fill</button>

			<button className="button-confirm" onClick={() => confirm()}>Confirm</button>
		</div>
	)
}

export default App
