const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// Supported languages with their local execution config
const LANGUAGE_CONFIGS = {
  javascript: { cmd: 'node', ext: 'js', args: [] },
  typescript: { cmd: 'npx', ext: 'tsx', args: [] },
  python: { cmd: 'python', ext: 'py', args: [] },
  python3: { cmd: 'python3', ext: 'py', args: [] },
  cpp: { 
    cmd: 'g++', 
    ext: 'cpp', 
    args: ['-o', 'output.exe'], 
    isCompiled: true, 
    runCmd: 'output.exe' 
  },
  c: { 
    cmd: 'gcc', 
    ext: 'c', 
    args: ['-o', 'output.exe'], 
    isCompiled: true, 
    runCmd: 'output.exe' 
  },
  java: { 
    cmd: 'javac', 
    ext: 'java', 
    args: [], 
    isCompiled: true, 
    runCmd: 'java Main' 
  },
  php: { cmd: 'php', ext: 'php', args: [] },
};

function runLocalCode(codeText, config, input = '') {
  return new Promise((resolve, reject) => {
    const tmpDir = os.tmpdir();
    const id = Date.now();
    const fileName = `code_${id}.${config.ext}`;
    const filePath = path.join(tmpDir, fileName);
    const outputExeName = config.isCompiled ? `output_${id}.exe` : '';
    const outputExe = config.isCompiled ? path.join(tmpDir, outputExeName) : '';

    fs.writeFileSync(filePath, codeText);

    const startTime = Date.now();

    const execute = (cmd, args, isRunStep = true) => {
      return new Promise((res) => {
        const child = spawn(cmd, args, {
          cwd: tmpDir,
          timeout: 15000, // 15 second timeout
          shell: true // Use shell for Windows compatibility
        });

        let stdout = '';
        let stderr = '';

        if (isRunStep && input) {
          child.stdin.write(input);
          child.stdin.end();
        }

        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('close', (exitCode) => {
          res({ stdout, stderr, exitCode });
        });

        child.on('error', (err) => {
          res({ stdout, stderr, exitCode: -1, error: err.message });
        });
      });
    };

    (async () => {
      try {
        let finalOutput = '';
        let finalError = '';
        let exitCode = 0;

        if (config.isCompiled) {
          // Compilation step
          const compileArgs = config.args.map(arg => arg === 'output.exe' ? outputExeName : arg);
          const compileResult = await execute(config.cmd, [...compileArgs, fileName], false);
          
          if (compileResult.exitCode !== 0) {
            try { fs.unlinkSync(filePath); } catch (e) {}
            resolve({
              output: compileResult.stdout,
              error: `Compilation Error:\n${compileResult.stderr}`,
              executionTime: (Date.now() - startTime) / 1000,
              exitCode: compileResult.exitCode
            });
            return;
          }
          
          // Execution step
          const runResult = await execute(outputExe, []);
          finalOutput = runResult.stdout;
          finalError = runResult.stderr;
          exitCode = runResult.exitCode;
        } else {
          // Direct execution
          const runResult = await execute(config.cmd, [...config.args, fileName]);
          finalOutput = runResult.stdout;
          finalError = runResult.stderr;
          exitCode = runResult.exitCode;
        }

        const executionTime = (Date.now() - startTime) / 1000;
        
        // Clean up
        try { fs.unlinkSync(filePath); } catch (e) {}
        if (config.isCompiled && outputExe) {
          try { fs.unlinkSync(outputExe); } catch (e) {}
        }

        resolve({
          output: finalOutput,
          error: finalError,
          executionTime,
          exitCode
        });
      } catch (err) {
        try { fs.unlinkSync(filePath); } catch (e) {}
        if (config.isCompiled && outputExe) {
          try { fs.unlinkSync(outputExe); } catch (e) {}
        }
        reject(err);
      }
    })();
  });
}

// Run code
router.post('/run', authMiddleware, async (req, res) => {
  try {
    const { code, language, input = '' } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const langKey = language.toLowerCase();
    const config = LANGUAGE_CONFIGS[langKey];

    if (!config) {
      return res.status(400).json({ 
        error: `Language "${language}" is not supported for local execution. Supported: ${Object.keys(LANGUAGE_CONFIGS).join(', ')}` 
      });
    }

    const result = await runLocalCode(code, config, input);

    // Reward user with 2 coins for successful execution (non-blocking)
    if (result.exitCode === 0 && req.userId) {
      User.findByIdAndUpdate(req.userId, { $inc: { coins: 2 } })
        .catch(err => console.error("[Code] Coin Reward Error:", err));
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
