import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [message, setMessage] = useState(""); // inline message
  const [type, setType] = useState(""); // "success" | "error"
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setType("");
    setLoading(true);

    if (password !== confirm) {
      setType("error");
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Register the user
      const registerResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/register`,
        { name, username, password, confirm },
        { withCredentials: true } // important for session cookies
      );

      if (registerResponse.data.success) {
        setType("success");
        setMessage("Registered successfully! Logging in...");

        // Auto-login after successful registration
        const loginResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/login`,
          { username, password },
          { withCredentials: true }
        );

        if (loginResponse.data.success) {
          // Redirect to home
          setTimeout(() => navigate("/home"), 1000);
        } else {
          setType("error");
          setMessage(loginResponse.data.message || "Login failed after registration");
        }
      } else {
        setType("error");
        setMessage(registerResponse.data.message || "Registration failed");
      }
    } catch (err) {
      setType("error");
      setMessage(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-blue-100 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border border-gray-200 transition-all">

        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800 tracking-wide">
          Create Account
        </h1>

        {/* Inline message */}
        {message && (
          <div
            className={`mb-4 text-center py-2 rounded-lg font-medium ${
              type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            required
          />

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-blue-500
                       text-white p-2 rounded-xl font-semibold hover:from-indigo-600 hover:to-blue-600
                       transition-all active:scale-95 shadow-md disabled:opacity-50"
          >
            {loading ? "Processing..." : "Register"}
          </button>

          <div className="text-center text-gray-400">— or —</div>

          <p className="text-center mb-2 text-gray-500">
            Already have an account?{" "}
            <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-semibold transition">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
