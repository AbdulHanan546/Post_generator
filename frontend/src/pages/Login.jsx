import { useState } from "react";
import axios from "../services/axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", form);

      localStorage.setItem("token", res.data.token);

      // Handle both "id" and "_id" safely
      const userId = res.data.user?.id || res.data.user?._id;
      if (userId) {
        localStorage.setItem("userId", userId);
      }

      alert("Login successful!");
      navigate("/Dashboard");
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-xl w-96"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Login
        </h2>

        <input
          className="w-full mb-3 p-3 border rounded-lg"
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          className="w-full mb-3 p-3 border rounded-lg"
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
          Login
        </button>

        <p className="text-sm text-gray-600 mt-4 text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>

        <p className="text-sm text-gray-500 mt-2 text-center">
          <Link to="/" className="hover:underline">← Back to Home</Link>
        </p>
      </motion.form>
    </div>
  );
}
