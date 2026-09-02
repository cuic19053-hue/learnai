const http = require('http');
const fs = require('fs');
let text = process.argv[2] || 'No message provided';

if (fs.existsSync(text)) {
  try {
    text = fs.readFileSync(text, 'utf8');
  } catch(e) {}
} else {
  text = text.replace(/\\n/g, '\n');
}

const data = JSON.stringify({ text });

const options = {
  hostname: 'localhost',
  port: 3888,
  path: '/api/ai_reply',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  console.log(`Push successful: statusCode ${res.statusCode}`);
});

req.on('error', (e) => {
  console.error(`Problem pushing message: ${e.message}`);
});

req.write(data);
req.end();
