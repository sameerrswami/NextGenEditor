const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

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
    exitCode: isError ? 1 : 0
  };
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

    const langKey = language.toLowerCase();
    if (!JUDGE0_LANG_MAP[langKey]) return res.status(400).json({ error: `Language ${language} not supported` });

    const results = [];
    let allPassed = true;

    for (const tc of challenge.testCases) {
      const { output, error, exitCode } = await runCloudCode(code, language, tc.input);
      const expected = tc.expectedOutput.trim();
      const actual = output.trim();
      const passed = actual === expected && exitCode === 0;
      if (!passed) allPassed = false;
      results.push({ input: tc.input, expected, actual, passed, error: error || '' });
    }

    let earnedCoins = 0;
    let earnedBadges = [];
    if (allPassed) {
      earnedCoins = challenge.points;
      const user = await User.findById(req.userId);
      user.coins += earnedCoins;
      user.solvedChallenges = (user.solvedChallenges || 0) + 1;
      
      const badgesToAward = [
        { count: 1, name: 'Novice Coder' },
        { count: 10, name: 'Intermediate Coder' },
        { count: 25, name: 'Advanced Coder' },
        { count: 50, name: 'Expert Coder' },
        { count: 100, name: 'Algorithm Master' }
      ];
      
      for (const b of badgesToAward) {
        if (user.solvedChallenges === b.count && !user.badges.includes(b.name)) {
          user.badges.push(b.name);
          earnedBadges.push(b.name);
        }
      }
      
      await user.save();
    }

    res.json({
      passed: allPassed,
      results,
      earnedCoins,
      earnedBadges,
      message: allPassed 
        ? `🎉 All test cases passed! +${earnedCoins} coins${earnedBadges.length > 0 ? ` 🏅 Earned Badge: ${earnedBadges.join(', ')}` : ''}` 
        : '❌ Some test cases failed. Keep trying!',
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

    const HELLO_WORLD_CODE = {
      javascript: 'console.log("Hello, World!");',
      typescript: 'console.log("Hello, World!");',
      python: 'print("Hello, World!")',
      cpp: '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
      c: '#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
      java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
      go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
      rust: 'fn main() {\n    println!("Hello, World!");\n}',
      php: '<?php\necho "Hello, World!\\n";\n?>',
      ruby: 'puts "Hello, World!"'
    };

    const SUM_TWO_NUMBERS_CODE = {
      javascript: 'const [a,b] = require("fs").readFileSync("/dev/stdin","utf8").trim().split(" ").map(Number);\nconsole.log(a+b);',
      typescript: 'const [a,b] = require("fs").readFileSync("/dev/stdin","utf8").trim().split(" ").map(Number);\nconsole.log(a+b);',
      python: 'a,b=map(int,input().split())\nprint(a+b)',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}',
      c: '#include <stdio.h>\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    printf("%d\\n", a + b);\n    return 0;\n}',
      java: 'import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a + b);\n        sc.close();\n    }\n}',
      go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    var a, b int\n    fmt.Scanf("%d %d", &a, &b)\n    fmt.Println(a + b)\n}',
      rust: 'use std::io::{self, BufRead};\nfn main() {\n    let stdin = io::stdin();\n    let line = stdin.lock().lines().next().unwrap().unwrap();\n    let nums: Vec<i32> = line.split_whitespace().map(|x| x.parse().unwrap()).collect();\n    println!("{}", nums[0] + nums[1]);\n}',
      php: '<?php\n$line = trim(fgets(STDIN));\nlist($a, $b) = array_map(\'intval\', explode(\' \', $line));\necho ($a + $b) . "\\n";\n?>',
      ruby: 'a, b = gets.split.map(&:to_i)\nputs a + b'
    };

    const GENERIC_CODE = {
      javascript: '// Write your solution here\nconst input = require("fs").readFileSync("/dev/stdin","utf8").trim();',
      typescript: '// Write your solution here\nconst input = require("fs").readFileSync("/dev/stdin","utf8").trim();',
      python: '# Write your solution here\ninput_data = input().strip()',
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    // Write your solution here\n    return 0;\n}',
      c: '#include <stdio.h>\n#include <string.h>\nint main() {\n    // Write your solution here\n    return 0;\n}',
      java: 'import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution here\n        sc.close();\n    }\n}',
      go: 'package main\n\nimport (\n    "bufio"\n    "fmt"\n    "os"\n)\n\nfunc main() {\n    reader := bufio.NewReader(os.Stdin)\n    // Write your solution here\n    _ = reader\n}',
      rust: 'use std::io::{self, BufRead};\nfn main() {\n    let stdin = io::stdin();\n    // Write your solution here\n}',
      php: '<?php\n// Write your solution here\n$input = trim(fgets(STDIN));\n?>',
      ruby: '# Write your solution here\ninput = gets.chomp'
    };

    const demos = [
      {
        title: 'Hello World',
        description: 'Print "Hello, World!" to the console.',
        difficulty: 'Easy',
        points: 10,
        starterCode: HELLO_WORLD_CODE,
        testCases: [{ input: '', expectedOutput: 'Hello, World!' }],
      },
      {
        title: 'Sum of Two Numbers',
        description: 'Read two integers from input (space-separated on one line) and print their sum.',
        difficulty: 'Easy',
        points: 20,
        starterCode: SUM_TWO_NUMBERS_CODE,
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
        starterCode: GENERIC_CODE,
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
        starterCode: GENERIC_CODE,
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
        starterCode: GENERIC_CODE,
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
        starterCode: GENERIC_CODE,
        testCases: [
          { input: 'Hello World', expectedOutput: 'World Hello' },
          { input: 'The quick brown fox', expectedOutput: 'fox brown quick The' },
        ],
      },
      {
        title: 'Factorial',
        description: 'Calculate the factorial of a given non-negative integer N. Input is a single integer.',
        difficulty: 'Easy',
        points: 20,
        starterCode: GENERIC_CODE,
        testCases: [
          { input: '5', expectedOutput: '120' },
          { input: '0', expectedOutput: '1' },
          { input: '3', expectedOutput: '6' },
        ],
      },
      {
        title: 'FizzBuzz',
        description: 'Print numbers from 1 to N. For multiples of 3, print "Fizz" instead of the number. For multiples of 5, print "Buzz". For numbers which are multiples of both 3 and 5, print "FizzBuzz". Input is N.',
        difficulty: 'Easy',
        points: 30,
        starterCode: GENERIC_CODE,
        testCases: [
          { input: '15', expectedOutput: '1\\n2\\nFizz\\n4\\nBuzz\\nFizz\\n7\\n8\\nFizz\\nBuzz\\n11\\nFizz\\n13\\n14\\nFizzBuzz' },
        ],
      },
      {
        title: 'Find Maximum in Array',
        description: 'Find the maximum value in an array of space-separated integers. Input is a single line of integers.',
        difficulty: 'Easy',
        points: 15,
        starterCode: GENERIC_CODE,
        testCases: [
          { input: '3 5 1 8 4', expectedOutput: '8' },
          { input: '-10 -20 -5 -30', expectedOutput: '-5' },
        ],
      },
      {
        title: 'Anagram Check',
        description: 'Given two words separated by a space, print "YES" if they are anagrams, "NO" otherwise.',
        difficulty: 'Medium',
        points: 40,
        starterCode: GENERIC_CODE,
        testCases: [
          { input: 'listen silent', expectedOutput: 'YES' },
          { input: 'hello world', expectedOutput: 'NO' },
        ],
      },
      {
        title: 'Vowel Count',
        description: 'Count the number of vowels (a, e, i, o, u) in a given string. Input is a single line string. Output the integer count.',
        difficulty: 'Easy',
        points: 15,
        starterCode: GENERIC_CODE,
        testCases: [
          { input: 'hello world', expectedOutput: '3' },
          { input: 'rhythm', expectedOutput: '0' },
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
