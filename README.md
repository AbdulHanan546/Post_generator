🚀 AI-Powered Social Media Post Generator & Scheduler

MERN Stack | CodeCelix | Duration: 1 Week

A web app for businesses, startups, and freelancers to generate AI-written posts, design simple graphics, and schedule them across platforms.

📌 Features

🔐 User Authentication (JWT-based, optional Google OAuth)

🏠 Dashboard with overview of scheduled posts

✍️ AI Post Generator (multiple tones + variations)

🎨 Simple Graphics Maker (optional Canva-lite)

📅 Post Scheduler with calendar view

💾 Drafts, Edit/Delete posts

👩‍💻 Admin Panel (optional)

🛠️ Tech Stack

Frontend: React (Vite) + TailwindCSS + Axios + React Router

Backend: Node.js + Express.js + JWT + bcrypt

Database: MongoDB + Mongoose

AI Integration: OpenAI API (or mock AI service)

Hosting: Vercel/Netlify (frontend), Render/Heroku (backend)

📂 Project Structure
/frontend   → Frontend (Vite + React)
/backend   → Backend (Node + Express)
/models   → MongoDB Schemas
/routes   → Express Routes
/middleware → JWT/Auth middlewares

📦 Installation & Setup
1️⃣ Clone Repo
git clone https://github.com/AbdulHanan546/Post_generator.git
cd project-folder

2️⃣ Backend Setup
cd backend
npm install express mongoose bcryptjs jsonwebtoken cors dotenv nodemon


Run backend:

npm run dev   # if "dev": "nodemon index.js" is in package.json

3️⃣ Frontend Setup
cd frontend
npm install react-router-dom axios framer-motion


Run frontend:

npm run dev

4️⃣ Environment Variables

Create a .env in /backend:

PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret_key
