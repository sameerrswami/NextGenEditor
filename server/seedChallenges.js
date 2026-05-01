const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Challenge = require('./models/Challenge');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nextgeneditor')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

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
  csharp: 'using System;\nclass Program {\n    static void Main() {\n        // Write your solution here\n    }\n}',
  ruby: '# Write your solution here\ninput = gets.chomp'
};

const NOT_SUPPORTED_CODE = {
  javascript: 'console.log("Not Supported");',
  typescript: 'console.log("Not Supported");',
  python: 'print("Not Supported")',
  cpp: '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Not Supported" << endl;\n    return 0;\n}',
  c: '#include <stdio.h>\nint main() {\n    printf("Not Supported\\n");\n    return 0;\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Not Supported");\n    }\n}',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Not Supported")\n}',
  rust: 'fn main() {\n    println!("Not Supported");\n}',
  php: '<?php\necho "Not Supported\\n";\n?>',
  csharp: 'using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Not Supported");\n    }\n}',
  ruby: 'puts "Not Supported"'
};

const additionalChallenges = [
  {
    title: 'Sum of Array',
    description: 'Find the sum of all elements in an array. Input is a line of space-separated integers.',
    difficulty: 'Easy',
    points: 15,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '1 2 3 4 5', expectedOutput: '15' }]
  },
  {
    title: 'Even or Odd',
    description: 'Given an integer, print "Even" if it is even, or "Odd" if it is odd.',
    difficulty: 'Easy',
    points: 10,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '4', expectedOutput: 'Even' }, { input: '7', expectedOutput: 'Odd' }]
  },
  {
    title: 'Find Minimum in Array',
    description: 'Find the minimum value in an array of space-separated integers.',
    difficulty: 'Easy',
    points: 15,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '3 5 1 8 4', expectedOutput: '1' }]
  },
  {
    title: 'String Length',
    description: 'Print the length of a given string.',
    difficulty: 'Easy',
    points: 10,
    starterCode: GENERIC_CODE,
    testCases: [{ input: 'hello world', expectedOutput: '11' }]
  },
  {
    title: 'Count Words',
    description: 'Count the number of words in a space-separated string.',
    difficulty: 'Easy',
    points: 15,
    starterCode: GENERIC_CODE,
    testCases: [{ input: 'The quick brown fox', expectedOutput: '4' }]
  },
  {
    title: 'Sort Array',
    description: 'Sort an array of space-separated integers in ascending order. Output the sorted array space-separated.',
    difficulty: 'Medium',
    points: 30,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '5 3 8 1', expectedOutput: '1 3 5 8' }]
  },
  {
    title: 'Count Consonants',
    description: 'Count the number of consonants in a string (ignore spaces and non-letters).',
    difficulty: 'Easy',
    points: 20,
    starterCode: GENERIC_CODE,
    testCases: [{ input: 'hello world', expectedOutput: '7' }]
  },
  {
    title: 'Second Largest Element',
    description: 'Find the second largest integer in a space-separated array.',
    difficulty: 'Medium',
    points: 35,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '3 5 1 8 4', expectedOutput: '5' }]
  },
  {
    title: 'Power of Two',
    description: 'Given an integer N, print "YES" if it is a power of 2, otherwise "NO".',
    difficulty: 'Easy',
    points: 20,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '16', expectedOutput: 'YES' }, { input: '14', expectedOutput: 'NO' }]
  },
  {
    title: 'Nth Triangle Number',
    description: 'Find the Nth triangle number. Input is N.',
    difficulty: 'Easy',
    points: 20,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '4', expectedOutput: '10' }]
  },
  {
    title: 'Reverse Array',
    description: 'Reverse a space-separated array of integers and output it.',
    difficulty: 'Easy',
    points: 15,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '1 2 3 4', expectedOutput: '4 3 2 1' }]
  },
  {
    title: 'Is Leap Year',
    description: 'Given a year, print "YES" if it is a leap year, otherwise "NO".',
    difficulty: 'Easy',
    points: 15,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '2020', expectedOutput: 'YES' }, { input: '2021', expectedOutput: 'NO' }]
  },
  {
    title: 'Calculate Average',
    description: 'Calculate the average of an array of space-separated integers. Output as a decimal or integer depending on exact result.',
    difficulty: 'Medium',
    points: 25,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '2 4 6 8', expectedOutput: '5' }]
  },
  {
    title: 'Decimal to Binary',
    description: 'Convert a given decimal number into its binary representation.',
    difficulty: 'Medium',
    points: 30,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '10', expectedOutput: '1010' }]
  },
  {
    title: 'Binary to Decimal',
    description: 'Convert a given binary string into its decimal representation.',
    difficulty: 'Medium',
    points: 30,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '1010', expectedOutput: '10' }]
  },
  {
    title: 'Find Missing Number',
    description: 'Given an array containing N-1 integers from 1 to N, find the missing integer.',
    difficulty: 'Hard',
    points: 50,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '1 2 4 5', expectedOutput: '3' }]
  },
  {
    title: 'Find Duplicates',
    description: 'Given an array of space-separated integers, output any integer that appears more than once (if multiple, separate by space). If none, output "NONE".',
    difficulty: 'Medium',
    points: 35,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '1 2 3 2', expectedOutput: '2' }]
  },
  {
    title: 'Majority Element',
    description: 'Find the element that appears more than N/2 times in the array. Output it.',
    difficulty: 'Hard',
    points: 55,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '2 2 1 1 1 2 2', expectedOutput: '2' }]
  },
  {
    title: 'Two Sum',
    description: 'Given an array and a target sum (on the second line), print "YES" if two numbers in the array add up to the sum, else "NO".',
    difficulty: 'Medium',
    points: 40,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '2 7 11 15\\n9', expectedOutput: 'YES' }]
  },
  {
    title: 'Pangram Check',
    description: 'Print "YES" if the input string is a pangram (contains all letters of the alphabet), else "NO".',
    difficulty: 'Medium',
    points: 40,
    starterCode: GENERIC_CODE,
    testCases: [{ input: 'the quick brown fox jumps over the lazy dog', expectedOutput: 'YES' }]
  },
  {
    title: 'First Non-Repeating Character',
    description: 'Find the first non-repeating character in a string and print it. If none, print "NONE".',
    difficulty: 'Medium',
    points: 45,
    starterCode: GENERIC_CODE,
    testCases: [{ input: 'swiss', expectedOutput: 'w' }]
  },
  {
    title: 'Longest Word',
    description: 'Given a sentence, print the longest word in it.',
    difficulty: 'Easy',
    points: 25,
    starterCode: GENERIC_CODE,
    testCases: [{ input: 'hello beautiful world', expectedOutput: 'beautiful' }]
  },
  {
    title: 'Remove Duplicates',
    description: 'Remove duplicate elements from a space-separated sorted array and print the unique elements space-separated.',
    difficulty: 'Medium',
    points: 30,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '1 1 2 2 3', expectedOutput: '1 2 3' }]
  },
  {
    title: 'GCD of Two Numbers',
    description: 'Find the Greatest Common Divisor (GCD) of two space-separated numbers.',
    difficulty: 'Easy',
    points: 20,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '12 15', expectedOutput: '3' }]
  },
  {
    title: 'LCM of Two Numbers',
    description: 'Find the Least Common Multiple (LCM) of two space-separated numbers.',
    difficulty: 'Medium',
    points: 30,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '12 15', expectedOutput: '60' }]
  },
  {
    title: 'Count Digits',
    description: 'Count the number of digits in an integer.',
    difficulty: 'Easy',
    points: 15,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '12345', expectedOutput: '5' }]
  },
  {
    title: 'Sum of Digits',
    description: 'Find the sum of all digits in an integer.',
    difficulty: 'Easy',
    points: 20,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '12345', expectedOutput: '15' }]
  },
  {
    title: 'Armstrong Number',
    description: 'Print "YES" if a given number is an Armstrong number (e.g. 153 = 1^3 + 5^3 + 3^3), otherwise "NO".',
    difficulty: 'Medium',
    points: 40,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '153', expectedOutput: 'YES' }, { input: '123', expectedOutput: 'NO' }]
  },
  {
    title: 'Check Perfect Number',
    description: 'Print "YES" if a number is a perfect number (sum of its proper divisors equals the number), else "NO".',
    difficulty: 'Medium',
    points: 35,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '28', expectedOutput: 'YES' }]
  },
  {
    title: 'Pascal Triangle Row',
    description: 'Given an index N (0-indexed), print the Nth row of Pascal\'s triangle space-separated.',
    difficulty: 'Hard',
    points: 60,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '3', expectedOutput: '1 3 3 1' }]
  },
  {
    title: 'Happy Number',
    description: 'Print "YES" if the number is a Happy Number, else "NO".',
    difficulty: 'Hard',
    points: 65,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '19', expectedOutput: 'YES' }]
  },
  {
    title: 'Move Zeroes',
    description: 'Given an array, move all 0s to the end while maintaining the relative order of non-zero elements. Output the array.',
    difficulty: 'Medium',
    points: 45,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '0 1 0 3 12', expectedOutput: '1 3 12 0 0' }]
  },
  {
    title: 'Contains Duplicate',
    description: 'Given an array of integers, print "YES" if any value appears at least twice in the array, and print "NO" if every element is distinct.',
    difficulty: 'Easy',
    points: 20,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '1 2 3 1', expectedOutput: 'YES' }]
  },
  {
    title: 'Power of Three',
    description: 'Print "YES" if a number is a power of three, else "NO".',
    difficulty: 'Easy',
    points: 20,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '27', expectedOutput: 'YES' }]
  },
  {
    title: 'Valid Parentheses',
    description: 'Given a string containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. Output "YES" or "NO".',
    difficulty: 'Hard',
    points: 75,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '()[]{}', expectedOutput: 'YES' }, { input: '(]', expectedOutput: 'NO' }]
  },
  {
    title: 'Length of Last Word',
    description: 'Given a string consisting of words and spaces, return the length of the last word in the string.',
    difficulty: 'Easy',
    points: 20,
    starterCode: GENERIC_CODE,
    testCases: [{ input: 'Hello World', expectedOutput: '5' }]
  },
  {
    title: 'Plus One',
    description: 'Given an array representing a large integer, increment it by one and output the resulting array.',
    difficulty: 'Medium',
    points: 40,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '1 2 3', expectedOutput: '1 2 4' }, { input: '9 9', expectedOutput: '1 0 0' }]
  },
  {
    title: 'Square Root',
    description: 'Given a non-negative integer x, compute and return the square root of x, truncated to an integer.',
    difficulty: 'Medium',
    points: 35,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '8', expectedOutput: '2' }]
  },
  {
    title: 'Climbing Stairs',
    description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    difficulty: 'Hard',
    points: 70,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '3', expectedOutput: '3' }]
  },
  {
    title: 'Remove Element',
    description: 'Given an array and a value (on the second line), output the array after removing all instances of the value.',
    difficulty: 'Easy',
    points: 25,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '3 2 2 3\\n3', expectedOutput: '2 2' }]
  },
  {
    title: 'Merge Sorted Array',
    description: 'Given two sorted arrays (one per line), merge them into a single sorted array.',
    difficulty: 'Medium',
    points: 45,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '1 2 3\\n2 5 6', expectedOutput: '1 2 2 3 5 6' }]
  },
  {
    title: 'Single Number',
    description: 'Given a non-empty array of integers where every element appears twice except for one. Find that single one.',
    difficulty: 'Medium',
    points: 45,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '4 1 2 1 2', expectedOutput: '4' }]
  },
  {
    title: 'Intersection of Two Arrays',
    description: 'Given two arrays (one per line), output their intersection space-separated.',
    difficulty: 'Medium',
    points: 40,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '1 2 2 1\\n2 2', expectedOutput: '2 2' }]
  },
  {
    title: 'Reverse Vowels',
    description: 'Given a string, reverse only all the vowels in the string and return it.',
    difficulty: 'Hard',
    points: 60,
    starterCode: GENERIC_CODE,
    testCases: [{ input: 'hello', expectedOutput: 'holle' }]
  },
  {
    title: 'Valid Perfect Square',
    description: 'Print "YES" if a given positive integer is a perfect square, else "NO".',
    difficulty: 'Easy',
    points: 20,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '16', expectedOutput: 'YES' }, { input: '14', expectedOutput: 'NO' }]
  },
  {
    title: 'Sum of Left Leaves',
    description: 'Just print "Not Supported"',
    difficulty: 'Hard',
    points: 10,
    starterCode: NOT_SUPPORTED_CODE,
    testCases: [{ input: '1', expectedOutput: 'Not Supported' }]
  },
  {
    title: 'Capitalize Title',
    description: 'Capitalize the first letter of each word in a string. Convert other letters to lowercase.',
    difficulty: 'Medium',
    points: 30,
    starterCode: GENERIC_CODE,
    testCases: [{ input: 'heLlo woRld', expectedOutput: 'Hello World' }]
  },
  {
    title: 'Find Pivot Index',
    description: 'Given an array of integers, calculate the pivot index. If none, output -1.',
    difficulty: 'Hard',
    points: 65,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '1 7 3 6 5 6', expectedOutput: '3' }]
  },
  {
    title: 'Replace Elements with Greatest on Right',
    description: 'Given an array, replace every element with the greatest element among the elements to its right, and replace the last element with -1.',
    difficulty: 'Hard',
    points: 70,
    starterCode: GENERIC_CODE,
    testCases: [{ input: '17 18 5 4 6 1', expectedOutput: '18 6 6 6 1 -1' }]
  },
  {
    title: 'To Lower Case',
    description: 'Given a string, return the string in lowercase.',
    difficulty: 'Easy',
    points: 10,
    starterCode: GENERIC_CODE,
    testCases: [{ input: 'Hello', expectedOutput: 'hello' }]
  }
];

const seed = async () => {
  try {
    const existingTitles = (await Challenge.find({}, 'title')).map(c => c.title);
    
    // Filter out challenges that already exist
    const newChallenges = additionalChallenges.filter(c => !existingTitles.includes(c.title));
    
    if (newChallenges.length > 0) {
      await Challenge.insertMany(newChallenges);
      console.log(`✅ Successfully seeded ${newChallenges.length} new challenges.`);
    } else {
      console.log('✅ All challenges already seeded.');
    }
    
    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding challenges:', err);
    process.exit(1);
  }
};

seed();
