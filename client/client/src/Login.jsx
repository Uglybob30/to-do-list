import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setAlert("Invalid username or password.");
        return;
      }

      const data = await res.json();
      localStorage.setItem("currentUser", JSON.stringify(data));
      navigate("/home");
    } catch {
      setAlert("Login failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Login</h1>

        {alert && <div className="mb-4 bg-red-100 text-red-800 px-4 py-2 rounded">{alert}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <input className="w-full px-4 py-2 border rounded-lg" placeholder="Username"
            value={username} onChange={e => setUsername(e.target.value)} required />
          <input className="w-full px-4 py-2 border rounded-lg" placeholder="Password" type="password"
            value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg">Login</button>
        </form>

        <p className="text-center mt-6 text-sm">
          No account? <Link to="/register" className="text-blue-600">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
