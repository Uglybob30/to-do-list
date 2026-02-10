import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [alert, setAlert] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setAlert("Passwords do not match.");

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password }),
      });

      if (!res.ok) throw new Error();
      setAlert("Registered successfully!");
      setTimeout(() => navigate("/"), 60000);
    } catch {
      setAlert("Registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Register</h1>

        {alert && <div className="mb-4 bg-red-100 text-red-800 px-4 py-2 rounded">{alert}</div>}

        <form onSubmit={handleRegister} className="space-y-5">
          <input className="w-full px-4 py-2 border rounded-lg" placeholder="Full Name"
            value={name} onChange={e => setName(e.target.value)} required />
          <input className="w-full px-4 py-2 border rounded-lg" placeholder="Username"
            value={username} onChange={e => setUsername(e.target.value)} required />
          <input className="w-full px-4 py-2 border rounded-lg" type="password" placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)} required />
          <input className="w-full px-4 py-2 border rounded-lg" type="password" placeholder="Confirm Password"
            value={confirm} onChange={e => setConfirm(e.target.value)} required />
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg">Register</button>
        </form>

        <p className="text-center mt-6 text-sm">
          Have an account? <Link to="/" className="text-blue-600">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
