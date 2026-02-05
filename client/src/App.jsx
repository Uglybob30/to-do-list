import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState(""); // success | error

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        { username, password }
      );

      if (response.data.success) {
        setType("success");
        setMessage("Login successful!");
      } else {
        setType("error");
        setMessage(response.data.message);
      }
    } catch (error) {
      setType("error");
      setMessage("Username or password is incorrect");
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
              type === "success"
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-600">
              Username
            </label>
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
            <label className="block text-sm mb-1 text-gray-600">
              Password
            </label>
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
            className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600
                       text-white py-2 rounded-xl font-semibold tracking-wide
                       transition-all duration-200 active:scale-95 shadow-md"
          >
            Login
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
