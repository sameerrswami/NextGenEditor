const jwt = require('jsonwebtoken');
const axios = require('axios');

const token = jwt.sign({ userId: 'test123' }, 'fallbacksecret');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/code/run', {
      code: 'console.log("Hello from Piston!");',
      language: 'javascript',
      input: ''
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('SUCCESS:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('FAILED:', err.response?.data || err.message);
  }
}

test();

