import { useState } from "react";
import axios from "../services/axios";
import { FiClipboard, FiCheck } from "react-icons/fi";

function AIWriter({ draftData, setDraftData,setPosts }) {
  const { topic, tone, platform, posts, selectedCaption } = draftData;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!topic) {
      setError("Please enter a topic");
      return;
    }
    setError("");
    setLoading(true);
    setDraftData((prev) => ({ ...prev, posts: [], selectedCaption: null }));

    try {
      const res = await axios.post("/api/ai/generate-post", {
        topic,
        tone,
        platform,
      });
      setDraftData((prev) => ({ ...prev, posts: res.data.posts || [] }));
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
    setTimeout(() => setCopiedIndex(null), 2000);
  };

    const handleSavePost = async () => {
    if (!draftData.selectedCaption) {
      alert("Please select a caption first.");
      return;
    }

    setSaving(true);
    try {
          const token = localStorage.getItem("token");  // ✅ fix here

      const res = await axios.post(
        "/api/posts",
        {
          topic: draftData.topic,
          tone: draftData.tone,
          captions: draftData.posts,
          selectedCaption: draftData.selectedCaption,
          platform: draftData.platform,
          scheduledAt: new Date(Date.now() + 60000), // save as draft
          status: "draft",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ✅ Immediately update Dashboard state so other tabs see it
      setPosts((prev) => [...prev, res.data.post || res.data]);


      alert("Post saved as draft!");

      // ✅ Clear AIWriter form after save
      setDraftData({
        topic: "",
  tone: "Professional",
  platform: "Twitter",
  posts: [],
  selectedCaption: null,
      });
      console.log("Saved post:", res.data);

    } catch (err) {
      alert(err.response?.data?.error || `Failed to save post.  ${err}`);
    } finally {
      setSaving(false);
    }
  };



  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* --- FORM CARD --- */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">AI Post Generator</h1>
          <p className="text-slate-500 mb-6">
            Create compelling social media content in seconds.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Platform */}
            <div>
              <label className="block mb-2 font-medium text-slate-700">Platform</label>
              <select
                value={platform}
                onChange={(e) =>
                  setDraftData((prev) => ({ ...prev, platform: e.target.value }))
                }
                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
              >
                <option>Twitter</option>
                <option>Instagram</option>
                <option>LinkedIn</option>
                <option>Facebook</option>
              </select>
            </div>

            {/* Tone */}
            <div>
              <label className="block mb-2 font-medium text-slate-700">Tone</label>
              <select
                value={tone}
                onChange={(e) =>
                  setDraftData((prev) => ({ ...prev, tone: e.target.value }))
                }
                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
              >
                <option>Professional</option>
                <option>Casual</option>
                <option>Funny</option>
                <option>Motivational</option>
              </select>
            </div>

            {/* Topic */}
            <div className="md:col-span-2">
              <label className="block mb-2 font-medium text-slate-700">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) =>
                  setDraftData((prev) => ({ ...prev, topic: e.target.value }))
                }
                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                placeholder="e.g., Launching a new coffee shop..."
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-6">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full flex justify-center items-center bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? "Generating..." : "✨ Generate Posts"}
            </button>
          </div>
        </div>

        {/* --- RESULTS AREA --- */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="space-y-6">
          {posts.map((post, idx) => (
            <div
              key={idx}
              className={`bg-white p-6 rounded-xl shadow-lg transition hover:shadow-xl ${
                selectedCaption === post ? "border-2 border-blue-500" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-slate-700">Variation {idx + 1}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCopy(post, idx)}
                    className={`flex items-center space-x-2 text-sm font-medium px-3 py-1 rounded-md transition ${
                      copiedIndex === idx
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {copiedIndex === idx ? <FiCheck /> : <FiClipboard />}
                    <span>{copiedIndex === idx ? "Copied!" : "Copy"}</span>
                  </button>
                  <button
                    onClick={() =>
                      setDraftData((prev) => ({ ...prev, selectedCaption: post }))
                    }
                    className={`px-3 py-1 text-sm rounded-md font-medium transition ${
                      selectedCaption === post
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {selectedCaption === post ? "Selected" : "Select"}
                  </button>
                </div>
              </div>
              <p className="text-slate-600 whitespace-pre-wrap">{post}</p>
            </div>
          ))}
        </div>

        {/* Save Button */}
        {posts.length > 0 && (
          <div className="mt-6">
            <button
              onClick={handleSavePost}
              disabled={saving}
              className="w-full bg-green-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
            >
              {saving ? "Saving..." : "💾 Save Post as Draft"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIWriter;
