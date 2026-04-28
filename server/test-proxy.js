const axios = require('axios');

async function test() {
  try {
    const reg = await axios.post('http://localhost:3000/api/auth/register', {
      username: 'clienttest' + Date.now(),
      email: 'ct' + Date.now() + '@test.com',
      password: 'testpass123'
    });
    const token = reg.data.token;
    console.log('Registered via client proxy');
    const res = await axios.post('http://localhost:3000/api/code/run', {
      code: 'console.log("proxy test");',
      language: 'javascript',
      input: ''
    }, { headers: { Authorization: 'Bearer ' + token } });
    console.log('CODE VIA PROXY:', res.data.output, 'time:', res.data.executionTime);
  } catch (e) {
    console.error('PROXY FAILED:', e.response?.data || e.message);
  }
}

test();

