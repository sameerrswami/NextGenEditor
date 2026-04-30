const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const Challenge = require('../models/Challenge');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

// ── Inline code runner (same pattern as code.js) ──────────────────────────
const LANGUAGE_CONFIGS = {
  javascript: { cmd: 'node', ext: 'js', args: [] },
  python:     { cmd: 'python', ext: 'py', args: [] },
  cpp:        { cmd: 'g++', ext: 'cpp', args: ['-o', 'output.exe'], isCompiled: true, runCmd: 'output.exe' },
  c:          { cmd: 'gcc', ext: 'c',   args: ['-o', 'output.exe'], isCompiled: true, runCmd: 'output.exe' },
  java:       { cmd: 'javac', ext: 'java', args: [], isCompiled: true, runCmd: 'java Main' },
};

function runCode(codeText, config, input = '') {
  return new Promise((resolve) => {
    const tmpDir = os.tmpdir();
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const fileName = `code_${id}.${config.ext}`;
    const filePath = path.join(tmpDir, fileName);
    const outputExeName = config.isCompiled ? `output_${id}.exe` : '';
    const outputExe = config.isCompiled ? path.join(tmpDir, outputExeName) : '';

    fs.writeFileSync(filePath, codeText);

    const execute = (cmd, args, withInput = false) => new Promise((res) => {
      const child = spawn(cmd, args, { cwd: tmpDir, timeout: 10000, shell: true });
      let stdout = '', stderr = '';
      if (withInput && input) { child.stdin.write(input); child.stdin.end(); }
      child.stdout.on('data', d => stdout += d.toString());
      child.stderr.on('data', d => stderr += d.toString());
      child.on('close', exitCode => res({ stdout, stderr, exitCode }));
      child.on('error', err => res({ stdout, stderr, exitCode: -1, error: err.message }));
    });

    (async () => {
      try {
        let output = '', error = '', exitCode = 0;
        if (config.isCompiled) {
          const compileArgs = config.args.map(a => a === 'output.exe' ? outputExeName : a);
          const cr = await execute(config.cmd, [...compileArgs, fileName], false);
          if (cr.exitCode !== 0) {
            try { fs.unlinkSync(filePath); } catch (_) {}
            return resolve({ output: '', error: cr.stderr, exitCode: cr.exitCode });
          }
          const rr = await execute(outputExe, [], true);
          output = rr.stdout; error = rr.stderr; exitCode = rr.exitCode;
        } else {
          const rr = await execute(config.cmd, [...config.args, fileName], true);
          output = rr.stdout; error = rr.stderr; exitCode = rr.exitCode;
        }
        try { fs.unlinkSync(filePath); } catch (_) {}
        if (outputExe) try { fs.unlinkSync(outputExe); } catch (_) {}
        resolve({ output: output.trim(), error, exitCode });
      } catch (err) {
        try { fs.unlinkSync(filePath); } catch (_) {}
        resolve({ output: '', error: err.message, exitCode: -1 });
      }
    })();
  });
}

// ── GET /api/challenges - list all ─────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ difficulty: 1, createdAt: -1 });
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching challenges' });
  }
});

// ── GET /api/challenges/:id - single challenge ──────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    res.json(challenge);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/challenges - create (admin / demo) ────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, difficulty, points, testCases, starterCode } = req.body;
    const challenge = new Challenge({ title, description, difficulty, points, testCases, starterCode });
    await challenge.save();
    res.status(201).json(challenge);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});

