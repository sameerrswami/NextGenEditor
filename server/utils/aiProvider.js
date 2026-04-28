const axios = require("axios");

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Calls Groq AI (Llama 3).
 * This is much faster and more reliable than OpenRouter's free tier.
 */
const callAI = async (prompt) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing in .env. Please get one for free at https://console.groq.com/");
  }

  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response from Groq");
    
    return content.trim();
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.error("Groq AI Error:", errorMsg);
    throw new Error(`AI Service failed: ${errorMsg}`);
  }
};

module.exports = { callAI };
