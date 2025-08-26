import { useState } from "react";
import axios from "axios";

// You can use an icon library like react-icons for a better UI
// npm install react-icons
import { FiClipboard, FiCheck } from "react-icons/fi"; 

function AIWriter() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [platform, setPlatform] = useState("Twitter");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleGenerate = async () => {
    if (!topic) {
      setError("Please enter a topic");
      return;
    }
    setError("");
    setLoading(true);
    setPosts([]); 
    try {
      const res = await axios.post("http://localhost:5000/api/ai/generate-post", {
        topic,
        tone,
        platform,
      });
      setPosts(res.data.posts || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate post. Try again.");
      console.error("Error details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (postText, index) => {
    navigator.clipboard.writeText(postText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds
  };

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* --- FORM CARD --- */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">AI Post Generator</h1>
          <p className="text-slate-500 mb-6">Create compelling social media content in seconds.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Platform */}
            <div>
              <label className="block mb-2 font-medium text-slate-700">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
              >
                <option>Twitter</option>
                <option>Instagram</option>
                <option>LinkedIn</option>
              </select>
            </div>

            {/* Tone */}
            <div>
              <label className="block mb-2 font-medium text-slate-700">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
              >
                <option>Professional</option>
                <option>Casual</option>
                <option>Funny</option>
                <option>Motivational</option>
              </select>
            </div>

            {/* Topic (Full Width) */}
            <div className="md:col-span-2">
              <label className="block mb-2 font-medium text-slate-700">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                placeholder="e.g., Launching a new coffee shop..."
              />
            </div>
          </div>
          
          {/* Button */}
          <div className="mt-6">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full flex justify-center items-center bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : "✨ Generate Posts"}
            </button>
          </div>
        </div>

        {/* --- RESULTS AREA --- */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="space-y-6">
          {posts.map((post, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-lg transition hover:shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-slate-700">Variation {idx + 1}</h3>
                <button 
                  onClick={() => handleCopy(post, idx)}
                  className={`flex items-center space-x-2 text-sm font-medium px-3 py-1 rounded-md transition ${
                    copiedIndex === idx 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {copiedIndex === idx ? <FiCheck /> : <FiClipboard />}
                  <span>{copiedIndex === idx ? "Copied!" : "Copy"}</span>
                </button>
              </div>
              <p className="text-slate-600 whitespace-pre-wrap">{post}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AIWriter;