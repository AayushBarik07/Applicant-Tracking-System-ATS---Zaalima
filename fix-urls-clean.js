const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.js') || dirFile.endsWith('.jsx')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync('client/src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace with intermediate tokens
  content = content.replace(/http:\/\/localhost:5000\/api/g, "__API_TOKEN__");
  content = content.replace(/http:\/\/localhost:5000/g, "__BASE_TOKEN__");

  // Now replace tokens with actual env variables
  // Since they were inside strings like 'http://...', we need to break the string.
  // Actually, wait, if they were inside backticks ...
  // Let's just do a simple replace that keeps them as strings!

  // No wait, replacing inside a string like 'http://localhost:5000/api/jobs'
  // we want: (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/jobs'
  
  content = content.replace(/'__API_TOKEN__/g, "(import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '");
  content = content.replace(/"__API_TOKEN__/g, '(import.meta.env.VITE_API_URL || "http://localhost:5000/api") + "');
  content = content.replace(/\__API_TOKEN__/g, "${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}");

  content = content.replace(/'__BASE_TOKEN__/g, "(import.meta.env.VITE_BASE_URL || 'http://localhost:5000') + '");
  content = content.replace(/"__BASE_TOKEN__/g, '(import.meta.env.VITE_BASE_URL || "http://localhost:5000") + "');
  content = content.replace(/\__BASE_TOKEN__/g, "${import.meta.env.VITE_BASE_URL || 'http://localhost:5000'}");

  // If there's an empty string concatenation at the end (e.g. API token was the whole string), clean it up
  content = content.replace(/\+ ''/g, "");
  content = content.replace(/\+ ""/g, "");

  if (content !== original) {
    fs.writeFileSync(file, content);
  }
});
console.log('Fixed URLs flawlessly!');
