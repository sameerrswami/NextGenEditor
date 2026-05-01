const express = require('express');
const router = express.Router();
const User = require('../models/User');
const History = require('../models/History');
const authMiddleware = require('../middleware/authMiddleware');

const JUDGE0_LANG_MAP = {
  javascript: 102, // Node 22
  typescript: 101, // TS 5.6
  python: 100,     // Python 3.12
  python3: 100,
  cpp: 105,        // C++ GCC 14.1
  c: 103,          // C GCC 14.1
  java: 91,        // Java 17
  go: 107,         // Go 1.23
  rust: 108,       // Rust 1.85
  php: 98,         // PHP 8.3
  ruby: 72         // Ruby 3.3
};

async function runCloudCode(codeText, language, input = '') {
  const language_id = JUDGE0_LANG_MAP[language.toLowerCase()];
  if (!language_id) throw new Error('Unsupported language: ' + language);

  const response = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_code: codeText,
      language_id: language_id,
      stdin: input
    })
  });
  
  if (!response.ok) {
    throw new Error('Cloud execution API returned ' + response.status);
  }
  
  const result = await response.json();
  const isError = result.status?.id > 3;
  
  const finalOutput = result.stdout || '';
  const finalError = result.stderr || result.compile_output || (isError ? result.status?.description : '');
  
  return {
    output: finalOutput,
    error: finalError,
    executionTime: parseFloat(result.time || '0'),
    exitCode: isError ? 1 : 0
  };
}

// Run code
router.post('/run', authMiddleware, async (req, res) => {
  try {
    const { code, language, input = '' } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const langKey = language.toLowerCase();
    if (!JUDGE0_LANG_MAP[langKey]) {
      return res.status(400).json({ 
        error: `Language "${language}" is not supported. Supported: ${Object.keys(JUDGE0_LANG_MAP).join(', ')}` 
      });
    }

    const result = await runCloudCode(code, language, input);

    if (req.userId) {
      // Reward user with 2 coins for successful execution (non-blocking)
      if (result.exitCode === 0) {
        User.findByIdAndUpdate(req.userId, { $inc: { coins: 2 } })
          .catch(err => console.error("[Code] Coin Reward Error:", err));
      }


      // Save to history
      const historyEntry = new History({
        userId: req.userId,
        code,
        language,
        input,
        output: result.output,
        error: result.error,
        executionTime: result.executionTime
      });
      historyEntry.save().catch(err => console.error("[Code] History Save Error:", err));
    }

    res.json({
      output: result.output,
      error: result.error,
      executionTime: result.executionTime,
      exitCode: result.exitCode
    });
  } catch (err) {
    console.error('Code execution error:', err.message);
    res.status(500).json({ error: `Code execution failed: ${err.message}` });
  }
});

module.exports = router;
