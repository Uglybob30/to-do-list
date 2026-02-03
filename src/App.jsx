"use client";

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleLogin = async () => {
    setLoginMessage("");
    setIsSuccess(false);

    if (!username || !password) {
      setLoginMessage("❌ Email and password are required");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/login`,
        { username, password },
        { withCredentials: true }
      );

      if (response.data?.success) {
        setLoginMessage("✅ Login Successful");
        setIsSuccess(true);

        setTimeout(() => {
          navigate("/list"); // redirect to list page
        }, 800);
      } else {
        setLoginMessage(response.data?.message || "❌ Login failed");
      }
    } catch (error) {
      if (error.response) {
        setLoginMessage(
          error.response.data?.message ||
            `❌ Server error (${error.response.status})`
        );
      } else if (error.request) {
        setLoginMessage("❌ Cannot reach server. Is it running?");
      } else {
        setLoginMessage(`❌ Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Welcome back!
        </h1>

        <input
          type="email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          onClick={handleLogin}
          className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition mb-3"
        >
          Login
        </button>

        <button
          onClick={() => navigate("/register")}
          className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Register
        </button>

        {loginMessage && (
          <p
            className={`text-center mt-4 text-sm font-medium px-4 py-2 rounded-lg ${
              isSuccess
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {loginMessage}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
