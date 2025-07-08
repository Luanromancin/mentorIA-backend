const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  res.on('data', (chunk) => {
    console.log(`Body: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`Erro: ${e.message}`);
});

req.end(); 