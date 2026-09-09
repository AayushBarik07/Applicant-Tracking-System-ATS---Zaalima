const fs = require('fs');
let content = fs.readFileSync('server/server.js', 'utf8');

// Update CORS to allow any origin dynamically
content = content.replace(
  /origin: \['http:\/\/localhost:3000', 'http:\/\/localhost:5173'\], \/\/ Restrict to frontend origins/,
  "origin: true, // Allow all origins for the Vercel deployment"
);

fs.writeFileSync('server/server.js', content);
console.log('CORS updated');
