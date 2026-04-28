const axios = require('axios');

async function test() {
  try {
    const r = await axios.post('http://localhost:5000/api/auth/register', {
      username: 'pyuser' + Date.now(),
      email: 'py' + Date.now() + '@t.com',
      password: 'testpass123'
    });
    const res = await axios.post('http://localhost:5000/api/code/run', {
      code: 'print("Python works!")\nfor i in range(3):\n    print(i)',
      language: 'python',
      input: ''
    }, {
      headers: { Authorization: 'Bearer ' + r.data.token }
    });
    console.log('Output:', res.data.output);
    console.log('Error:', res.data.error || 'none');
    console.log('Time:', res.data.executionTime);
  } catch (e) {
    console.error(e.response?.data || e.message);
  }
}

test();

