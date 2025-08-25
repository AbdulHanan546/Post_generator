// src/components/Dashboard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Assume user is authenticated and userId is available (e.g., from context or localStorage)
  const userId = 'your-user-id-here'; // Replace with actual user ID retrieval

  // Fetch user's posts on mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/posts', {
          params: { user: userId },
        });
        setPosts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch posts');
        setLoading(false);
      }
    };
    fetchPosts();
  }, [userId]);

  // Filter scheduled posts for overview
  const scheduledPosts = posts.filter(post => post.status === 'scheduled');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-blue-600 text-white p-4">
        <ul className="flex space-x-6 justify-center">
          <li>
            <button
              onClick={() => setActiveTab('overview')}
              className={`hover:underline ${activeTab === 'overview' ? 'font-bold' : ''}`}
            >
              Overview
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('generate')}
              className={`hover:underline ${activeTab === 'generate' ? 'font-bold' : ''}`}
            >
              Generate Post
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`hover:underline ${activeTab === 'schedule' ? 'font-bold' : ''}`}
            >
              Schedule Post
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('my-posts')}
              className={`hover:underline ${activeTab === 'my-posts' ? 'font-bold' : ''}`}
            >
              My Posts
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Overview of Scheduled Posts</h1>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : scheduledPosts.length === 0 ? (
              <p>No scheduled posts yet.</p>
            ) : (
              <ul className="space-y-4">
                {scheduledPosts.map(post => (
                  <li key={post._id} className="bg-white p-4 rounded shadow">
                    <p><strong>Topic:</strong> {post.topic}</p>
                    <p><strong>Tone:</strong> {post.tone}</p>
                    <p><strong>Platform:</strong> {post.platform}</p>
                    <p><strong>Scheduled At:</strong> {new Date(post.scheduledAt).toLocaleString()}</p>
                    <p><strong>Selected Caption:</strong> {post.selectedCaption || 'None selected'}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'generate' && <GeneratePost userId={userId} setPosts={setPosts} />}

        {activeTab === 'schedule' && <SchedulePost userId={userId} posts={posts} setPosts={setPosts} />}

        {activeTab === 'my-posts' && <MyPosts posts={posts} loading={loading} error={error} />}
      </div>
    </div>
  );
};

// Generate Post Component
const GeneratePost = ({ userId, setPosts }) => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [captions, setCaptions] = useState([]);
  const [selectedCaption, setSelectedCaption] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      // Assume backend API for generating captions (POST /api/generate)
      const response = await axios.post('/api/generate', { topic, tone });
      setCaptions(response.data.captions); // Assume response has { captions: [] }
    } catch (err) {
      setError('Failed to generate captions');
    }
    setGenerating(false);
  };

  const handleSaveDraft = async () => {
    if (!selectedCaption) return alert('Select a caption first');
    try {
      // Save as draft (POST /api/posts)
      const response = await axios.post('/api/posts', {
        user: userId,
        topic,
        tone,
        captions,
        selectedCaption,
        status: 'draft',
      });
      setPosts(prev => [...prev, response.data]);
      alert('Draft saved');
      // Reset form
      setTopic('');
      setTone('Professional');
      setCaptions([]);
      setSelectedCaption('');
    } catch (err) {
      alert('Failed to save draft');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Generate Post</h1>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Topic"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          className="border p-2 w-full"
        />
        <select
          value={tone}
          onChange={e => setTone(e.target.value)}
          className="border p-2 w-full"
        >
          <option>Professional</option>
          <option>Funny</option>
          <option>Casual</option>
          <option>Motivational</option>
        </select>
        <button
          onClick={handleGenerate}
          disabled={generating || !topic}
          className="bg-blue-500 text-white p-2 rounded"
        >
          {generating ? 'Generating...' : 'Generate Captions'}
        </button>
        {error && <p className="text-red-500">{error}</p>}
        {captions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold">Generated Captions:</h2>
            <ul className="space-y-2">
              {captions.map((cap, idx) => (
                <li key={idx}>
                  <label>
                    <input
                      type="radio"
                      checked={selectedCaption === cap}
                      onChange={() => setSelectedCaption(cap)}
                    />
                    {cap}
                  </label>
                </li>
              ))}
            </ul>
            <button
              onClick={handleSaveDraft}
              className="bg-green-500 text-white p-2 rounded mt-4"
            >
              Save as Draft
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Schedule Post Component
const SchedulePost = ({ userId, posts, setPosts }) => {
  const [selectedPostId, setSelectedPostId] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [scheduledAt, setScheduledAt] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [error, setError] = useState(null);

  // Get draft posts
  const draftPosts = posts.filter(post => post.status === 'draft');

  const handleSchedule = async () => {
    if (!selectedPostId || !scheduledAt) return alert('Select post and date');
    setScheduling(true);
    setError(null);
    try {
      // Update post to scheduled (PUT /api/posts/:id)
      const response = await axios.put(`/api/posts/${selectedPostId}`, {
        platform,
        scheduledAt: new Date(scheduledAt),
        status: 'scheduled',
      });
      setPosts(prev => prev.map(p => p._id === selectedPostId ? response.data : p));
      alert('Post scheduled');
      // Reset
      setSelectedPostId('');
      setPlatform('Instagram');
      setScheduledAt('');
    } catch (err) {
      setError('Failed to schedule post');
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
            onChange={e => setSelectedPostId(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="">Select a Draft Post</option>
            {draftPosts.map(post => (
              <option key={post._id} value={post._id}>
                {post.topic} - {post.selectedCaption?.substring(0, 20)}...
              </option>
            ))}
          </select>
          <select
            value={platform}
            onChange={e => setPlatform(e.target.value)}
            className="border p-2 w-full"
          >
            <option>Instagram</option>
            <option>LinkedIn</option>
            <option>Twitter</option>
            <option>Facebook</option>
          </select>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={e => setScheduledAt(e.target.value)}
            className="border p-2 w-full"
          />
          <button
            onClick={handleSchedule}
            disabled={scheduling || !selectedPostId || !scheduledAt}
            className="bg-blue-500 text-white p-2 rounded"
          >
            {scheduling ? 'Scheduling...' : 'Schedule Post'}
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
};

// My Posts Component
const MyPosts = ({ posts, loading, error }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Posts</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map(post => (
            <li key={post._id} className="bg-white p-4 rounded shadow">
              <p><strong>Topic:</strong> {post.topic}</p>
              <p><strong>Tone:</strong> {post.tone}</p>
              <p><strong>Platform:</strong> {post.platform || 'N/A'}</p>
              <p><strong>Scheduled At:</strong> {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : 'N/A'}</p>
              <p><strong>Status:</strong> {post.status}</p>
              <p><strong>Selected Caption:</strong> {post.selectedCaption || 'None'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;