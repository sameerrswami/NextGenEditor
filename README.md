# NextGenEditor - AI-Powered Collaborative Coding Platform 🚀

[![Stars](https://img.shields.io/github/stars/sameerrswami/NextGenEditor?style=social)](https://github.com/sameerrswami/NextGenEditor)
[![Forks](https://img.shields.io/github/forks/sameerrswami/NextGenEditor?style=social)](https://github.com/sameerrswami/NextGenEditor)
[![Issues](https://img.shields.io/github/issues/sameerrswami/NextGenEditor)](https://github.com/sameerrswami/NextGenEditor/issues)
[![License](https://img.shields.io/github/license/sameerrswami/NextGenEditor)](LICENSE)

<div align="center">
  <img src="https://via.placeholder.com/1200x400/020617/00d4ff?text=🧠%20NextGenEditor%20-%20Code%20with%20AI%20🚀" alt="Hero Banner">
  <br><br>
  <strong>🌌 Cyberpunk-themed code editor with AI intelligence, multiplayer collab, challenges & gamification!</strong>
</div>

**Author**: Sameer Swami | 💌 [sameerrswami@gmail.com](mailto:sameerrswami@gmail.com)


**NextGenEditor** is a state-of-the-art, cyberpunk-themed coding environment designed for the modern developer. It combines a powerful code execution engine with real-time AI intelligence, live multiplayer collaboration, competitive coding challenges, a global leaderboard, and a coin-based gamification system.

![NextGenEditor Preview](https://via.placeholder.com/1200x600/020617/6366f1?text=NextGenEditor+AI+Intelligence)

## ✨ Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| 🧠 **AI Intelligence** | Explain/Analyze/Convert/Debug via Groq/Llama3 (+1 coin/use) | ✅ Live |
| 🤝 **Multiplayer Collab** | Socket.io rooms, live sync/chat/presence | ✅ Live |
| 🏆 **Coding Challenges** | Judge0 exec (JS/Python/C++/Java/Go), test cases, coins/badges | ✅ Live |
| 📊 **Leaderboard** | Global coin rankings, podium, premium highlights | ✅ Live |
| 💻 **Monaco Editor** | Vim mode, multi-lang, themes/glassmorphism/neon | ✅ Live |
| 💰 **Coins Economy** | Earn on AI/exec/challenges, unlock premium @10k coins | ✅ Live |
| 👥 **Auth & Profiles** | JWT/register/login/OTP/change-pw/forgot-pw | ✅ Live |




## 🚀 How to Use NextGenEditor

<details>
<summary>📱 Quick Demo (Click to Expand)</summary>

1. **🚀 Start Coding Instantly**
   ```
   git clone https://github.com/sameerrswami/NextGenEditor.git
   cd NextGenEditor/server && npm i && npm run dev
   cd ../client && npm i && npm run dev
   ```
   Open `http://localhost:5173` → Go to `/editor`

2. **🧠 Try AI Magic**  
   Paste code → Click "AI Explain" → Get insights +1 coin! 🔮

3. **🤝 Multiplayer Collab**  
   Go `/multiplayer` → Create Room ID → Share with friend → Live sync! ⚡

4. **🏆 Solve Challenges**  
   `/challenges` → Pick one → Code → Submit → Earn coins/badges! 🎉

![Demo GIF Placeholder](https://via.placeholder.com/800x400/020617/00ff88?text=Watch+Me+Code+with+AI+%F0%9F%A4%A8)

</details>

## 🔧 Supported Languages

| Language | Icon | Execution |
|----------|------|-----------|
| JavaScript | ⚡ | Local |
| Python | 🐍 | Judge0 |
| C++ | ⚙️ | Judge0 |
| C | ⚙️ | Judge0 |
| Java | ☕ | Judge0 |
| Go | 🐹 | Judge0 |
| Rust | 🦀 | Judge0 |

## 🛠️ Tech Stack

### Frontend ![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react)
 *   **React (Vite 5.0)**: Lightning-fast frontend architecture.
 *   **Tailwind CSS 3.3**: Modern utility-first styling w/ glassmorphism/neon.
 *   **Socket.io-client 4.8**: Real-time multiplayer sync.
 *   **Monaco Editor 4.6 (+Vim)**: VS Code engine.
 *   **Lucide-React**: Premium icons.

### Backend ![Node](https://img.shields.io/badge/Node-18.x-339933?style=flat&logo=node.js)
 *   **Express**: Scalable API server.
 *   **Socket.io 4.8**: WebSocket rooms.
 *   **MongoDB + Mongoose 8.0**: User/challenge data.
 *   **Groq AI**: Llama3 inference.
 *   **JWT + Bcrypt**: Secure auth.
 *   **Judge0**: Cloud code exec (multi-lang).


## 📦 Important Libraries & Dependencies

### Server-Side
*   `express`: Core web framework.
*   `socket.io`: Real-time WebSocket engine.
*   `mongoose`: ODM for MongoDB.
*   `jsonwebtoken`: For secure authentication.
*   `bcryptjs`: For data security.
*   `axios`: For Groq AI API integration.
*   `cors`: For handling cross-origin requests.
*   `helmet`: Security headers.
*   `express-rate-limit`: Prevents API abuse.

### Client-Side
*   `socket.io-client`: Real-time connection to the server.
*   `monaco-vim`: Vim keybindings inside Monaco Editor.
*   `@monaco-editor/react`: VS Code editor component.
*   `lucide-react`: For the premium icon set.
*   `axios`: For all backend interactions.
*   `react-router-dom`: For client-side routing.

## 🔑 Key Functions

### Backend
*   `callAI(prompt)`: Standardized utility for communicating with the Groq AI engine.
*   `runCode(code, config, input)`: Securely executes user code in a sandboxed child process.
*   `io.on('connection')`: Manages Socket.io room lifecycle (join, code-change, chat, leave).

### Frontend
*   `refreshUser()`: Syncs the user's coins, premium status, and profile data across all components.
*   `handleAIAction()`: The main engine in `AIPanel` that manages tool execution and coin rewards.
*   `handleCodeChange()`: Debounced code sync handler that broadcasts changes to all room participants.

## 📄 Pages & Routes

| Route | Page | Req Auth | Description |
|-------|------|----------|-------------|
| `/` → `/editor` | 💻 Editor | ✅ | Monaco + AI panel |
| `/dashboard` | 📋 Dashboard | ✅ | Snippets/history |
| `/challenges` | 🏆 Challenges | ✅ | Judge0 tests/coins |
| `/leaderboard` | 📊 Leaderboard | - | Global rankings |
| `/multiplayer` | 🤝 Multiplayer | - | Socket rooms |
| `/profile/:user` | 👤 Profile | ✅ | Portfolio/badges |
| `/login` | 🔐 Login | - | JWT/OTP |
| `/forgot-password` | 🔒 Reset | - | Email flow |

[![Deploy](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/sameerrswami/NextGenEditor)


## 🚀 Getting Started

1. **Clone the Repo**
   ```bash
   git clone https://github.com/sameerrswami/NextGenEditor.git
   ```

2. **Setup Environment Variables**

   Create a `.env` file in the `server` directory:
   ```env
   PORT=5005
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   GROQ_API_KEY=your_groq_key
   ```

   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:5005/api
   VITE_SOCKET_URL=http://localhost:5005
   ```

3. **Install Dependencies**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

4. **Run Development Mode**
   ```bash
   # Terminal 1 (Server)
   cd server && npm run dev

   # Terminal 2 (Client)
   cd client && npm run dev
   ```

5. **🌟 Seed Demo Challenges** *(optional)*

   After login → `/challenges` → Click **↻** → Auto-load 6 demos!

<div align="center">

### 🚀 Quick Deploy
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/sameerrswami/NextGenEditor)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy-git-hub?repo=https://github.com/sameerrswami/NextGenEditor)

### 🤝 Contribute & Star
⭐ **Star this repo if you found it useful!**  
💬 [Issues](https://github.com/sameerrswami/NextGenEditor/issues) | [sameerrswami@gmail.com](mailto:sameerrswami@gmail.com)

![Footer Gradient](https://via.placeholder.com/1200x100/020617/gradient?text=%F0%9F%9A%80%20Made%20with%20%E2%9D%A4%EF%B8%8F%20by%20Sameer%20Swami)

**MIT License** © 2024 Sameer Swami
</div>




