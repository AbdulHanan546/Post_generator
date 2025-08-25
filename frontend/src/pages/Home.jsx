import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center text-center px-6">
      <motion.h1
        className="text-5xl md:text-6xl font-extrabold mb-6 text-gray-800"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        AI-Powered Social Media Post Generator
      </motion.h1>

      <motion.p
        className="mb-8 text-lg text-gray-600 max-w-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        Generate engaging posts, design graphics, and schedule effortlessly with the power of AI.
      </motion.p>

      <motion.div
        className="space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <Link
          to="/signup"
          className="px-8 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition"
        >
          Get Started
        </Link>
        <Link
          to="/login"
          className="px-8 py-3 bg-white text-gray-800 rounded-xl shadow-lg border hover:bg-gray-100 transition"
        >
          Login
        </Link>
      </motion.div>
    </div>
  );
}
