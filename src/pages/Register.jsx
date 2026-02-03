import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";


function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleRegister = async () => {
    setMessage("");
    setIsSuccess(false);

    // frontend validation
    if (!name || !username || !password || !confirm) {
      setMessage("❌ All fields are required");
      return;
    }

    if (password !== confirm) {
      setMessage("❌ Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/register`,
        {
          name,
          username,
          password, // ✅ ONLY what backend needs
        },
        { withCredentials: true }
      );

      if (response.data?.success) {
        setMessage("✅ Registered successfully!");
        setIsSuccess(true);

        setTimeout(() => {
          navigate("/"); // go back to login
        }, 1000);
      } else {
        setMessage(response.data?.message || "❌ Registration failed");
      }
    } catch (error) {
      if (error.response) {
        setMessage(
          error.response.data?.message ||
            `❌ Server error (${error.response.status})`
        );
      } else if (error.request) {
        setMessage("❌ Cannot reach server. Is it running?");
      } else {
        setMessage(`❌ Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Register</h1>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full mb-3 px-4 py-2 border rounded-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Username"
          className="w-full mb-3 px-4 py-2 border rounded-lg"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 px-4 py-2 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full mb-4 px-4 py-2 border rounded-lg"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Register
        </button>

        {message && (
          <p
            className={`text-center text-sm mt-4 px-3 py-2 rounded-lg ${
              isSuccess
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-indigo-600 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
