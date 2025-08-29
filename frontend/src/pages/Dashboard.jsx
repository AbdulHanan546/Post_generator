// src/components/Dashboard.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import AIWriter from "./AIWriter";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Draft state for AIWriter persists across tabs
  const [draftData, setDraftData] = useState({
  topic: "",
  tone: "Professional",
  platform: "Twitter",
  posts: [],
  selectedCaption: null,
});


  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // ✅ central fetch function
  const fetchPosts = async () => {
    try {
      const response = await axios.get("/api/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to fetch posts");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && token) fetchPosts();
  }, [userId, token]);

  const scheduledPosts = posts.filter((post) => post.status === "scheduled");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-blue-600 text-white p-4">
        <ul className="flex space-x-6 justify-center">
          <li>
            <button
              onClick={() => setActiveTab("overview")}
              className={`hover:underline ${
                activeTab === "overview" ? "font-bold" : ""
              }`}
            >
              Overview
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("generate")}
              className={`hover:underline ${
                activeTab === "generate" ? "font-bold" : ""
              }`}
            >
              Generate Post
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`hover:underline ${
                activeTab === "schedule" ? "font-bold" : ""
              }`}
            >
              Schedule Post
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("my-posts")}
              className={`hover:underline ${
                activeTab === "my-posts" ? "font-bold" : ""
              }`}
            >
              My Posts
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="p-6">
        {activeTab === "overview" && (
          <Overview
            posts={scheduledPosts}
            loading={loading}
            error={error}
            token={token}
            fetchPosts={fetchPosts}
          />
        )}

        {activeTab === "generate" && (
  <AIWriter draftData={draftData} setDraftData={setDraftData} setPosts={setPosts} />
)}


        {activeTab === "schedule" && (
          <SchedulePost
            userId={userId}
            token={token}
            posts={posts}
            fetchPosts={fetchPosts}
          />
        )}

        {activeTab === "my-posts" && (
          <MyPosts
            posts={posts}
            loading={loading}
            error={error}
            token={token}
            fetchPosts={fetchPosts}
          />
        )}
      </div>
    </div>
  );
};

/* ============= Overview ============= */
const Overview = ({ posts, loading, error, token, fetchPosts }) => {
  const [editingPost, setEditingPost] = useState(null);
  const [platform, setPlatform] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const handleDeletePost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchPosts(); // ✅ refresh from server
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  const handleEditPost = async (id) => {
    try {
      await axios.put(
        `/api/posts/${id}`,
        { platform, scheduledAt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchPosts(); // ✅ refresh from server
      setEditingPost(null);
    } catch (err) {
      alert("Failed to edit post");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (posts.length === 0) return <p>No scheduled posts yet.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Overview of Scheduled Posts</h1>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post._id || post.id} className="bg-white p-4 rounded shadow">
            <p><strong>Topic:</strong> {post.topic}</p>
            <p><strong>Tone:</strong> {post.tone}</p>
            <p><strong>Platform:</strong> {post.platform}</p>
            <p>
              <strong>Scheduled At:</strong>{" "}
              {new Date(post.scheduledAt).toLocaleString()}
            </p>
            <p><strong>Selected Caption:</strong> {post.selectedCaption || "None"}</p>

            <div className="mt-2 flex gap-2">
              <button
                onClick={() => handleDeletePost(post._id || post.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setEditingPost(post._id || post.id);
                  setPlatform(post.platform);
                  setScheduledAt(
                    new Date(post.scheduledAt).toISOString().slice(0, 16)
                  );
                }}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
            </div>

            {editingPost === (post._id || post.id) && (
              <div className="mt-4 p-4 border rounded bg-gray-50">
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="border p-2 w-full mb-2"
                >
                  <option>Instagram</option>
                  <option>Facebook</option>
                  <option>Twitter</option>
                  <option>LinkedIn</option>
                </select>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="border p-2 w-full mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (new Date(scheduledAt) < new Date()) {
                        alert("Cannot select a past date/time");
                        return;
                      }
                      handleEditPost(post._id || post.id);
                    }}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingPost(null)}
                    className="bg-gray-400 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ============= SchedulePost ============= */
const SchedulePost = ({ userId, token, posts, fetchPosts }) => {
  const [selectedPostId, setSelectedPostId] = useState("");
  const [platform, setPlatform] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [error, setError] = useState(null);

  const draftPosts = posts.filter((post) => post.status === "draft");

  const handleSchedule = async () => {
    if (!selectedPostId || !scheduledAt) return alert("Select post and date");
    if (new Date(scheduledAt) < new Date())
      return alert("Cannot schedule in the past");
    setScheduling(true);
    setError(null);
    try {
      await axios.post(
        `/api/posts/${selectedPostId}/schedule`,
        { platform, scheduledAt: new Date(scheduledAt) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchPosts(); // ✅ refresh from server
      setSelectedPostId("");
      setScheduledAt("");
      alert("Post scheduled");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to schedule post");
    }
    setScheduling(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Schedule Post</h1>
      {draftPosts.length === 0 ? (
        <p>No drafts available to schedule.</p>
      ) : (
        <div className="space-y-4">
          <select
            value={selectedPostId}
            onChange={(e) => setSelectedPostId(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="">Select a Draft Post</option>
            {draftPosts.map((post) => (
              <option key={post._id || post.id} value={post._id || post.id}>
                {post.topic} - {post.selectedCaption?.substring(0, 20)}...
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            value={scheduledAt}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="border p-2 w-full"
          />
          <button
            onClick={handleSchedule}
            disabled={scheduling || !selectedPostId || !scheduledAt}
            className="bg-blue-500 text-white p-2 rounded"
          >
            {scheduling ? "Scheduling..." : "Schedule Post"}
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
};

/* ============= MyPosts ============= */
const MyPosts = ({ posts, loading, error }) => {
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Posts</h1>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post._id || post.id} className="bg-white p-4 rounded shadow">
              <p><strong>Topic:</strong> {post.topic}</p>
              <p><strong>Tone:</strong> {post.tone}</p>
              <p><strong>Platform:</strong> {post.platform || "N/A"}</p>
              <p>
                <strong>Scheduled At:</strong>{" "}
                {post.scheduledAt
                  ? new Date(post.scheduledAt).toLocaleString()
                  : "N/A"}
              </p>
              <p><strong>Status:</strong> {post.status}</p>
              <p><strong>Selected Caption:</strong> {post.selectedCaption || "None"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
