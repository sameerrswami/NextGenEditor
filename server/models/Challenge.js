const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  points: { type: Number, required: true },
  starterCode: {
    javascript: { type: String, default: '// Write your solution here\n' },
    python:     { type: String, default: '# Write your solution here\n' },
    cpp:        { type: String, default: '// Write your solution here\n' },
  },
  testCases: [{
    input:          { type: String, default: '' },
    expectedOutput: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Challenge', challengeSchema);
