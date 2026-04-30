# NextGenEditor - AI-Powered Collaborative Coding Platform 🚀

**NextGenEditor** is a state-of-the-art, cyberpunk-themed coding environment designed for the modern developer. It combines a powerful code execution engine with real-time AI intelligence, live multiplayer collaboration, competitive coding challenges, a global leaderboard, and a coin-based gamification system.

![NextGenEditor Preview](https://via.placeholder.com/1200x600/020617/6366f1?text=NextGenEditor+AI+Intelligence)

## ✨ Core Features

### 🧠 AI Intelligence Panel
*   **Explain**: Get deep insights into complex code blocks.
*   **Analyze**: Optimize and identify potential bottlenecks.
*   **Convert**: Instantly translate code between 10+ languages.
*   **Advanced Debugger (Premium)**: Let AI find and fix your bugs for you.

### 🤝 Real-Time Multiplayer Collaboration
*   **Live Pair Programming**: Create or join a room with a 6-character Room ID.
*   **Synchronized Editing**: All code changes are broadcast to everyone in the room instantly via Socket.io.
*   **Language Sync**: Changing language in one client updates it for all participants.
*   **Integrated Chat**: Built-in live text chat panel inside the multiplayer room.
*   **Online Presence**: See all users currently in the room.

### 🏆 Coding Challenges & Gamification
*   **6 Built-in Challenges**: From "Hello World" to Fibonacci — with Easy, Medium, and Hard tiers.
*   **Real Test-Case Execution**: Solutions are run server-side against hidden test cases. Only passing all tests awards coins.
*   **Multi-Language Submission**: Submit challenges in JavaScript, Python, or C++.
*   **Earn Coins**: Every solved challenge rewards you with premium coins.
*   **One-Click Seed**: Instantly load demo challenges from the UI.

### 📊 Global Leaderboard
*   **Top 50 Rankings**: See who the best coders are globally, sorted by total coins earned.
*   **Podium View**: Animated 1st/2nd/3rd place podium for the top three.
*   **Premium Badges**: Premium users are highlighted with gold badges.
*   **Follower Count**: Social proof shown alongside rankings.

### 💻 Powerful Editor
*   **Multi-Language Execution**: JavaScript, Python, C, C++, Java, Go, and Rust.
*   **Vim Mode Toggle**: Enable full Vim keybindings with a single button click.
*   **Custom Themes**: Switch between Dark, Light, and High Contrast themes.
*   **Snippet Manager**: Save, search, and manage your reusable code blocks.
*   **Glassmorphism UI**: A premium, responsive design with neon accents and backdrop-blur effects.

### 💰 Coin-Based Economy
*   **Earn**: Get rewarded for coding!
    *   +1 Coin for AI interactions
    *   +2 Coins for successful code execution
    *   +5 Coins for saving snippets
    *   +10 to +75 Coins for solving challenges
*   **Unlock Premium**: Accumulate 10,000 coins to unlock the **Premium Tier**.

### 🌐 Social Developer Network
*   **Public Portfolios**: Share your coding journey with a public profile URL.
*   **Follow System**: Connect with other developers.
*   **Profile Views**: See how many people are checking out your work.
*   **Custom Avatars**: Personalize your identity with PFP uploads.

## 🛠️ Tech Stack

### Frontend
*   **React (Vite)**: Lightning-fast frontend architecture.
*   **Tailwind CSS**: Modern utility-first styling with custom glassmorphism components.
*   **Socket.io Client**: Real-time bidirectional communication for multiplayer.
*   **Monaco Editor**: VS Code's editor engine with Vim mode support (`monaco-vim`).
*   **Lucide-React**: Sleek, professional iconography.
*   **Axios**: Secure and efficient API communication.
*   **Context API**: Global state management for Auth and Economy.

### Backend
*   **Node.js & Express**: Scalable server-side logic.
*   **Socket.io**: WebSocket server for real-time multiplayer rooms.
*   **MongoDB & Mongoose**: Flexible NoSQL database for users, snippets, challenges, and social data.
*   **Groq API**: High-speed AI inference using Llama 3 models.
*   **JWT (JSON Web Tokens)**: Secure, stateless authentication.
*   **Bcrypt.js**: Industry-standard password hashing.
*   **Child Process**: Sandboxed local code execution for C, C++, Java, Python, Go, Rust, JavaScript.

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

| Route           | Page          | Description                              |
|-----------------|---------------|------------------------------------------|
| `/editor`       | Editor        | Main code editor with AI panel           |
| `/dashboard`    | Dashboard     | Snippet manager and execution history    |
| `/challenges`   | Challenges    | Competitive coding problems with rewards |
| `/leaderboard`  | Leaderboard   | Global coin-based rankings               |
| `/multiplayer`  | Multiplayer   | Real-time collaborative coding rooms     |
| `/profile`      | Profile       | Public developer portfolio               |

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

5. **Seed Demo Challenges** *(optional)*

   After logging in, go to `/challenges` and click the **↻** refresh icon to auto-seed 6 demo challenges.

## 🗺️ Future Roadmap

Check out our [Feature Roadmap](./FEATURE_ROADMAP.md) for planned features including GitHub integration, one-click deployments, and multi-file project support.

## 📜 License
MIT License - Developed by **Sameer Swami**
