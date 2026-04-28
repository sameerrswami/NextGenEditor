const axios = require('axios');

const API = 'http://localhost:5000/api';

async function test() {
  try {
    // Register a test user
    let token;
    try {
      const reg = await axios.post(`${API}/auth/register`, {
        username: 'testuser' + Date.now(),
        email: `test${Date.now()}@test.com`,
        password: 'testpass123'
      });
      token = reg.data.token;
      console.log('Registered and got token');
    } catch (e) {
      // Maybe user exists, try login
      console.log('Register failed, trying login...');
      const login = await axios.post(`${API}/auth/login`, {
        email: 'test@test.com',
        password: 'testpass123'
      });
      token = login.data.token;
      console.log('Logged in and got token');
    }

    // Test code execution
    const res = await axios.post(`${API}/code/run`, {
      code: 'console.log("Hello from Piston!");',
      language: 'javascript',
      input: ''
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('\n=== CODE EXECUTION RESULT ===');
    console.log('Output:', res.data.output);
    console.log('Error:', res.data.error || 'none');
    console.log('Execution Time:', res.data.executionTime);
    console.log('\nSUCCESS! Code execution is working.');
  } catch (err) {
    console.error('\nFAILED:', err.response?.data || err.message);
  }
}

test();