// ── POST /api/challenges/:id/submit - run against test cases ────────────────
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { code, language = 'javascript' } = req.body;
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    const config = LANGUAGE_CONFIGS[language.toLowerCase()];
    if (!config) return res.status(400).json({ error: `Language ${language} not supported` });

    const results = [];
    let allPassed = true;

    for (const tc of challenge.testCases) {
      const { output, error, exitCode } = await runCode(code, config, tc.input);
      const expected = tc.expectedOutput.trim();
      const actual = output.trim();
      const passed = actual === expected && exitCode === 0;
      if (!passed) allPassed = false;
      results.push({ input: tc.input, expected, actual, passed, error: error || '' });
    }

    let earnedCoins = 0;
    if (allPassed) {
      earnedCoins = challenge.points;
      await User.findByIdAndUpdate(req.userId, { $inc: { coins: earnedCoins } });
    }

    res.json({
      passed: allPassed,
      results,
      earnedCoins,
      message: allPassed ? `🎉 All test cases passed! +${earnedCoins} coins` : '❌ Some test cases failed. Keep trying!',
    });
  } catch (err) {
    console.error('Challenge submit error:', err);
    res.status(500).json({ error: 'Server error on submission' });
  }
});

// ── POST /api/challenges/seed - seed demo challenges ────────────────────────
router.post('/seed/demo', auth, async (req, res) => {
  try {
    const count = await Challenge.countDocuments();
    if (count > 0) return res.json({ message: 'Challenges already seeded' });

    const demos = [
      {
        title: 'Hello World',
        description: 'Print "Hello, World!" to the console.',
        difficulty: 'Easy',
        points: 10,
        starterCode: { javascript: 'console.log("");', python: 'print("")' },
        testCases: [{ input: '', expectedOutput: 'Hello, World!' }],
      },
      {
        title: 'Sum of Two Numbers',
        description: 'Read two integers from input (space-separated on one line) and print their sum.',
        difficulty: 'Easy',
        points: 20,
        starterCode: {
          javascript: 'const [a,b] = require("fs").readFileSync("/dev/stdin","utf8").trim().split(" ").map(Number);\nconsole.log(a+b);',
          python: 'a,b=map(int,input().split())\nprint(a+b)',
        },
        testCases: [
          { input: '3 5', expectedOutput: '8' },
          { input: '10 20', expectedOutput: '30' },
        ],
      },
      {
        title: 'Fibonacci Sequence',
        description: 'Print the first N Fibonacci numbers (one per line). N is given as input.',
        difficulty: 'Medium',
        points: 50,
        starterCode: { javascript: '// Write your solution here', python: '# Write your solution here' },
        testCases: [
          { input: '5', expectedOutput: '0\n1\n1\n2\n3' },
          { input: '1', expectedOutput: '0' },
        ],
      },
      {
        title: 'Palindrome Check',
        description: 'Read a string from input and print "YES" if it is a palindrome, "NO" otherwise.',
        difficulty: 'Easy',
        points: 30,
        starterCode: { javascript: '// Write your solution here', python: '# Write your solution here' },
        testCases: [
          { input: 'racecar', expectedOutput: 'YES' },
          { input: 'hello', expectedOutput: 'NO' },
        ],
      },
      {
        title: 'Prime Numbers',
        description: 'Given N, print all prime numbers up to and including N, each on a new line.',
        difficulty: 'Medium',
        points: 75,
        starterCode: { javascript: '// Write your solution here', python: '# Write your solution here' },
        testCases: [
          { input: '10', expectedOutput: '2\n3\n5\n7' },
          { input: '2', expectedOutput: '2' },
        ],
      },
      {
        title: 'Reverse Words',
        description: 'Reverse the words in a sentence. Input is a single line of text.',
        difficulty: 'Easy',
        points: 25,
        starterCode: { javascript: '// Write your solution here', python: '# Write your solution here' },
        testCases: [
          { input: 'Hello World', expectedOutput: 'World Hello' },
          { input: 'The quick brown fox', expectedOutput: 'fox brown quick The' },
        ],
      },
    ];

    await Challenge.insertMany(demos);
    res.json({ message: `Seeded ${demos.length} demo challenges!` });
  } catch (err) {
    res.status(500).json({ error: 'Seed failed' });
  }
});

module.exports = router;
