# NextGenEditor - AI-Powered Coding Platform

A full-stack online coding platform with AI assistance, code execution, snippet management, and execution history.

## Tech Stack

- **Frontend:** React (Vite) + TailwindCSS + Monaco Editor
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **AI:** Google Gemini API
- **Code Execution:** Piston API (https://emkc.org/api/v2/piston)
- **Auth:** JWT

## Features

- Multi-language code editor (JavaScript, Python, C++, Java)
- Real-time code execution with stdin/stdout support
- AI Code Explainer (beginner & detailed modes)
- AI Code Analyzer (bugs, optimization, complexity)
- AI Code Converter (between languages)
- AI Debugger (auto-fix code errors)
- Code Snippets Manager with tags and search
- Execution History tracking
- Dark/Light mode toggle
- Responsive design
- Keyboard shortcuts (Ctrl+Enter to run)

## Project Structure

```
NextGenEditor/
├── server/                 # Backend
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── index.js           # Entry point
│   └── package.json
└── client/                # Frontend
    ├── src/
    │   ├── components/    # React components
    │   ├── pages/         # Page components
    │   ├── context/       # Auth context
    │   └── ...
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key (optional, for AI features)

### Backend Setup

```bash
cd server
npm install

# Create .env file
cp .env.example .env
# Edit .env with your credentials:
# - MONGO_URI
# - JWT_SECRET
# - GEMINI_API_KEY (optional)

npm run dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

```bash
cd client
npm install

# Create .env file
cp .env.example .env
# Edit .env:
# VITE_API_URL=http://localhost:5000/api

npm run dev
```

Frontend runs on `http://localhost:3000`

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/auth/register | POST | User registration |
| /api/auth/login | POST | User login |
| /api/code/run | POST | Execute code |
| /api/ai/explain | POST | AI code explanation |
| /api/ai/analyze | POST | AI code analysis |
| /api/ai/convert | POST | AI code conversion |
| /api/ai/debug | POST | AI debugging |
| /api/snippet | GET/POST | Snippet CRUD |
| /api/snippet/:id | DELETE | Delete snippet |
| /api/history | GET | Execution history |

## Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

## Notes

- Without `GEMINI_API_KEY`, AI features show a disabled message
- The app works in demo mode without external API keys

