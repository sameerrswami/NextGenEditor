# NextGenEditor - AI-Powered Collaborative Coding Platform 🚀

**NextGenEditor** is a state-of-the-art, cyberpunk-themed coding environment designed for the modern developer. It combines a powerful code execution engine with real-time AI intelligence, a social ecosystem, and a coin-based gamification system.

![NextGenEditor Preview](https://via.placeholder.com/1200x600/020617/6366f1?text=NextGenEditor+AI+Intelligence)

## ✨ Core Features

### 🧠 AI Intelligence Panel
*   **Explain**: Get deep insights into complex code blocks.
*   **Analyze**: Optimize and identify potential bottlenecks.
*   **Convert**: Instantly translate code between 10+ languages.
*   **Advanced Debugger (Premium)**: Let AI find and fix your bugs for you.

### 💰 Coin-Based Economy
*   **Earn**: Get rewarded for coding! 
    *   +1 Coin for AI interactions.
    *   +2 Coins for successful code execution.
    *   +5 Coins for saving snippets.
*   **Unlock Premium**: Accumulate 10,000 coins to unlock the **Premium Tier**, featuring the Advanced Debugger and exclusive profile badges.

### 🌐 Social Developer Network
*   **Public Portfolios**: Share your coding journey with a public profile URL.
*   **Follow System**: Connect with other developers and track their progress.
*   **Profile Views**: See how many people are checking out your work.
*   **Custom Avatars**: Personalize your identity with PFP uploads.

### 💻 Powerful Editor
*   **Multi-Language Execution**: Support for Javascript, Python, C, C++, Java, Go, and Rust.
*   **Snippet Manager**: Save, search, and manage your reusable code blocks.
*   **Glassmorphism UI**: A premium, responsive design with neon accents and backdrop-blur effects.

## 🛠️ Tech Stack

### Frontend
*   **React (Vite)**: Lightning-fast frontend architecture.
*   **Tailwind CSS**: Modern utility-first styling with custom glassmorphism components.
*   **Lucide-React**: Sleek, professional iconography.
*   **Axios**: Secure and efficient API communication.
*   **Context API**: Global state management for Auth and Economy.

### Backend
*   **Node.js & Express**: Scalable server-side logic.
*   **MongoDB & Mongoose**: Flexible NoSQL database for users, snippets, and social data.
*   **Groq API**: High-speed AI inference using Llama 3 models.
*   **JWT (JSON Web Tokens)**: Secure, stateless authentication.
*   **Bcrypt.js**: Industry-standard password hashing.

## 📦 Important Libraries & Dependencies

### Server-Side
*   `express`: Core web framework.
*   `mongoose`: ODM for MongoDB.
*   `jsonwebtoken`: For secure authentication.
*   `bcryptjs`: For data security.
*   `axios`: For Groq AI API integration.
*   `cors`: For handling cross-origin requests.

### Client-Side
*   `lucide-react`: For the premium icon set.
*   `axios`: For all backend interactions.
*   `react-router-dom`: For client-side routing.

## 🔑 Key Functions

### Backend
*   `callAI(prompt)`: Standardized utility for communicating with the Groq AI engine.
*   `runLocalCode(code, lang)`: Securely executes user code and captures stdout/stderr.
*   `aiHandler`: A reusable higher-order function for processing different AI tool requests.

### Frontend
*   `refreshUser()`: Syncs the user's coins, premium status, and profile data across all components.
*   `handleAIAction()`: The main engine in `AIPanel` that manages tool execution and coin rewards.
*   `handleSaveSnippet()`: Manages code persistence and awards bonus coins.

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

3. **Install Dependencies**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

4. **Run Development Mode**
   ```bash
   # Terminal 1 (Server)
   npm run dev
   
   # Terminal 2 (Client)
   npm run dev
   ```

## 📜 License
MIT License - Developed by **Sameer Swami**
