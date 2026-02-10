import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-redirect if session exists
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get(`${API}/get-session`, { withCredentials: true });
        if (res.data.session) navigate("/home");
      } catch {
        // ignore
      }
    };
    checkSession();
  }, [API, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setType("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${API}/login`,
        { username, password },
        { withCredentials: true }
      );

      if (res.data.success) {
        setType("success");
        setMessage("Login successful! Redirecting...");
        setTimeout(() => navigate("/home"), 1000);
      } else {
        setType("error");
        setMessage(res.data.message || "Invalid username or password");
      }
    } catch (err) {
      console.error(err);
      setType("error");
      setMessage(err.response?.data?.message || "Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-blue-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-gray-200 p-8 transition-all">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 tracking-wide">
          Welcome Back
        </h1>

        {message && (
          <div
            className={`mb-4 text-sm text-center rounded-lg py-2 font-medium ${
              type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg font-semibold disabled:opacity-50 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-500 mt-2">
            Don’t have an account?{" "}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-semibold">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
