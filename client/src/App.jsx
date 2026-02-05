import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // inline message
  const [type, setType] = useState(""); // "success" | "error"
  const [loading, setLoading] = useState(false);

  // Auto-redirect if session exists
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/get-session`, { withCredentials: true });
        if (response.data.session) {
          navigate("/home");
        }
      } catch (err) {
        console.log("No active session");
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setType("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        { username, password },
        { withCredentials: true } // important for session cookies
      );

      if (response.data.success) {
        setType("success");
        setMessage("Login successful! Redirecting...");
        // redirect to /home after 1 second
        setTimeout(() => navigate("/home"), 1000);
      } else {
        setType("error");
        setMessage(response.data.message || "Login failed");
      }
    } catch (err) {
      setType("error");
      setMessage(err.response?.data?.message || "Username or password is incorrect");
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

        {/* Inline success/error message */}
        {message && (
          <div
            className={`mb-4 text-sm text-center rounded-lg py-2 font-medium ${
              type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-600">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-2 rounded-xl bg-gray-50 text-gray-800 border border-gray-200
                         focus:outline-none focus:ring-2 focus:ring-indigo-400
                         placeholder-gray-400 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 rounded-xl bg-gray-50 text-gray-800 border border-gray-200
                         focus:outline-none focus:ring-2 focus:ring-indigo-400
                         placeholder-gray-400 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600
                       text-white py-2 rounded-xl font-semibold tracking-wide
                       transition-all duration-200 active:scale-95 shadow-md disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-600 hover:text-indigo-800 font-semibold transition"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default App;
